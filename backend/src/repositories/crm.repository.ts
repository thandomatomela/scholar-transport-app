import {
  supabase,
} from "../config/supabase.js";

export type CrmEnquiryStatus =
  | "new"
  | "registration_started"
  | "registration_submitted"
  | "route_assessment"
  | "quote_sent"
  | "follow_up"
  | "contract_pending"
  | "won"
  | "dormant"
  | "lost";

export type CrmSource =
  | "whatsapp"
  | "website"
  | "facebook"
  | "referral"
  | "phone"
  | "walk_in"
  | "other";

export type CrmServiceType =
  | "morning"
  | "afternoon"
  | "return"
  | "custom";

export type CrmLossReason =
  | "too_expensive"
  | "found_another_provider"
  | "route_not_suitable"
  | "no_capacity"
  | "transport_no_longer_required"
  | "school_changed"
  | "start_date_postponed"
  | "no_response"
  | "other";

export type RouteAssessmentStatus =
  | "not_assessed"
  | "existing_route_match"
  | "route_extension"
  | "new_route_opportunity"
  | "not_serviceable";

export type CreateCrmEnquiryInput = {
  source?: CrmSource;

  parentFirstName?: string | null;
  parentLastName?: string | null;

  phoneNumber?: string | null;
  whatsappNumber?: string | null;
  email?: string | null;

  learnerName?: string | null;
  schoolName?: string | null;
  grade?: string | null;

  pickupAddress?: string | null;
  pickupSuburb?: string | null;
  pickupLatitude?: number | null;
  pickupLongitude?: number | null;

  dropoffAddress?: string | null;
  dropoffSuburb?: string | null;
  dropoffLatitude?: number | null;
  dropoffLongitude?: number | null;

  schoolLatitude?: number | null;
  schoolLongitude?: number | null;

  serviceType?: CrmServiceType | null;

  requestedStartDate?: string | null;

  mondayMorning?: boolean;
  mondayAfternoon?: boolean;

  tuesdayMorning?: boolean;
  tuesdayAfternoon?: boolean;

  wednesdayMorning?: boolean;
  wednesdayAfternoon?: boolean;

  thursdayMorning?: boolean;
  thursdayAfternoon?: boolean;

  fridayMorning?: boolean;
  fridayAfternoon?: boolean;

  estimatedMonthlyValue?: number | null;

  routeAssessmentStatus?: RouteAssessmentStatus | null;

  notes?: string | null;

  whatsappContactId?: string | null;

  assignedTo?: string | null;
};

export type UpdateCrmEnquiryInput = {
  status?: CrmEnquiryStatus;

  parentFirstName?: string | null;
  parentLastName?: string | null;

  phoneNumber?: string | null;
  whatsappNumber?: string | null;
  email?: string | null;

  learnerName?: string | null;
  schoolName?: string | null;
  grade?: string | null;

  pickupAddress?: string | null;
  pickupSuburb?: string | null;
  pickupLatitude?: number | null;
  pickupLongitude?: number | null;

  dropoffAddress?: string | null;
  dropoffSuburb?: string | null;
  dropoffLatitude?: number | null;
  dropoffLongitude?: number | null;

  schoolLatitude?: number | null;
  schoolLongitude?: number | null;

  serviceType?: CrmServiceType | null;

  requestedStartDate?: string | null;

  mondayMorning?: boolean;
  mondayAfternoon?: boolean;

  tuesdayMorning?: boolean;
  tuesdayAfternoon?: boolean;

  wednesdayMorning?: boolean;
  wednesdayAfternoon?: boolean;

  thursdayMorning?: boolean;
  thursdayAfternoon?: boolean;

  fridayMorning?: boolean;
  fridayAfternoon?: boolean;

  estimatedMonthlyValue?: number | null;

  lastContactAt?: string | null;
  nextFollowUpAt?: string | null;

  lossReason?: CrmLossReason | null;
  lossNotes?: string | null;

  routeAssessmentStatus?: RouteAssessmentStatus | null;
  routeAssessmentNotes?: string | null;

  suggestedMonthlyFee?: number | null;
  quotedMonthlyFee?: number | null;

  estimatedAdditionalDailyKm?: number | null;
  estimatedMonthlyOperatingCost?: number | null;

  routeMatchScore?: number | null;

  notes?: string | null;

  whatsappContactId?: string | null;

  assignedTo?: string | null;
};

export async function createCrmEnquiry(
  input: CreateCrmEnquiryInput,
) {
  const {
    data,
    error,
  } = await supabase
    .from("crm_enquiries")
    .insert({
      source:
        input.source ??
        "website",

      status:
        "new",

      parent_first_name:
        input.parentFirstName ??
        null,

      parent_last_name:
        input.parentLastName ??
        null,

      phone_number:
        input.phoneNumber ??
        null,

      whatsapp_number:
        input.whatsappNumber ??
        null,

      email:
        input.email ??
        null,

      learner_name:
        input.learnerName ??
        null,

      school_name:
        input.schoolName ??
        null,

      grade:
        input.grade ??
        null,

      pickup_address:
        input.pickupAddress ??
        null,

      pickup_suburb:
        input.pickupSuburb ??
        null,

      pickup_latitude:
        input.pickupLatitude ??
        null,

      pickup_longitude:
        input.pickupLongitude ??
        null,

      dropoff_address:
        input.dropoffAddress ??
        null,

      dropoff_suburb:
        input.dropoffSuburb ??
        null,

      dropoff_latitude:
        input.dropoffLatitude ??
        null,

      dropoff_longitude:
        input.dropoffLongitude ??
        null,

      school_latitude:
        input.schoolLatitude ??
        null,

      school_longitude:
        input.schoolLongitude ??
        null,

      service_type:
        input.serviceType ??
        null,

      requested_start_date:
        input.requestedStartDate ??
        null,

      monday_morning:
        input.mondayMorning ??
        false,

      monday_afternoon:
        input.mondayAfternoon ??
        false,

      tuesday_morning:
        input.tuesdayMorning ??
        false,

      tuesday_afternoon:
        input.tuesdayAfternoon ??
        false,

      wednesday_morning:
        input.wednesdayMorning ??
        false,

      wednesday_afternoon:
        input.wednesdayAfternoon ??
        false,

      thursday_morning:
        input.thursdayMorning ??
        false,

      thursday_afternoon:
        input.thursdayAfternoon ??
        false,

      friday_morning:
        input.fridayMorning ??
        false,

      friday_afternoon:
        input.fridayAfternoon ??
        false,

      estimated_monthly_value:
        input.estimatedMonthlyValue ??
        null,

      route_assessment_status:
        input.routeAssessmentStatus ??
        "not_assessed",

      notes:
        input.notes ??
        null,

      whatsapp_contact_id:
        input.whatsappContactId ??
        null,

      assigned_to:
        input.assignedTo ??
        null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getCrmEnquiries({
  status,
}: {
  status?: string;
} = {}) {
  let query =
    supabase
      .from("crm_enquiries")
      .select("*")
      .order(
        "created_at",
        {
          ascending: false,
        },
      );

  if (status) {
    query =
      query.eq(
        "status",
        status,
      );
  }

  const {
    data,
    error,
  } =
    await query;

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getCrmEnquiryById(
  enquiryId: string,
) {
  const {
    data: enquiry,
    error: enquiryError,
  } = await supabase
    .from("crm_enquiries")
    .select("*")
    .eq(
      "id",
      enquiryId,
    )
    .single();

  if (enquiryError) {
    throw enquiryError;
  }

  const [
    quotesResult,
    followupsResult,
    activityResult,
  ] =
    await Promise.all([
      supabase
        .from("crm_quotes")
        .select("*")
        .eq(
          "enquiry_id",
          enquiryId,
        )
        .order(
          "created_at",
          {
            ascending: false,
          },
        ),

      supabase
        .from(
          "crm_followups",
        )
        .select("*")
        .eq(
          "enquiry_id",
          enquiryId,
        )
        .order(
          "due_at",
          {
            ascending: true,
          },
        ),

      supabase
        .from(
          "crm_enquiry_activity",
        )
        .select("*")
        .eq(
          "enquiry_id",
          enquiryId,
        )
        .order(
          "created_at",
          {
            ascending: false,
          },
        ),
    ]);

  if (quotesResult.error) {
    throw quotesResult.error;
  }

  if (followupsResult.error) {
    throw followupsResult.error;
  }

  if (activityResult.error) {
    throw activityResult.error;
  }

  return {
    ...enquiry,

    quotes:
      quotesResult.data ??
      [],

    followups:
      followupsResult.data ??
      [],

    activity:
      activityResult.data ??
      [],
  };
}

export async function updateCrmEnquiry(
  enquiryId: string,
  input: UpdateCrmEnquiryInput,
) {
  const updateData: Record<
    string,
    unknown
  > = {
    updated_at:
      new Date().toISOString(),
  };

  const mappings: Array<
    [
      keyof UpdateCrmEnquiryInput,
      string,
    ]
  > = [
    ["status", "status"],

    [
      "parentFirstName",
      "parent_first_name",
    ],

    [
      "parentLastName",
      "parent_last_name",
    ],

    [
      "phoneNumber",
      "phone_number",
    ],

    [
      "whatsappNumber",
      "whatsapp_number",
    ],

    ["email", "email"],

    [
      "learnerName",
      "learner_name",
    ],

    [
      "schoolName",
      "school_name",
    ],

    ["grade", "grade"],

    [
      "pickupAddress",
      "pickup_address",
    ],

    [
      "pickupSuburb",
      "pickup_suburb",
    ],

    [
      "pickupLatitude",
      "pickup_latitude",
    ],

    [
      "pickupLongitude",
      "pickup_longitude",
    ],

    [
      "dropoffAddress",
      "dropoff_address",
    ],

    [
      "dropoffSuburb",
      "dropoff_suburb",
    ],

    [
      "dropoffLatitude",
      "dropoff_latitude",
    ],

    [
      "dropoffLongitude",
      "dropoff_longitude",
    ],

    [
      "schoolLatitude",
      "school_latitude",
    ],

    [
      "schoolLongitude",
      "school_longitude",
    ],

    [
      "serviceType",
      "service_type",
    ],

    [
      "requestedStartDate",
      "requested_start_date",
    ],

    [
      "mondayMorning",
      "monday_morning",
    ],

    [
      "mondayAfternoon",
      "monday_afternoon",
    ],

    [
      "tuesdayMorning",
      "tuesday_morning",
    ],

    [
      "tuesdayAfternoon",
      "tuesday_afternoon",
    ],

    [
      "wednesdayMorning",
      "wednesday_morning",
    ],

    [
      "wednesdayAfternoon",
      "wednesday_afternoon",
    ],

    [
      "thursdayMorning",
      "thursday_morning",
    ],

    [
      "thursdayAfternoon",
      "thursday_afternoon",
    ],

    [
      "fridayMorning",
      "friday_morning",
    ],

    [
      "fridayAfternoon",
      "friday_afternoon",
    ],

    [
      "estimatedMonthlyValue",
      "estimated_monthly_value",
    ],

    [
      "lastContactAt",
      "last_contact_at",
    ],

    [
      "nextFollowUpAt",
      "next_follow_up_at",
    ],

    [
      "lossReason",
      "loss_reason",
    ],

    [
      "lossNotes",
      "loss_notes",
    ],

    [
      "routeAssessmentStatus",
      "route_assessment_status",
    ],

    [
      "routeAssessmentNotes",
      "route_assessment_notes",
    ],

    [
      "suggestedMonthlyFee",
      "suggested_monthly_fee",
    ],

    [
      "quotedMonthlyFee",
      "quoted_monthly_fee",
    ],

    [
      "estimatedAdditionalDailyKm",
      "estimated_additional_daily_km",
    ],

    [
      "estimatedMonthlyOperatingCost",
      "estimated_monthly_operating_cost",
    ],

    [
      "routeMatchScore",
      "route_match_score",
    ],

    ["notes", "notes"],

    [
      "whatsappContactId",
      "whatsapp_contact_id",
    ],

    [
      "assignedTo",
      "assigned_to",
    ],
  ];

  for (
    const [
      inputKey,
      databaseKey,
    ] of mappings
  ) {
    if (
      input[inputKey] !==
      undefined
    ) {
      updateData[databaseKey] =
        input[inputKey];
    }
  }

  const {
    data,
    error,
  } = await supabase
    .from("crm_enquiries")
    .update(
      updateData,
    )
    .eq(
      "id",
      enquiryId,
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createCrmQuote({
  enquiryId,
  serviceType,
  monthlyAmount,
  onceOffAmount = 0,
  discountAmount = 0,
  validUntil,
  notes,
  createdBy,
}: {
  enquiryId: string;

  serviceType:
    CrmServiceType;

  monthlyAmount: number;

  onceOffAmount?: number;

  discountAmount?: number;

  validUntil?: string | null;

  notes?: string | null;

  createdBy?: string | null;
}) {
  const finalMonthlyAmount =
    Math.max(
      0,
      monthlyAmount -
        discountAmount,
    );

  const {
    data,
    error,
  } = await supabase
    .from("crm_quotes")
    .insert({
      enquiry_id:
        enquiryId,

      service_type:
        serviceType,

      monthly_amount:
        monthlyAmount,

      once_off_amount:
        onceOffAmount,

      discount_amount:
        discountAmount,

      final_monthly_amount:
        finalMonthlyAmount,

      valid_until:
        validUntil ??
        null,

      notes:
        notes ??
        null,

      created_by:
        createdBy ??
        null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createCrmFollowup({
  enquiryId,
  followupType,
  dueAt,
  note,
  createdBy,
}: {
  enquiryId: string;

  followupType:
    | "whatsapp"
    | "phone"
    | "email"
    | "meeting"
    | "task";

  dueAt: string;

  note?: string | null;

  createdBy?: string | null;
}) {
  const {
    data,
    error,
  } = await supabase
    .from(
      "crm_followups",
    )
    .insert({
      enquiry_id:
        enquiryId,

      followup_type:
        followupType,

      due_at:
        dueAt,

      note:
        note ??
        null,

      created_by:
        createdBy ??
        null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  await supabase
    .from("crm_enquiries")
    .update({
      next_follow_up_at:
        dueAt,

      status:
        "follow_up",

      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "id",
      enquiryId,
    );

  return data;
}

export async function createCrmActivity({
  enquiryId,
  activityType,
  description,
  metadata,
  performedBy,
}: {
  enquiryId: string;

  activityType: string;

  description?: string | null;

  metadata?: Record<
    string,
    unknown
  > | null;

  performedBy?: string | null;
}) {
  const {
    data,
    error,
  } = await supabase
    .from(
      "crm_enquiry_activity",
    )
    .insert({
      enquiry_id:
        enquiryId,

      activity_type:
        activityType,

      description:
        description ??
        null,

      metadata:
        metadata ??
        null,

      performed_by:
        performedBy ??
        null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}