type WhatsAppConfig = {
  accessToken: string | undefined;
  phoneNumberId: string | undefined;
  graphApiVersion: string | undefined;
  verifyToken: string | undefined;
};

export const whatsappConfig: WhatsAppConfig = {
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN?.trim(),
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID?.trim(),
  graphApiVersion:
    process.env.WHATSAPP_GRAPH_API_VERSION?.trim() || "v25.0",
  verifyToken: process.env.WHATSAPP_VERIFY_TOKEN?.trim(),
};

export function validateWhatsAppConfig(): Required<WhatsAppConfig> {
  const missingVariables: string[] = [];

  if (!whatsappConfig.accessToken) {
    missingVariables.push("WHATSAPP_ACCESS_TOKEN");
  }

  if (!whatsappConfig.phoneNumberId) {
    missingVariables.push("WHATSAPP_PHONE_NUMBER_ID");
  }

  if (!whatsappConfig.graphApiVersion) {
    missingVariables.push("WHATSAPP_GRAPH_API_VERSION");
  }

  if (!whatsappConfig.verifyToken) {
    missingVariables.push("WHATSAPP_VERIFY_TOKEN");
  }

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing WhatsApp configuration: ${missingVariables.join(", ")}`,
    );
  }

  return {
    accessToken: whatsappConfig.accessToken!,
    phoneNumberId: whatsappConfig.phoneNumberId!,
    graphApiVersion: whatsappConfig.graphApiVersion!,
    verifyToken: whatsappConfig.verifyToken!,
  };
}