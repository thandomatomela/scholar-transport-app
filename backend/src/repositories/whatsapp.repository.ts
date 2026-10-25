import { supabase } from "../config/supabase.js";

type IncomingWhatsAppMessage = {
  phoneNumber: string;
  displayName?: string | null;
  providerMessageId: string;
  messageType: string;
  body?: string | null;
  timestamp?: string | null;
  rawPayload: unknown;
};

export async function saveIncomingWhatsAppMessage(
  message: IncomingWhatsAppMessage,
) {
  const {
    data: contact,
    error: contactError,
  } = await supabase
    .from("whatsapp_contacts")
    .upsert(
      {
        phone_number: message.phoneNumber,
        display_name: message.displayName ?? null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "phone_number",
      },
    )
    .select()
    .single();

  if (contactError) {
    throw contactError;
  }

  const {
    data: existingConversation,
    error: conversationLookupError,
  } = await supabase
    .from("whatsapp_conversations")
    .select("*")
    .eq("contact_id", contact.id)
    .maybeSingle();

  if (conversationLookupError) {
    throw conversationLookupError;
  }

  let conversation = existingConversation;

  if (!conversation) {
    const {
      data: createdConversation,
      error: createConversationError,
    } = await supabase
      .from("whatsapp_conversations")
      .insert({
        contact_id: contact.id,
        last_message_at: message.timestamp
          ? new Date(
              Number(message.timestamp) * 1000,
            ).toISOString()
          : new Date().toISOString(),
        last_message_preview:
          message.body?.slice(0, 200) ?? null,
        unread_count: 0,
      })
      .select()
      .single();

    if (createConversationError) {
      throw createConversationError;
    }

    conversation = createdConversation;
  }

  const {
    data: existingMessage,
    error: existingMessageError,
  } = await supabase
    .from("whatsapp_messages")
    .select("id")
    .eq(
      "provider_message_id",
      message.providerMessageId,
    )
    .maybeSingle();

  if (existingMessageError) {
    throw existingMessageError;
  }

  if (existingMessage) {
    return {
      contact,
      conversation,
      duplicate: true,
    };
  }

  const whatsappTimestamp =
    message.timestamp
      ? new Date(
          Number(message.timestamp) * 1000,
        ).toISOString()
      : null;

  const {
    error: messageError,
  } = await supabase
    .from("whatsapp_messages")
    .insert({
      conversation_id: conversation.id,
      provider_message_id:
        message.providerMessageId,
      direction: "inbound",
      message_type: message.messageType,
      body: message.body ?? null,
      status: "received",
      whatsapp_timestamp: whatsappTimestamp,
      raw_payload: message.rawPayload,
    });

  if (messageError) {
    throw messageError;
  }

  const {
    error: conversationUpdateError,
  } = await supabase
    .from("whatsapp_conversations")
    .update({
      last_message_at:
        whatsappTimestamp ??
        new Date().toISOString(),
      last_message_preview:
        message.body?.slice(0, 200) ?? null,
      unread_count:
        (conversation.unread_count ?? 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversation.id);

  if (conversationUpdateError) {
    throw conversationUpdateError;
  }

  return {
    contact,
    conversation,
    duplicate: false,
  };
}

export async function getWhatsAppConversations() {
  const {
    data,
    error,
  } = await supabase
    .from("whatsapp_conversations")
    .select(`
      id,
      last_message_at,
      last_message_preview,
      unread_count,
      created_at,
      updated_at,
      whatsapp_contacts (
        id,
        phone_number,
        display_name,
        parent_id,
        learner_id
      )
    `)
    .order("last_message_at", {
      ascending: false,
      nullsFirst: false,
    });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getWhatsAppConversationMessages(
  conversationId: string,
) {
  const {
    data,
    error,
  } = await supabase
    .from("whatsapp_messages")
    .select(`
  id,
  provider_message_id,
  direction,
  message_type,
  body,
  status,
  whatsapp_timestamp,
  sent_by_user_id,
  sent_by_name,
  sent_by_role,
  created_at

    `)
    .eq(
      "conversation_id",
      conversationId,
    )
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function saveOutgoingWhatsAppMessage({
  conversationId,
  providerMessageId,
  body,
  status = "sent",
  sentByUserId,
  sentByName,
  sentByRole,
}: {
  conversationId: string;
  providerMessageId: string | null;
  body: string;
  status?: string;
  sentByUserId: string | null;
  sentByName: string | null;
  sentByRole: "admin" | "driver" | "system";
}) {
  const timestamp =
    new Date().toISOString();

  const {
    data: insertedMessage,
    error: insertError,
  } = await supabase
    .from("whatsapp_messages")
    .insert({
      conversation_id:
        conversationId,
      provider_message_id:
        providerMessageId,
      direction: "outbound",
      message_type: "text",
      body,
      status,
      whatsapp_timestamp:
        timestamp,
      sent_by_user_id:
        sentByUserId,
      sent_by_name:
        sentByName,
      sent_by_role:
        sentByRole,
    })
    .select()
    .single();

  if (insertError) {
    throw insertError;
  }

  const {
    error:
      conversationUpdateError,
  } = await supabase
    .from(
      "whatsapp_conversations",
    )
    .update({
      last_message_at:
        timestamp,
      last_message_preview:
        body,
      updated_at:
        timestamp,
    })
    .eq(
      "id",
      conversationId,
    );

  if (
    conversationUpdateError
  ) {
    throw conversationUpdateError;
  }

  return insertedMessage;
}

export async function getWhatsAppConversationById(
  conversationId: string,
) {
  const {
    data,
    error,
  } = await supabase
    .from("whatsapp_conversations")
    .select(`
      id,
      contact_id,
      whatsapp_contacts (
        id,
        phone_number,
        display_name
      )
    `)
    .eq("id", conversationId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function markWhatsAppConversationRead(
  conversationId: string,
) {
  const {
    error,
  } = await supabase
    .from("whatsapp_conversations")
    .update({
      unread_count: 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  if (error) {
    throw error;
  }
} 