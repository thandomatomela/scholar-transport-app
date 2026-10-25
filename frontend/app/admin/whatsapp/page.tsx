"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  supabase,
} from "../../../lib/supabase/client";

type WhatsAppContact = {
  id: string;
  phone_number: string;
  display_name: string | null;
  parent_id: string | null;
  learner_id: string | null;
};

type Conversation = {
  id: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count: number;

  whatsapp_contacts:
    | WhatsAppContact
    | WhatsAppContact[]
    | null;
};

type Message = {
  id: string;
  provider_message_id: string | null;
  direction: "inbound" | "outbound";
  message_type: string;
  body: string | null;
  status: string | null;
  whatsapp_timestamp: string | null;

  status_error_code: number | null;
  status_error_title: string | null;
  status_error_message: string | null;
  status_error_details: string | null;
  status_updated_at: string | null;

  sent_by_user_id: string | null;
  sent_by_name: string | null;
  sent_by_role: string | null;

  created_at: string;
};

function getContact(
  conversation: Conversation,
): WhatsAppContact | null {
  const contact =
    conversation.whatsapp_contacts;

  if (!contact) {
    return null;
  }

  return Array.isArray(contact)
    ? contact[0] ?? null
    : contact;
}

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-ZA",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(
    new Date(value),
  );
}

function getStatusLabel(
  status: string | null,
) {
  switch (status) {
    case "sent":
      return "Sent";

    case "delivered":
      return "Delivered";

    case "read":
      return "Read";

    case "failed":
      return "Failed";

    case "received":
      return "Received";

    default:
      return status ?? "";
  }
}

function getStatusClass(
  status: string | null,
) {
  switch (status) {
    case "read":
      return "text-emerald-800";

    case "delivered":
      return "text-emerald-700";

    case "failed":
      return "text-red-700";

    case "sent":
      return "text-slate-600";

    default:
      return "text-slate-500";
  }
}

export default function WhatsAppInboxPage() {
  const router =
    useRouter();

  const [
    conversations,
    setConversations,
  ] = useState<
    Conversation[]
  >([]);

  const [
    selectedId,
    setSelectedId,
  ] = useState<
    string | null
  >(null);

  const [
    messages,
    setMessages,
  ] = useState<
    Message[]
  >([]);

  const [
    replyText,
    setReplyText,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loadingMessages,
    setLoadingMessages,
  ] = useState(false);

  const [
    sending,
    setSending,
  ] = useState(false);

  const [
    checkingAuth,
    setCheckingAuth,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  useEffect(() => {
    void initialisePage();
  }, []);

  async function getAccessToken() {
    const {
      data,
      error:
        sessionError,
    } =
      await supabase.auth.getSession();

    if (
      sessionError ||
      !data.session
    ) {
      return null;
    }

    return data.session.access_token;
  }

  async function handleUnauthorized() {
    await supabase.auth.signOut();

    router.replace(
      "/admin/login",
    );
  }

  async function initialisePage() {
    try {
      setCheckingAuth(true);

      const token =
        await getAccessToken();

      if (!token) {
        router.replace(
          "/admin/login",
        );

        return;
      }

      await loadConversations(
        token,
      );
    } finally {
      setCheckingAuth(false);
    }
  }

  async function loadConversations(
    suppliedToken?: string,
  ) {
    try {
      setLoading(true);
      setError(null);

      const token =
        suppliedToken ??
        (await getAccessToken());

      if (!token) {
        await handleUnauthorized();
        return;
      }

      const response =
        await fetch(
          "/api/whatsapp/conversations",
          {
            cache:
              "no-store",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          },
        );

      if (
        response.status ===
        401
      ) {
        await handleUnauthorized();
        return;
      }

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ??
            "Failed to load conversations",
        );
      }

      const result:
        Conversation[] =
        data.conversations ??
        [];

      setConversations(
        result,
      );

      if (
        result.length > 0 &&
        !selectedId
      ) {
        const firstId =
          result[0].id;

        setSelectedId(
          firstId,
        );

        await loadMessages(
          firstId,
          token,
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load conversations",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(
    conversationId: string,
    suppliedToken?: string,
  ) {
    try {
      setLoadingMessages(
        true,
      );

      setError(null);

      const token =
        suppliedToken ??
        (await getAccessToken());

      if (!token) {
        await handleUnauthorized();
        return;
      }

      const response =
        await fetch(
          `/api/whatsapp/conversations/${conversationId}/messages`,
          {
            cache:
              "no-store",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          },
        );

      if (
        response.status ===
        401
      ) {
        await handleUnauthorized();
        return;
      }

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ??
            "Failed to load messages",
        );
      }

      setMessages(
        data.messages ?? [],
      );

      setConversations(
        (current) =>
          current.map(
            (conversation) =>
              conversation.id ===
              conversationId
                ? {
                    ...conversation,
                    unread_count: 0,
                  }
                : conversation,
          ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load messages",
      );
    } finally {
      setLoadingMessages(
        false,
      );
    }
  }

  async function selectConversation(
    conversationId: string,
  ) {
    setSelectedId(
      conversationId,
    );

    setReplyText("");

    await loadMessages(
      conversationId,
    );
  }

  async function sendReply(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !selectedId ||
      !replyText.trim() ||
      sending
    ) {
      return;
    }

    try {
      setSending(true);
      setError(null);

      const token =
        await getAccessToken();

      if (!token) {
        await handleUnauthorized();
        return;
      }

      const messageBody =
        replyText.trim();

      const response =
        await fetch(
          `/api/whatsapp/conversations/${selectedId}/messages`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              body: messageBody,
            }),
          },
        );

      if (
        response.status ===
        401
      ) {
        await handleUnauthorized();
        return;
      }

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ??
            "Failed to send message",
        );
      }

      const savedMessage:
        Message | undefined =
        data.message;

      if (savedMessage) {
        setMessages(
          (current) => [
            ...current,
            savedMessage,
          ],
        );
      } else {
        await loadMessages(
          selectedId,
          token,
        );
      }

      setConversations(
        (current) =>
          current.map(
            (conversation) =>
              conversation.id ===
              selectedId
                ? {
                    ...conversation,

                    last_message_preview:
                      messageBody,

                    last_message_at:
                      new Date()
                        .toISOString(),
                  }
                : conversation,
          ),
      );

      setReplyText("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send message",
      );
    } finally {
      setSending(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();

    router.replace(
      "/admin/login",
    );
  }

  const selectedConversation =
    conversations.find(
      (conversation) =>
        conversation.id ===
        selectedId,
    ) ?? null;

  const selectedContact =
    selectedConversation
      ? getContact(
          selectedConversation,
        )
      : null;

  if (checkingAuth) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center p-6">
        <p className="text-sm text-slate-500">
          Checking authentication...
        </p>
      </main>
    );
  }

  return (
    <main className="p-4 md:p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
            Communications
          </p>

          <h1 className="mt-2 text-2xl font-bold text-slate-950">
            WhatsApp Inbox
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Parent and guardian
            conversations received
            through Via Nova.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void handleLogout()
          }
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Sign out
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid min-h-[70vh] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[360px_1fr]">
        <aside className="border-b border-slate-200 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between border-b border-slate-200 p-4">
            <h2 className="font-bold text-slate-950">
              Conversations
            </h2>

            <button
              type="button"
              onClick={() =>
                void loadConversations()
              }
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="p-6 text-sm text-slate-500">
                Loading conversations...
              </div>
            ) : conversations.length ===
              0 ? (
              <div className="p-6 text-sm text-slate-500">
                No conversations yet.
              </div>
            ) : (
              conversations.map(
                (
                  conversation,
                ) => {
                  const contact =
                    getContact(
                      conversation,
                    );

                  const active =
                    conversation.id ===
                    selectedId;

                  return (
                    <button
                      key={
                        conversation.id
                      }
                      type="button"
                      onClick={() =>
                        void selectConversation(
                          conversation.id,
                        )
                      }
                      className={[
                        "w-full border-b border-slate-100 p-4 text-left transition",
                        active
                          ? "bg-emerald-50"
                          : "hover:bg-slate-50",
                      ].join(
                        " ",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-900">
                            {contact?.display_name ||
                              contact?.phone_number ||
                              "Unknown contact"}
                          </p>

                          {contact?.display_name &&
                            contact?.phone_number && (
                              <p className="mt-1 text-xs text-slate-400">
                                {
                                  contact.phone_number
                                }
                              </p>
                            )}

                          <p className="mt-2 truncate text-sm text-slate-500">
                            {conversation.last_message_preview ||
                              "No message"}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-[10px] text-slate-400">
                            {formatDate(
                              conversation.last_message_at,
                            )}
                          </p>

                          {conversation.unread_count >
                            0 && (
                            <span className="mt-2 inline-flex min-w-6 items-center justify-center rounded-full bg-emerald-500 px-2 py-1 text-xs font-bold text-slate-950">
                              {
                                conversation.unread_count
                              }
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                },
              )
            )}
          </div>
        </aside>

        <section className="flex min-h-[70vh] flex-col">
          {!selectedConversation ? (
            <div className="flex flex-1 items-center justify-center p-8 text-center">
              <div>
                <div className="text-4xl">
                  💬
                </div>

                <h2 className="mt-4 text-lg font-bold text-slate-900">
                  Select a conversation
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Parent messages
                  will appear here.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="border-b border-slate-200 p-4">
                <h2 className="font-bold text-slate-950">
                  {selectedContact?.display_name ||
                    selectedContact?.phone_number ||
                    "WhatsApp contact"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {
                    selectedContact?.phone_number
                  }
                </p>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4 md:p-6">
                {loadingMessages ? (
                  <p className="text-sm text-slate-500">
                    Loading messages...
                  </p>
                ) : messages.length ===
                  0 ? (
                  <p className="text-sm text-slate-500">
                    No messages yet.
                  </p>
                ) : (
                  messages.map(
                    (message) => {
                      const outbound =
                        message.direction ===
                        "outbound";

                      const statusLabel =
                        getStatusLabel(
                          message.status,
                        );

                      return (
                        <div
                          key={
                            message.id
                          }
                          className={[
                            "flex",
                            outbound
                              ? "justify-end"
                              : "justify-start",
                          ].join(
                            " ",
                          )}
                        >
                          <div
                            className={[
                              "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
                              outbound
                                ? "bg-emerald-500 text-slate-950"
                                : "bg-white text-slate-900",
                            ].join(
                              " ",
                            )}
                          >
                            <p className="whitespace-pre-wrap text-sm">
                              {message.body ||
                                `[${message.message_type}]`}
                            </p>

                            {outbound &&
                              message.sent_by_name && (
                                <p className="mt-2 text-[10px] font-semibold text-slate-700">
                                  Sent by{" "}
                                  {
                                    message.sent_by_name
                                  }
                                </p>
                              )}

                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px]">
                              <span className="opacity-60">
                                {formatDate(
                                  message.whatsapp_timestamp ||
                                    message.created_at,
                                )}
                              </span>

                              {outbound &&
                                statusLabel && (
                                  <span
                                    className={[
                                      "font-semibold",
                                      getStatusClass(
                                        message.status,
                                      ),
                                    ].join(
                                      " ",
                                    )}
                                  >
                                    {
                                      statusLabel
                                    }
                                  </span>
                                )}
                            </div>

                            {outbound &&
                              message.status ===
                                "failed" && (
                                <div className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
                                  <p className="font-semibold">
                                    {message.status_error_title ||
                                      "Message failed"}
                                  </p>

                                  {message.status_error_details && (
                                    <p className="mt-1">
                                      {
                                        message.status_error_details
                                      }
                                    </p>
                                  )}

                                  {message.status_error_code && (
                                    <p className="mt-1 text-[10px] opacity-70">
                                      Error code{" "}
                                      {
                                        message.status_error_code
                                      }
                                    </p>
                                  )}
                                </div>
                              )}
                          </div>
                        </div>
                      );
                    },
                  )
                )}
              </div>

              <form
                onSubmit={
                  sendReply
                }
                className="border-t border-slate-200 bg-white p-4"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={
                      replyText
                    }
                    onChange={(
                      event,
                    ) =>
                      setReplyText(
                        event.target.value,
                      )
                    }
                    disabled={
                      sending
                    }
                    placeholder="Type a message..."
                    className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 disabled:bg-slate-50"
                  />

                  <button
                    type="submit"
                    disabled={
                      sending ||
                      !replyText.trim()
                    }
                    className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-white"
                  >
                    {sending
                      ? "Sending..."
                      : "Send"}
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}