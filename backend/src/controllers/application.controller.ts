import type {
  Request,
  Response,
} from "express";

import {
  supabase,
} from "../config/supabase.js";

type ApplicationContactInput = {
  full_name: string;
  phone_number: string;
  email?: string | null;
  relationship?: string | null;
  is_primary_contact?: boolean;
  whatsapp_enabled?: boolean;
};

type ApplicationAddressInput = {
  address_type:
    | "home"
    | "pickup"
    | "dropoff"
    | "school"
    | "extra_mural";

  address: string;

  latitude?: number | null;
  longitude?: number | null;
};

type ApplicationScheduleInput = {
  day_of_week:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";

  school_start_time?: string | null;
  school_end_time?: string | null;

  morning_transport_required?: boolean;
  afternoon_transport_required?: boolean;
};

type ApplicationActivityInput = {
  activity_name: string;

  day_of_week:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";

  finish_time?: string | null;
  pickup_address?: string | null;
};

type ApplicationLearnerInput = {
  full_name: string;

  school_name?: string | null;
  grade?: string | null;

  transport_direction?:
    | "morning"
    | "afternoon"
    | "both";

  special_notes?: string | null;

  addresses?: ApplicationAddressInput[];

  schedules?: ApplicationScheduleInput[];

  activities?: ApplicationActivityInput[];
};

type CreateApplicationBody = {
  reference_number?: string | null;

  quoted_price?: number | null;
  agreed_price?: number | null;

  parent_notes?: string | null;

  contacts?: ApplicationContactInput[];

  learners?: ApplicationLearnerInput[];
};

function getRouteParameter(
  value:
    | string
    | string[]
    | undefined,
): string | undefined {
  return Array.isArray(
    value,
  )
    ? value[0]
    : value;
}

function normalizeOptionalText(
  value:
    | string
    | null
    | undefined,
): string | null {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const trimmed =
    value.trim();

  return trimmed
    ? trimmed
    : null;
}

function generateReferenceNumber():
  string {
  const date =
    new Date();

  const year =
    date
      .getFullYear()
      .toString();

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(
      2,
      "0",
    );

  const day =
    String(
      date.getDate(),
    ).padStart(
      2,
      "0",
    );

  const randomPart =
    Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase();

  return (
    `VN-${year}${month}${day}-${randomPart}`
  );
}

/*
 * If submission fails after the top-level
 * application has been created, deleting
 * the application cascades through all
 * application child tables.
 *
 * Later we can move this entire operation
 * into a PostgreSQL RPC transaction.
 */
async function rollbackApplication(
  applicationId: string,
): Promise<void> {
  const { error } =
    await supabase
      .from(
        "transport_applications",
      )
      .delete()
      .eq(
        "id",
        applicationId,
      );

  if (error) {
    console.error(
      "Application rollback failed.",
      {
        applicationId,
        error:
          error.message,
      },
    );
  }
}

export async function updateApplicationReview(
  req: Request,
  res: Response,
): Promise<void> {
  const applicationId =
    getRouteParameter(
      req.params.id,
    );

  if (!applicationId) {
    res.status(400).json({
      error:
        "Application ID is required.",
    });

    return;
  }

  const {
    route_feasible,
    relationships_verified,
    school_times_verified,
    contact_details_verified,
    recommended_route_id,
    recommended_vehicle_id,
    recommended_driver_id,
    review_notes,
  } =
    req.body ?? {};

  const {
    data: application,
    error: applicationError,
  } =
    await supabase
      .from(
        "transport_applications",
      )
      .select(`
        id,
        status
      `)
      .eq(
        "id",
        applicationId,
      )
      .maybeSingle();

  if (applicationError) {
    res.status(500).json({
      error:
        applicationError.message,
    });

    return;
  }

  if (!application) {
    res.status(404).json({
      error:
        "Application was not found.",
    });

    return;
  }

  if (
    application.status ===
      "approved" ||
    application.status ===
      "converted" ||
    application.status ===
      "rejected"
  ) {
    res.status(409).json({
      error:
        "This application can no longer be reviewed.",
    });

    return;
  }

  const now =
    new Date().toISOString();

  const {
    data: review,
    error: reviewError,
  } =
    await supabase
      .from(
        "transport_application_reviews",
      )
      .update({
        route_feasible:
          typeof route_feasible ===
          "boolean"
            ? route_feasible
            : null,

        relationships_verified:
          typeof relationships_verified ===
          "boolean"
            ? relationships_verified
            : null,

        school_times_verified:
          typeof school_times_verified ===
          "boolean"
            ? school_times_verified
            : null,

        contact_details_verified:
          typeof contact_details_verified ===
          "boolean"
            ? contact_details_verified
            : null,

        recommended_route_id:
          typeof recommended_route_id ===
            "string" &&
          recommended_route_id.trim()
            ? recommended_route_id.trim()
            : null,

        recommended_vehicle_id:
          typeof recommended_vehicle_id ===
            "string" &&
          recommended_vehicle_id.trim()
            ? recommended_vehicle_id.trim()
            : null,

        recommended_driver_id:
          typeof recommended_driver_id ===
            "string" &&
          recommended_driver_id.trim()
            ? recommended_driver_id.trim()
            : null,

        review_notes:
          typeof review_notes ===
            "string" &&
          review_notes.trim()
            ? review_notes.trim()
            : null,

        updated_at:
          now,
      })
      .eq(
        "application_id",
        applicationId,
      )
      .select(`
        id,
        application_id,
        route_feasible,
        relationships_verified,
        school_times_verified,
        contact_details_verified,
        recommended_route_id,
        recommended_vehicle_id,
        recommended_driver_id,
        review_notes,
        created_at,
        updated_at
      `)
      .maybeSingle();

  if (reviewError) {
    res.status(500).json({
      error:
        reviewError.message,
    });

    return;
  }

  if (!review) {
    res.status(404).json({
      error:
        "Application review record was not found.",
    });

    return;
  }

  const {
    error: statusError,
  } =
    await supabase
      .from(
        "transport_applications",
      )
      .update({
        status:
          "under_review",

        reviewed_at:
          now,

        updated_at:
          now,
      })
      .eq(
        "id",
        applicationId,
      );

  if (statusError) {
    res.status(500).json({
      error:
        statusError.message,
    });

    return;
  }

  res.status(200).json({
    data: {
      review,
      applicationStatus:
        "under_review",
    },
  });
}

export async function approveApplication(
  req: Request,
  res: Response,
): Promise<void> {
  const applicationId =
    getRouteParameter(
      req.params.id,
    );

  if (!applicationId) {
    res.status(400).json({
      error:
        "Application ID is required.",
    });

    return;
  }

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "convert_transport_application",
      {
        p_application_id:
          applicationId,
      },
    );

  if (error) {
    res.status(400).json({
      error:
        error.message,
    });

    return;
  }

  res.status(200).json({
    data,
  });
}

export async function getApplications(
  _req: Request,
  res: Response,
): Promise<void> {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "transport_applications",
      )
      .select(`
        id,
        status,
        reference_number,
        quoted_price,
        agreed_price,
        parent_notes,
        admin_notes,
        rejection_reason,
        submitted_at,
        reviewed_at,
        approved_at,
        converted_at,
        created_at,
        updated_at
      `)
      .order(
        "created_at",
        {
          ascending:
            false,
        },
      );

  if (error) {
    res
      .status(500)
      .json({
        error:
          error.message,
      });

    return;
  }

  res
    .status(200)
    .json({
      data:
        data ?? [],
    });
}

export async function getApplicationById(
  req: Request,
  res: Response,
): Promise<void> {
  const applicationId =
    getRouteParameter(
      req.params.id,
    );

  if (!applicationId) {
    res
      .status(400)
      .json({
        error:
          "Application ID is required.",
      });

    return;
  }

  const {
    data:
      application,
    error:
      applicationError,
  } =
    await supabase
      .from(
        "transport_applications",
      )
      .select(`
        id,
        status,
        reference_number,
        quoted_price,
        agreed_price,
        parent_notes,
        admin_notes,
        rejection_reason,
        submitted_at,
        reviewed_at,
        approved_at,
        converted_at,
        created_at,
        updated_at
      `)
      .eq(
        "id",
        applicationId,
      )
      .maybeSingle();

  if (applicationError) {
    res
      .status(500)
      .json({
        error:
          applicationError.message,
      });

    return;
  }

  if (!application) {
    res
      .status(404)
      .json({
        error:
          "Application was not found.",
      });

    return;
  }

  const [
    contactsResult,
    learnersResult,
    addressesResult,
    reviewResult,
  ] =
    await Promise.all([
      supabase
        .from(
          "transport_application_contacts",
        )
        .select(`
          id,
          application_id,
          full_name,
          phone_number,
          email,
          relationship,
          is_primary_contact,
          whatsapp_enabled,
          created_at
        `)
        .eq(
          "application_id",
          applicationId,
        )
        .order(
          "is_primary_contact",
          {
            ascending:
              false,
          },
        ),

      supabase
        .from(
          "transport_application_learners",
        )
        .select(`
          id,
          application_id,
          full_name,
          school_name,
          grade,
          transport_direction,
          special_notes,
          created_at
        `)
        .eq(
          "application_id",
          applicationId,
        )
        .order(
          "created_at",
          {
            ascending:
              true,
          },
        ),

      supabase
        .from(
          "transport_application_addresses",
        )
        .select(`
          id,
          application_id,
          learner_application_id,
          address_type,
          address,
          latitude,
          longitude,
          created_at
        `)
        .eq(
          "application_id",
          applicationId,
        )
        .order(
          "created_at",
          {
            ascending:
              true,
          },
        ),

      supabase
        .from(
          "transport_application_reviews",
        )
        .select(`
          id,
          application_id,
          route_feasible,
          relationships_verified,
          school_times_verified,
          contact_details_verified,
          recommended_route_id,
          recommended_vehicle_id,
          recommended_driver_id,
          review_notes,
          created_at,
          updated_at
        `)
        .eq(
          "application_id",
          applicationId,
        )
        .maybeSingle(),
    ]);

  if (
    contactsResult.error ||
    learnersResult.error ||
    addressesResult.error ||
    reviewResult.error
  ) {
    const message =
      contactsResult.error
        ?.message ??
      learnersResult.error
        ?.message ??
      addressesResult.error
        ?.message ??
      reviewResult.error
        ?.message ??
      "Failed to load application details.";

    res
      .status(500)
      .json({
        error:
          message,
      });

    return;
  }

  const learnerIds =
    (
      learnersResult.data ??
      []
    ).map(
      (learner) =>
        learner.id,
    );

  let schedules:
    unknown[] = [];

  let activities:
    unknown[] = [];

  if (
    learnerIds.length >
    0
  ) {
    const [
      schedulesResult,
      activitiesResult,
    ] =
      await Promise.all([
        supabase
          .from(
            "transport_application_schedules",
          )
          .select(`
            id,
            learner_application_id,
            day_of_week,
            school_start_time,
            school_end_time,
            morning_transport_required,
            afternoon_transport_required,
            created_at
          `)
          .in(
            "learner_application_id",
            learnerIds,
          ),

        supabase
          .from(
            "transport_application_activities",
          )
          .select(`
            id,
            learner_application_id,
            activity_name,
            day_of_week,
            finish_time,
            pickup_address,
            created_at
          `)
          .in(
            "learner_application_id",
            learnerIds,
          ),
      ]);

    if (
      schedulesResult.error ||
      activitiesResult.error
    ) {
      res
        .status(500)
        .json({
          error:
            schedulesResult.error
              ?.message ??
            activitiesResult.error
              ?.message ??
            "Failed to load learner schedule details.",
        });

      return;
    }

    schedules =
      schedulesResult.data ??
      [];

    activities =
      activitiesResult.data ??
      [];
  }

  res
    .status(200)
    .json({
      data: {
        application,

        contacts:
          contactsResult.data ??
          [],

        learners:
          learnersResult.data ??
          [],

        addresses:
          addressesResult.data ??
          [],

        schedules,

        activities,

        review:
          reviewResult.data ??
          null,
      },
    });
}

export async function createApplication(
  req: Request,
  res: Response,
): Promise<void> {
  const body =
    (
      req.body ??
      {}
    ) as CreateApplicationBody;

  const contacts =
    Array.isArray(
      body.contacts,
    )
      ? body.contacts
      : [];

  const learners =
    Array.isArray(
      body.learners,
    )
      ? body.learners
      : [];

  if (
    contacts.length ===
    0
  ) {
    res
      .status(400)
      .json({
        error:
          "At least one parent or guardian contact is required.",
      });

    return;
  }

  if (
    learners.length ===
    0
  ) {
    res
      .status(400)
      .json({
        error:
          "At least one learner is required.",
      });

    return;
  }

  const primaryContacts =
    contacts.filter(
      (contact) =>
        contact.is_primary_contact ===
        true,
    );

  if (
    primaryContacts.length >
    1
  ) {
    res
      .status(400)
      .json({
        error:
          "Only one contact may be marked as the primary contact.",
      });

    return;
  }

  for (
    const contact
    of contacts
  ) {
    if (
      !contact.full_name
        ?.trim() ||
      !contact.phone_number
        ?.trim()
    ) {
      res
        .status(400)
        .json({
          error:
            "Each contact requires full_name and phone_number.",
        });

      return;
    }
  }

  for (
    const learner
    of learners
  ) {
    if (
      !learner.full_name
        ?.trim()
    ) {
      res
        .status(400)
        .json({
          error:
            "Each learner requires full_name.",
        });

      return;
    }
  }

  const now =
    new Date()
      .toISOString();

  const referenceNumber =
    normalizeOptionalText(
      body.reference_number,
    ) ??
    generateReferenceNumber();

  const {
    data:
      application,
    error:
      applicationError,
  } =
    await supabase
      .from(
        "transport_applications",
      )
      .insert({
        status:
          "submitted",

        reference_number:
          referenceNumber,

        quoted_price:
          body.quoted_price ??
          null,

        agreed_price:
          body.agreed_price ??
          null,

        parent_notes:
          normalizeOptionalText(
            body.parent_notes,
          ),

        submitted_at:
          now,

        updated_at:
          now,
      })
      .select(`
        id,
        status,
        reference_number,
        quoted_price,
        agreed_price,
        parent_notes,
        submitted_at,
        created_at,
        updated_at
      `)
      .single();

  if (
    applicationError ||
    !application
  ) {
    res
      .status(400)
      .json({
        error:
          applicationError
            ?.message ??
          "Failed to create application.",
      });

    return;
  }

  const applicationId =
    application.id;

  try {
    /*
     * CONTACTS
     */
    const contactRows =
      contacts.map(
        (
          contact,
          index,
        ) => ({
          application_id:
            applicationId,

          full_name:
            contact.full_name
              .trim(),

          phone_number:
            contact.phone_number
              .trim(),

          email:
            normalizeOptionalText(
              contact.email,
            ),

          relationship:
            normalizeOptionalText(
              contact.relationship,
            ),

          /*
           * If the form does not explicitly
           * choose a primary contact, the
           * first contact becomes primary.
           */
          is_primary_contact:
            primaryContacts.length >
            0
              ? contact.is_primary_contact ===
                true
              : index ===
                0,

          whatsapp_enabled:
            contact.whatsapp_enabled ??
            true,
        }),
      );

    const {
      error:
        contactsError,
    } =
      await supabase
        .from(
          "transport_application_contacts",
        )
        .insert(
          contactRows,
        );

    if (contactsError) {
      throw new Error(
        `Failed to save application contacts: ${contactsError.message}`,
      );
    }

    /*
     * LEARNERS
     *
     * We create them individually because
     * their generated IDs are needed by
     * addresses, schedules and activities.
     */
    for (
      const learner
      of learners
    ) {
      const {
        data:
          learnerRecord,
        error:
          learnerError,
      } =
        await supabase
          .from(
            "transport_application_learners",
          )
          .insert({
            application_id:
              applicationId,

            full_name:
              learner.full_name
                .trim(),

            school_name:
              normalizeOptionalText(
                learner.school_name,
              ),

            grade:
              normalizeOptionalText(
                learner.grade,
              ),

            transport_direction:
              learner.transport_direction ??
              "both",

            special_notes:
              normalizeOptionalText(
                learner.special_notes,
              ),
          })
          .select(
            "id",
          )
          .single();

      if (
        learnerError ||
        !learnerRecord
      ) {
        throw new Error(
          learnerError
            ? `Failed to save learner: ${learnerError.message}`
            : "Failed to save learner.",
        );
      }

      const learnerApplicationId =
        learnerRecord.id;

      /*
       * ADDRESSES
       */
      const addresses =
        Array.isArray(
          learner.addresses,
        )
          ? learner.addresses
          : [];

      if (
        addresses.length >
        0
      ) {
        const addressRows =
          addresses.map(
            (
              address,
            ) => ({
              application_id:
                applicationId,

              learner_application_id:
                learnerApplicationId,

              address_type:
                address.address_type,

              address:
                address.address
                  .trim(),

              latitude:
                address.latitude ??
                null,

              longitude:
                address.longitude ??
                null,
            }),
          );

        const {
          error:
            addressesError,
        } =
          await supabase
            .from(
              "transport_application_addresses",
            )
            .insert(
              addressRows,
            );

        if (
          addressesError
        ) {
          throw new Error(
            `Failed to save learner addresses: ${addressesError.message}`,
          );
        }
      }

      /*
       * WEEKLY SCHOOL SCHEDULE
       */
      const schedules =
        Array.isArray(
          learner.schedules,
        )
          ? learner.schedules
          : [];

      if (
        schedules.length >
        0
      ) {
        const scheduleRows =
          schedules.map(
            (
              schedule,
            ) => ({
              learner_application_id:
                learnerApplicationId,

              day_of_week:
                schedule.day_of_week,

              school_start_time:
                schedule.school_start_time ??
                null,

              school_end_time:
                schedule.school_end_time ??
                null,

              morning_transport_required:
                schedule
                  .morning_transport_required ??
                true,

              afternoon_transport_required:
                schedule
                  .afternoon_transport_required ??
                true,
            }),
          );

        const {
          error:
            schedulesError,
        } =
          await supabase
            .from(
              "transport_application_schedules",
            )
            .insert(
              scheduleRows,
            );

        if (
          schedulesError
        ) {
          throw new Error(
            `Failed to save learner schedules: ${schedulesError.message}`,
          );
        }
      }

      /*
       * EXTRA-MURAL ACTIVITIES
       */
      const activities =
        Array.isArray(
          learner.activities,
        )
          ? learner.activities
          : [];

      if (
        activities.length >
        0
      ) {
        const activityRows =
          activities.map(
            (
              activity,
            ) => ({
              learner_application_id:
                learnerApplicationId,

              activity_name:
                activity.activity_name
                  .trim(),

              day_of_week:
                activity.day_of_week,

              finish_time:
                activity.finish_time ??
                null,

              pickup_address:
                normalizeOptionalText(
                  activity.pickup_address,
                ),
            }),
          );

        const {
          error:
            activitiesError,
        } =
          await supabase
            .from(
              "transport_application_activities",
            )
            .insert(
              activityRows,
            );

        if (
          activitiesError
        ) {
          throw new Error(
            `Failed to save learner activities: ${activitiesError.message}`,
          );
        }
      }
    }

    /*
     * Create an empty admin review row
     * immediately so every submitted
     * application has somewhere for the
     * back office to store its review.
     */
    const {
      error:
        reviewError,
    } =
      await supabase
        .from(
          "transport_application_reviews",
        )
        .insert({
          application_id:
            applicationId,
        });

    if (reviewError) {
      throw new Error(
        `Failed to create application review: ${reviewError.message}`,
      );
    }

    res
      .status(201)
      .json({
        data: {
          applicationId,
          referenceNumber:
            application.reference_number,
          status:
            application.status,
          message:
            "Transport application submitted successfully.",
        },
      });
  } catch (
    caughtError
  ) {
    await rollbackApplication(
      applicationId,
    );

    const message =
      caughtError instanceof Error
        ? caughtError.message
        : "Failed to submit transport application.";

    console.error(
      "Transport application submission failed.",
      {
        applicationId,
        error:
          message,
      },
    );

    res
      .status(400)
      .json({
        error:
          message,
      });
  }
}