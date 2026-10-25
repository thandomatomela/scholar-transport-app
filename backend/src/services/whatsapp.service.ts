const META_WHATSAPP_TOKEN = process.env.META_WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID =
  process.env.WHATSAPP_PHONE_NUMBER_ID;
const META_GRAPH_API_VERSION =
  process.env.META_GRAPH_API_VERSION || "v25.0";

export async function sendWhatsAppMessage(
  to: string,
  message: string,
) {
  if (!META_WHATSAPP_TOKEN) {
    throw new Error("META_WHATSAPP_TOKEN is missing");
  }

  if (!WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error("WHATSAPP_PHONE_NUMBER_ID is missing");
  }

  const response = await fetch(
    `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${META_WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: {
          preview_url: false,
          body: message,
        },
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Meta WhatsApp API error:", data);

    throw new Error(
      data?.error?.message ??
        "Failed to send WhatsApp message",
    );
  }

  return data;
}