import type {
  Request,
  Response,
} from "express";

import {
  createCrmActivity,
  createCrmEnquiry,
  type CrmServiceType,
} from "../repositories/crm.repository.js";

const allowedServiceTypes =
  new Set<CrmServiceType>([
    "morning",
    "afternoon",
    "return",
    "custom",
  ]);

function cleanText(
  value: unknown,
  maxLength = 500,
) {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const cleaned =
    value.trim();

  if (!cleaned) {
    return null;
  }

  return cleaned.slice(
    0,
    maxLength,
  );
}

function cleanBoolean(
  value: unknown,
) {
  return value === true;
}

function formatEnquiryReference(
  enquiryNumber: number,
) {
  return `VN-ENQ-${String(
    enquiryNumber,
  ).padStart(6, "0")}`;
}

export async function createPublicEnquiry(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    /*
     * Honeypot field.
     *
     * Real customers will never see/fill this field.
     * Basic bots often fill every input they encounter.
     */
    if (
      typeof request.body.companyWebsite ===
        "string" &&
      request.body.companyWebsite.trim()
    ) {
      response.status(200).json({
        success: true,
        message:
          "Enquiry received.",
      });

      return;
    }

    const parentFirstName =
      cleanText(
        request.body.parentFirstName,
        100,
      );

    const parentLastName =
      cleanText(
        request.body.parentLastName,
        100,
      );

    const whatsappNumber =
      cleanText(
        request.body.whatsappNumber,
        30,
      );

    const phoneNumber =
      cleanText(
        request.body.phoneNumber,
        30,
      );

    const email =
      cleanText(
        request.body.email,
        254,
      );

    const learnerName =
      cleanText(
        request.body.learnerName,
        150,
      );

    const schoolName =
      cleanText(
        request.body.schoolName,
        200,
      );

    const grade =
      cleanText(
        request.body.grade,
        50,
      );

    const pickupAddress =
      cleanText(
        request.body.pickupAddress,
        300,
      );

    const pickupSuburb =
      cleanText(
        request.body.pickupSuburb,
        150,
      );

    const dropoffAddress =
      cleanText(
        request.body.dropoffAddress,
        300,
      );

    const dropoffSuburb =
      cleanText(
        request.body.dropoffSuburb,
        150,
      );

    const requestedStartDate =
      cleanText(
        request.body.requestedStartDate,
        20,
      );

    const notes =
      cleanText(
        request.body.notes,
        2000,
      );

    const serviceType =
      request.body
        .serviceType;

    if (
      !parentFirstName
    ) {
      response.status(400).json({
        success: false,
        error:
          "Parent or guardian first name is required.",
      });

      return;
    }

    if (
      !whatsappNumber &&
      !phoneNumber
    ) {
      response.status(400).json({
        success: false,
        error:
          "A WhatsApp or phone number is required.",
      });

      return;
    }

    if (!schoolName) {
      response.status(400).json({
        success: false,
        error:
          "School is required.",
      });

      return;
    }

    if (
      !pickupAddress &&
      !pickupSuburb
    ) {
      response.status(400).json({
        success: false,
        error:
          "Pickup address or suburb is required.",
      });

      return;
    }

    if (
      typeof serviceType !==
        "string" ||
      !allowedServiceTypes.has(
        serviceType as CrmServiceType,
      )
    ) {
      response.status(400).json({
        success: false,
        error:
          "A valid service type is required.",
      });

      return;
    }

    const mondayMorning =
      cleanBoolean(
        request.body.mondayMorning,
      );

    const mondayAfternoon =
      cleanBoolean(
        request.body.mondayAfternoon,
      );

    const tuesdayMorning =
      cleanBoolean(
        request.body.tuesdayMorning,
      );

    const tuesdayAfternoon =
      cleanBoolean(
        request.body.tuesdayAfternoon,
      );

    const wednesdayMorning =
      cleanBoolean(
        request.body.wednesdayMorning,
      );

    const wednesdayAfternoon =
      cleanBoolean(
        request.body.wednesdayAfternoon,
      );

    const thursdayMorning =
      cleanBoolean(
        request.body.thursdayMorning,
      );

    const thursdayAfternoon =
      cleanBoolean(
        request.body.thursdayAfternoon,
      );

    const fridayMorning =
      cleanBoolean(
        request.body.fridayMorning,
      );

    const fridayAfternoon =
      cleanBoolean(
        request.body.fridayAfternoon,
      );

    const hasSelectedTrip =
      mondayMorning ||
      mondayAfternoon ||
      tuesdayMorning ||
      tuesdayAfternoon ||
      wednesdayMorning ||
      wednesdayAfternoon ||
      thursdayMorning ||
      thursdayAfternoon ||
      fridayMorning ||
      fridayAfternoon;

    if (!hasSelectedTrip) {
      response.status(400).json({
        success: false,
        error:
          "Please select at least one transport day.",
      });

      return;
    }

    const enquiry =
      await createCrmEnquiry({
        source:
          "website",

        parentFirstName,
        parentLastName,

        phoneNumber:
          phoneNumber ??
          whatsappNumber,

        whatsappNumber:
          whatsappNumber ??
          phoneNumber,

        email,

        learnerName,

        schoolName,
        grade,

        pickupAddress,
        pickupSuburb,

        dropoffAddress,
        dropoffSuburb,

        serviceType:
          serviceType as CrmServiceType,

        requestedStartDate,

        mondayMorning,
        mondayAfternoon,

        tuesdayMorning,
        tuesdayAfternoon,

        wednesdayMorning,
        wednesdayAfternoon,

        thursdayMorning,
        thursdayAfternoon,

        fridayMorning,
        fridayAfternoon,

        routeAssessmentStatus:
          "not_assessed",

        notes,
      });

    await createCrmActivity({
      enquiryId:
        enquiry.id,

      activityType:
        "created",

      description:
        "Website enquiry submitted",

      metadata: {
        source:
          "website",

        submissionIp:
          request.ip,

        userAgent:
          request.get(
            "user-agent",
          ) ??
          null,
      },
    });

    response.status(201).json({
      success: true,

      enquiry: {
        reference:
          formatEnquiryReference(
            enquiry.enquiry_number,
          ),

        id:
          enquiry.id,

        status:
          enquiry.status,
      },
    });
  } catch (error) {
    console.error(
      "Failed to create public enquiry:",
      error,
    );

    response.status(500).json({
      success: false,
      error:
        "We could not submit your enquiry. Please try again.",
    });
  }
}