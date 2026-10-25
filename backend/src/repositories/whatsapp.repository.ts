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
      whatsapp_timestamp:
        whatsappTimestamp,
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