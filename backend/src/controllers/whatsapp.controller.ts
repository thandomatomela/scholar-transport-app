import type {
  Request,
  Response,
} from "express";

import {
  whatsappConfig,
} from "../config/whatsapp.config.js";

import type {
  AuthenticatedRequest,
} from "../middleware/auth.middleware.js";

import {
  getWhatsAppConversationById,
  getWhatsAppConversationMessages,
  getWhatsAppConversations,
  markWhatsAppConversationRead,
  saveIncomingWhatsAppMessage,
  saveOutgoingWhatsAppMessage,
  updateWhatsAppMessageStatus,
} from "../repositories/whatsapp.repository.js";

import {
  sendWhatsAppMessage,
} from "../services/whatsapp.service.js";

export async function sendTestWhatsAppMessage(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const {
      to,
    } =
      request.body;

    if (!to) {
      response
        .status(400)
        .json({
          success: false,
          error:
            "Phone number is required",
        });

      return;
    }

    const result =
      await sendWhatsAppMessage(
        to,
        "Hello 👋 This is a test message from Via Nova Scholar Transport.",
      );

    response
      .status(200)
      .json({
        success: true,
        result,
      });
  } catch (error) {
    console.error(
      "WhatsApp test failed:",
      error,
    );

    response
      .status(500)
      .json({
        success: false,
        error:
          error instanceof
          Error
            ? error.message
            : "Unknown error",
      });
  }
}

export function verifyWhatsAppWebhook(
  request: Request,
  response: Response,
): void {
  const mode =
    request.query[
      "hub.mode"
    ];

  const token =
    request.query[
      "hub.verify_token"
    ];

  const challenge =
    request.query[
      "hub.challenge"
    ];

  if (
    mode ===
      "subscribe" &&
    token ===
      whatsappConfig.verifyToken
  ) {
    response
      .status(200)
      .send(
        challenge,
      );

    return;
  }

  response.sendStatus(
    403,
  );
}

export async function receiveWhatsAppWebhook(
  request: Request,
  response: Response,
): Promise<void> {
  console.log(
    "WhatsApp webhook received:",
    JSON.stringify(
      request.body,
      null,
      2,
    ),
  );

  const entries =
    request.body?.entry ??
    [];

  for (
    const entry of entries
  ) {
    const changes =
      entry?.changes ??
      [];

    for (
      const change of changes
    ) {
      const value =
        change?.value;

      const messages =
        value?.messages ??
        [];

      const contacts =
        value?.contacts ??
        [];

      const statuses =
        value?.statuses ??
        [];

      for (
        const statusUpdate of
          statuses
      ) {
        const providerMessageId =
          statusUpdate.id;

        const status =
          statusUpdate.status;

        const errorInfo =
          statusUpdate
            .errors?.[0] ??
          null;

        console.log(
          "WhatsApp message status:",
          {
            providerMessageId,

            status,

            recipientId:
              statusUpdate
                .recipient_id ??
              null,

            timestamp:
              statusUpdate
                .timestamp ??
              null,

            errorCode:
              errorInfo?.code ??
              null,

            errorTitle:
              errorInfo
                ?.title ??
              null,

            errorMessage:
              errorInfo
                ?.message ??
              null,

            errorDetails:
              errorInfo
                ?.error_data
                ?.details ??
              null,
          },
        );

        if (
          providerMessageId &&
          status
        ) {
          try {
            const updatedMessage =
              await updateWhatsAppMessageStatus(
                {
                  providerMessageId,

                  status,

                  timestamp:
                    statusUpdate
                      .timestamp ??
                    null,

                  errorCode:
                    errorInfo
                      ?.code ??
                    null,

                  errorTitle:
                    errorInfo
                      ?.title ??
                    null,

                  errorMessage:
                    errorInfo
                      ?.message ??
                    null,

                  errorDetails:
                    errorInfo
                      ?.error_data
                      ?.details ??
                    null,
                },
              );

            if (
              updatedMessage
            ) {
              console.log(
                "WhatsApp message status updated:",
                providerMessageId,
                status,
              );
            } else {
              console.warn(
                "No stored WhatsApp message found for status update:",
                providerMessageId,
              );
            }
          } catch (error) {
            console.error(
              "Failed to update WhatsApp message status:",
              error,
            );
          }
        }
      }

      for (
        const message of
          messages
      ) {
        const contact =
          contacts.find(
            (
              item: any,
            ) =>
              item.wa_id ===
              message.from,
          );

        console.log(
          "Incoming WhatsApp message:",
          {
            from:
              message.from,

            name:
              contact
                ?.profile
                ?.name ??
              null,

            messageId:
              message.id,

            type:
              message.type,

            text:
              message
                .text
                ?.body ??
              null,

            timestamp:
              message.timestamp,
          },
        );

        try {
          await saveIncomingWhatsAppMessage(
            {
              phoneNumber:
                message.from,

              displayName:
                contact
                  ?.profile
                  ?.name ??
                null,

              providerMessageId:
                message.id,

              messageType:
                message.type,

              body:
                message
                  .text
                  ?.body ??
                null,

              timestamp:
                message.timestamp,

              rawPayload:
                message,
            },
          );

          console.log(
            "Incoming WhatsApp message saved.",
            message.id,
          );
        } catch (error) {
          console.error(
            "Failed to save incoming WhatsApp message:",
            error,
          );
        }
      }
    }
  }

  response.sendStatus(
    200,
  );
}

export async function listWhatsAppConversations(
  _request: Request,
  response: Response,
): Promise<void> {
  try {
    const conversations =
      await getWhatsAppConversations();

    response
      .status(200)
      .json({
        success: true,
        conversations,
      });
  } catch (error) {
    console.error(
      "Failed to load WhatsApp conversations:",
      error,
    );

    response
      .status(500)
      .json({
        success: false,

        error:
          error instanceof
          Error
            ? error.message
            : "Failed to load WhatsApp conversations",
      });
  }
}

export async function listWhatsAppMessages(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const conversationParam =
      request.params.id;

    const conversationId =
      Array.isArray(
        conversationParam,
      )
        ? conversationParam[0]
        : conversationParam;

    if (!conversationId) {
      response
        .status(400)
        .json({
          success: false,
          error:
            "Conversation ID is required",
        });

      return;
    }

    const messages =
      await getWhatsAppConversationMessages(
        conversationId,
      );

    await markWhatsAppConversationRead(
      conversationId,
    );

    response
      .status(200)
      .json({
        success: true,
        messages,
      });
  } catch (error) {
    console.error(
      "Failed to load WhatsApp messages:",
      error,
    );

    response
      .status(500)
      .json({
        success: false,

        error:
          error instanceof
          Error
            ? error.message
            : "Failed to load WhatsApp messages",
      });
  }
}

export async function sendWhatsAppConversationMessage(
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> {
  try {
    const conversationParam =
      request.params.id;

    const conversationId =
      Array.isArray(
        conversationParam,
      )
        ? conversationParam[0]
        : conversationParam;

    if (!conversationId) {
      response
        .status(400)
        .json({
          success: false,

          error:
            "Conversation ID is required",
        });

      return;
    }

    if (!request.user) {
      response
        .status(401)
        .json({
          success: false,

          error:
            "Authentication required",
        });

      return;
    }

    const {
      body,
    } =
      request.body;

    if (
      !body ||
      typeof body !==
        "string" ||
      !body.trim()
    ) {
      response
        .status(400)
        .json({
          success: false,

          error:
            "Message body is required",
        });

      return;
    }

    const conversation =
      await getWhatsAppConversationById(
        conversationId,
      );

    const contactRelation =
      conversation
        .whatsapp_contacts;

    const contact =
      Array.isArray(
        contactRelation,
      )
        ? contactRelation[0]
        : contactRelation;

    const phoneNumber =
      contact?.phone_number;

    if (!phoneNumber) {
      response
        .status(400)
        .json({
          success: false,

          error:
            "No WhatsApp phone number is linked to this conversation",
        });

      return;
    }

    const result =
      await sendWhatsAppMessage(
        phoneNumber,
        body.trim(),
      );

    const providerMessageId =
      result
        ?.messages?.[0]
        ?.id ??
      null;

    const savedMessage =
      await saveOutgoingWhatsAppMessage(
        {
          conversationId,

          providerMessageId,

          body:
            body.trim(),

          sentByUserId:
            request.user.id,

          sentByName:
            request.user
              .fullName ??
            request.user
              .email ??
            "Via Nova Admin",

          sentByRole:
            request.user
              .role,
        },
      );

    console.log(
      "WhatsApp message sent:",
      {
        conversationId,

        to:
          phoneNumber,

        providerMessageId,

        sentBy:
          request.user
            .fullName ??
          request.user
            .email ??
          request.user
            .id,
      },
    );

    response
      .status(200)
      .json({
        success: true,

        result,

        message:
          savedMessage,
      });
  } catch (error) {
    console.error(
      "Failed to send WhatsApp conversation message:",
      error,
    );

    response
      .status(500)
      .json({
        success: false,

        error:
          error instanceof
          Error
            ? error.message
            : "Failed to send WhatsApp message",
      });
  }
}