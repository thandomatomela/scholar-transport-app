import type {
  Response,
} from "express";

import type {
  AuthenticatedRequest,
} from "../middleware/auth.middleware.js";

import {
  createCrmActivity,
  createCrmEnquiry,
  createCrmFollowup,
  createCrmQuote,
  getCrmEnquiries,
  getCrmEnquiryById,
  updateCrmEnquiry,
} from "../repositories/crm.repository.js";

function getParam(
  value:
    | string
    | string[]
    | undefined,
) {
  if (
    Array.isArray(value)
  ) {
    return value[0];
  }

  return value;
}

export async function listCrmEnquiries(
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> {
  try {
    const status =
      typeof request.query.status ===
      "string"
        ? request.query.status
        : undefined;

    const enquiries =
      await getCrmEnquiries({
        status,
      });

    response.status(200).json({
      success: true,
      enquiries,
    });
  } catch (error) {
    console.error(
      "Failed to load CRM enquiries:",
      error,
    );

    response.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load enquiries",
    });
  }
}

export async function getCrmEnquiry(
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> {
  try {
    const enquiryId =
      getParam(
        request.params.id,
      );

    if (!enquiryId) {
      response.status(400).json({
        success: false,
        error:
          "Enquiry ID is required",
      });

      return;
    }

    const enquiry =
      await getCrmEnquiryById(
        enquiryId,
      );

    response.status(200).json({
      success: true,
      enquiry,
    });
  } catch (error) {
    console.error(
      "Failed to load CRM enquiry:",
      error,
    );

    response.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load enquiry",
    });
  }
}

export async function createCrmEnquiryController(
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> {
  try {
    const enquiry =
      await createCrmEnquiry(
        request.body,
      );

    await createCrmActivity({
      enquiryId:
        enquiry.id,

      activityType:
        "created",

      description:
        "Enquiry created",

      performedBy:
        request.user?.id ??
        null,
    });

    response.status(201).json({
      success: true,
      enquiry,
    });
  } catch (error) {
    console.error(
      "Failed to create CRM enquiry:",
      error,
    );

    response.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create enquiry",
    });
  }
}

export async function updateCrmEnquiryController(
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> {
  try {
    const enquiryId =
      getParam(
        request.params.id,
      );

    if (!enquiryId) {
      response.status(400).json({
        success: false,
        error:
          "Enquiry ID is required",
      });

      return;
    }

    const existing =
      await getCrmEnquiryById(
        enquiryId,
      );

    const enquiry =
      await updateCrmEnquiry(
        enquiryId,
        request.body,
      );

    if (
      request.body.status &&
      request.body.status !==
        existing.status
    ) {
      await createCrmActivity({
        enquiryId,

        activityType:
          request.body.status ===
          "won"
            ? "won"
            : request.body
                  .status ===
                "lost"
              ? "lost"
              : request.body
                    .status ===
                  "dormant"
                ? "dormant"
                : "status_changed",

        description:
          `Status changed from ${existing.status} to ${request.body.status}`,

        metadata: {
          previousStatus:
            existing.status,

          newStatus:
            request.body.status,
        },

        performedBy:
          request.user?.id ??
          null,
      });
    }

    response.status(200).json({
      success: true,
      enquiry,
    });
  } catch (error) {
    console.error(
      "Failed to update CRM enquiry:",
      error,
    );

    response.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update enquiry",
    });
  }
}

export async function createCrmQuoteController(
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> {
  try {
    const enquiryId =
      getParam(
        request.params.id,
      );

    if (!enquiryId) {
      response.status(400).json({
        success: false,
        error:
          "Enquiry ID is required",
      });

      return;
    }

    const {
      serviceType,
      monthlyAmount,
      onceOffAmount,
      discountAmount,
      validUntil,
      notes,
    } =
      request.body;

    if (
      !serviceType ||
      typeof monthlyAmount !==
        "number"
    ) {
      response.status(400).json({
        success: false,
        error:
          "serviceType and monthlyAmount are required",
      });

      return;
    }

    const quote =
      await createCrmQuote({
        enquiryId,
        serviceType,
        monthlyAmount,
        onceOffAmount,
        discountAmount,
        validUntil,
        notes,

        createdBy:
          request.user?.id ??
          null,
      });

    await createCrmActivity({
      enquiryId,

      activityType:
        "quote_created",

      description:
        `Quote created for R${quote.final_monthly_amount}`,

      metadata: {
        quoteId:
          quote.id,

        quoteNumber:
          quote.quote_number,

        finalMonthlyAmount:
          quote.final_monthly_amount,
      },

      performedBy:
        request.user?.id ??
        null,
    });

    response.status(201).json({
      success: true,
      quote,
    });
  } catch (error) {
    console.error(
      "Failed to create CRM quote:",
      error,
    );

    response.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create quote",
    });
  }
}

export async function createCrmFollowupController(
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> {
  try {
    const enquiryId =
      getParam(
        request.params.id,
      );

    if (!enquiryId) {
      response.status(400).json({
        success: false,
        error:
          "Enquiry ID is required",
      });

      return;
    }

    const {
      followupType,
      dueAt,
      note,
    } =
      request.body;

    if (
      !followupType ||
      !dueAt
    ) {
      response.status(400).json({
        success: false,
        error:
          "followupType and dueAt are required",
      });

      return;
    }

    const followup =
      await createCrmFollowup({
        enquiryId,
        followupType,
        dueAt,
        note,

        createdBy:
          request.user?.id ??
          null,
      });

    await createCrmActivity({
      enquiryId,

      activityType:
        "followup_created",

      description:
        `Follow-up scheduled for ${dueAt}`,

      metadata: {
        followupId:
          followup.id,

        followupType,

        dueAt,
      },

      performedBy:
        request.user?.id ??
        null,
    });

    response.status(201).json({
      success: true,
      followup,
    });
  } catch (error) {
    console.error(
      "Failed to create CRM follow-up:",
      error,
    );

    response.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create follow-up",
    });
  }
}