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
  dropoffAddress?: string | null;

  serviceType?: CrmServiceType | null;

  requestedStartDate?: string | null;

  estimatedMonthlyValue?: number | null;

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
  dropoffAddress?: string | null;

  serviceType?: CrmServiceType | null;

  requestedStartDate?: string | null;

  estimatedMonthlyValue?: number | null;

  lastContactAt?: string | null;
  nextFollowUpAt?: string | null;

  lossReason?: CrmLossReason | null;
  lossNotes?: string | null;

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

      dropoff_address:
        input.dropoffAddress ??
        null,

      service_type:
        input.serviceType ??
        null,

      requested_start_date:
        input.requestedStartDate ??
        null,

      estimated_monthly_value:
        input.estimatedMonthlyValue ??
        null,

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

  if (
    input.status !==
    undefined
  ) {
    updateData.status =
      input.status;
  }

  if (
    input.parentFirstName !==
    undefined
  ) {
    updateData.parent_first_name =
      input.parentFirstName;
  }

  if (
    input.parentLastName !==
    undefined
  ) {
    updateData.parent_last_name =
      input.parentLastName;
  }

  if (
    input.phoneNumber !==
    undefined
  ) {
    updateData.phone_number =
      input.phoneNumber;
  }

  if (
    input.whatsappNumber !==
    undefined
  ) {
    updateData.whatsapp_number =
      input.whatsappNumber;
  }

  if (
    input.email !==
    undefined
  ) {
    updateData.email =
      input.email;
  }

  if (
    input.learnerName !==
    undefined
  ) {
    updateData.learner_name =
      input.learnerName;
  }

  if (
    input.schoolName !==
    undefined
  ) {
    updateData.school_name =
      input.schoolName;
  }

  if (
    input.grade !==
    undefined
  ) {
    updateData.grade =
      input.grade;
  }

  if (
    input.pickupAddress !==
    undefined
  ) {
    updateData.pickup_address =
      input.pickupAddress;
  }

  if (
    input.dropoffAddress !==
    undefined
  ) {
    updateData.dropoff_address =
      input.dropoffAddress;
  }

  if (
    input.serviceType !==
    undefined
  ) {
    updateData.service_type =
      input.serviceType;
  }

  if (
    input.requestedStartDate !==
    undefined
  ) {
    updateData.requested_start_date =
      input.requestedStartDate;
  }

  if (
    input.estimatedMonthlyValue !==
    undefined
  ) {
    updateData.estimated_monthly_value =
      input.estimatedMonthlyValue;
  }

  if (
    input.lastContactAt !==
    undefined
  ) {
    updateData.last_contact_at =
      input.lastContactAt;
  }

  if (
    input.nextFollowUpAt !==
    undefined
  ) {
    updateData.next_follow_up_at =
      input.nextFollowUpAt;
  }

  if (
    input.lossReason !==
    undefined
  ) {
    updateData.loss_reason =
      input.lossReason;
  }

  if (
    input.lossNotes !==
    undefined
  ) {
    updateData.loss_notes =
      input.lossNotes;
  }

  if (
    input.notes !==
    undefined
  ) {
    updateData.notes =
      input.notes;
  }

  if (
    input.whatsappContactId !==
    undefined
  ) {
    updateData.whatsapp_contact_id =
      input.whatsappContactId;
  }

  if (
    input.assignedTo !==
    undefined
  ) {
    updateData.assigned_to =
      input.assignedTo;
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