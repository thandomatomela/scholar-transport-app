"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  supabase,
} from "../../../lib/supabase/client";

type EnquiryStatus =
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

type ServiceType =
  | "morning"
  | "afternoon"
  | "return"
  | "custom";

type Enquiry = {
  id: string;
  enquiry_number: number;

  source: string;
  status: EnquiryStatus;

  parent_first_name: string | null;
  parent_last_name: string | null;

  phone_number: string | null;
  whatsapp_number: string | null;
  email: string | null;

  learner_name: string | null;
  school_name: string | null;
  grade: string | null;

  pickup_address: string | null;
  dropoff_address: string | null;

  service_type: ServiceType | null;

  requested_start_date: string | null;

  estimated_monthly_value: number | null;

  last_contact_at: string | null;
  next_follow_up_at: string | null;

  loss_reason: string | null;

  notes: string | null;

  created_at: string;
  updated_at: string;
};

const statusOptions: {
  value: EnquiryStatus | "all";
  label: string;
}[] = [
  {
    value: "all",
    label: "All",
  },
  {
    value: "new",
    label: "New",
  },
  {
    value: "registration_started",
    label: "Registration Started",
  },
  {
    value: "registration_submitted",
    label: "Registration Submitted",
  },
  {
    value: "route_assessment",
    label: "Route Assessment",
  },
  {
    value: "quote_sent",
    label: "Quote Sent",
  },
  {
    value: "follow_up",
    label: "Follow-up",
  },
  {
    value: "contract_pending",
    label: "Contract Pending",
  },
  {
    value: "won",
    label: "Won",
  },
  {
    value: "dormant",
    label: "Dormant",
  },
  {
    value: "lost",
    label: "Lost",
  },
];

function getStatusLabel(
  status: EnquiryStatus,
) {
  return (
    statusOptions.find(
      (item) =>
        item.value ===
        status,
    )?.label ??
    status
  );
}

function getStatusClass(
  status: EnquiryStatus,
) {
  switch (status) {
    case "new":
      return "bg-blue-50 text-blue-700";

    case "registration_started":
    case "registration_submitted":
      return "bg-violet-50 text-violet-700";

    case "route_assessment":
      return "bg-amber-50 text-amber-700";

    case "quote_sent":
      return "bg-cyan-50 text-cyan-700";

    case "follow_up":
      return "bg-orange-50 text-orange-700";

    case "contract_pending":
      return "bg-purple-50 text-purple-700";

    case "won":
      return "bg-emerald-50 text-emerald-700";

    case "dormant":
      return "bg-slate-100 text-slate-600";

    case "lost":
      return "bg-red-50 text-red-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

function formatCurrency(
  value: number | null,
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  return new Intl.NumberFormat(
    "en-ZA",
    {
      style: "currency",
      currency: "ZAR",
      maximumFractionDigits: 0,
    },
  ).format(value);
}

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-ZA",
    {
      dateStyle: "medium",
    },
  ).format(
    new Date(value),
  );
}

function formatEnquiryNumber(
  value: number,
) {
  return `VN-ENQ-${String(
    value,
  ).padStart(6, "0")}`;
}

export default function EnquiriesPage() {
  const router =
    useRouter();

  const [
    enquiries,
    setEnquiries,
  ] = useState<
    Enquiry[]
  >([]);

  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState<
    EnquiryStatus | "all"
  >("all");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    showCreateForm,
    setShowCreateForm,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    parentFirstName,
    setParentFirstName,
  ] = useState("");

  const [
    parentLastName,
    setParentLastName,
  ] = useState("");

  const [
    phoneNumber,
    setPhoneNumber,
  ] = useState("");

  const [
    whatsappNumber,
    setWhatsappNumber,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    learnerName,
    setLearnerName,
  ] = useState("");

  const [
    schoolName,
    setSchoolName,
  ] = useState("");

  const [
    grade,
    setGrade,
  ] = useState("");

  const [
    pickupAddress,
    setPickupAddress,
  ] = useState("");

  const [
    dropoffAddress,
    setDropoffAddress,
  ] = useState("");

  const [
    serviceType,
    setServiceType,
  ] = useState<ServiceType>(
    "return",
  );

  const [
    requestedStartDate,
    setRequestedStartDate,
  ] = useState("");

  const [
    estimatedMonthlyValue,
    setEstimatedMonthlyValue,
  ] = useState("");

  const [
    notes,
    setNotes,
  ] = useState("");

  useEffect(() => {
    void loadEnquiries();
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

  async function loadEnquiries() {
    try {
      setLoading(true);
      setError(null);

      const token =
        await getAccessToken();

      if (!token) {
        await handleUnauthorized();
        return;
      }

      const response =
        await fetch(
          "/api/crm/enquiries",
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
            "Failed to load enquiries",
        );
      }

      setEnquiries(
        data.enquiries ??
        [],
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load enquiries",
      );
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setParentFirstName("");
    setParentLastName("");
    setPhoneNumber("");
    setWhatsappNumber("");
    setEmail("");
    setLearnerName("");
    setSchoolName("");
    setGrade("");
    setPickupAddress("");
    setDropoffAddress("");
    setServiceType(
      "return",
    );
    setRequestedStartDate("");
    setEstimatedMonthlyValue("");
    setNotes("");
  }

  async function createEnquiry(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !parentFirstName.trim() &&
      !phoneNumber.trim() &&
      !whatsappNumber.trim()
    ) {
      setError(
        "Please provide at least a parent name or contact number.",
      );

      return;
    }

    try {
      setSaving(true);
      setError(null);

      const token =
        await getAccessToken();

      if (!token) {
        await handleUnauthorized();
        return;
      }

      const response =
        await fetch(
          "/api/crm/enquiries",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify({
                source:
                  "website",

                parentFirstName:
                  parentFirstName.trim() ||
                  null,

                parentLastName:
                  parentLastName.trim() ||
                  null,

                phoneNumber:
                  phoneNumber.trim() ||
                  null,

                whatsappNumber:
                  whatsappNumber.trim() ||
                  phoneNumber.trim() ||
                  null,

                email:
                  email.trim() ||
                  null,

                learnerName:
                  learnerName.trim() ||
                  null,

                schoolName:
                  schoolName.trim() ||
                  null,

                grade:
                  grade.trim() ||
                  null,

                pickupAddress:
                  pickupAddress.trim() ||
                  null,

                dropoffAddress:
                  dropoffAddress.trim() ||
                  null,

                serviceType,

                requestedStartDate:
                  requestedStartDate ||
                  null,

                estimatedMonthlyValue:
                  estimatedMonthlyValue
                    ? Number(
                        estimatedMonthlyValue,
                      )
                    : null,

                notes:
                  notes.trim() ||
                  null,
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
            "Failed to create enquiry",
        );
      }

      resetForm();

      setShowCreateForm(
        false,
      );

      await loadEnquiries();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create enquiry",
      );
    } finally {
      setSaving(false);
    }
  }

  const filteredEnquiries =
    useMemo(
      () =>
        selectedStatus ===
        "all"
          ? enquiries
          : enquiries.filter(
              (enquiry) =>
                enquiry.status ===
                selectedStatus,
            ),
      [
        enquiries,
        selectedStatus,
      ],
    );

  const activePipeline =
    enquiries.filter(
      (enquiry) =>
        ![
          "won",
          "lost",
          "dormant",
        ].includes(
          enquiry.status,
        ),
    );

  const pipelineValue =
    activePipeline.reduce(
      (
        total,
        enquiry,
      ) =>
        total +
        Number(
          enquiry.estimated_monthly_value ??
            0,
        ),
      0,
    );

  const followups =
    enquiries.filter(
      (enquiry) =>
        enquiry.status ===
        "follow_up",
    ).length;

  const won =
    enquiries.filter(
      (enquiry) =>
        enquiry.status ===
        "won",
    ).length;

  return (
    <main className="p-4 md:p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
            Sales Pipeline
          </p>

          <h1 className="mt-2 text-2xl font-bold text-slate-950">
            Enquiries
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage prospective
            parents from first
            contact through to
            becoming an active
            customer.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowCreateForm(
              true,
            )
          }
          className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
        >
          + New Enquiry
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Total Enquiries
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {
              enquiries.length
            }
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Active Pipeline
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {
              activePipeline.length
            }
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Follow-ups Due
          </p>

          <p className="mt-2 text-3xl font-bold text-orange-600">
            {
              followups
            }
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Pipeline Value
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-700">
            {formatCurrency(
              pipelineValue,
            )}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Potential monthly
            revenue
          </p>
        </div>
      </div>

      <div className="mb-5 overflow-x-auto">
        <div className="flex min-w-max gap-2">
          {statusOptions.map(
            (status) => {
              const active =
                selectedStatus ===
                status.value;

              return (
                <button
                  key={
                    status.value
                  }
                  type="button"
                  onClick={() =>
                    setSelectedStatus(
                      status.value,
                    )
                  }
                  className={[
                    "rounded-full px-4 py-2 text-sm font-semibold transition",
                    active
                      ? "bg-slate-950 text-white"
                      : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
                  ].join(
                    " ",
                  )}
                >
                  {
                    status.label
                  }
                </button>
              );
            },
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-sm text-slate-500">
            Loading enquiries...
          </div>
        ) : filteredEnquiries.length ===
          0 ? (
          <div className="p-10 text-center">
            <div className="text-4xl">
              📋
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              No enquiries
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              New prospective
              customers will appear
              here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredEnquiries.map(
              (enquiry) => {
                const parentName =
                  [
                    enquiry.parent_first_name,
                    enquiry.parent_last_name,
                  ]
                    .filter(
                      Boolean,
                    )
                    .join(" ") ||
                  enquiry.whatsapp_number ||
                  enquiry.phone_number ||
                  "Unknown parent";

                const route =
                  [
                    enquiry.pickup_address,
                    enquiry.school_name,
                  ]
                    .filter(
                      Boolean,
                    )
                    .join(" → ");

                return (
                  <button
                    key={
                      enquiry.id
                    }
                    type="button"
                    className="grid w-full gap-4 p-5 text-left transition hover:bg-slate-50 md:grid-cols-[1.4fr_1.5fr_1fr_auto]"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-400">
                        {formatEnquiryNumber(
                          enquiry.enquiry_number,
                        )}
                      </p>

                      <p className="mt-1 font-bold text-slate-950">
                        {
                          parentName
                        }
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {enquiry.learner_name ||
                          "Learner not yet supplied"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Transport
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {route ||
                          "Route not yet supplied"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {enquiry.service_type
                          ? `${getStatusLabel(
                              enquiry.status,
                            )} · ${enquiry.service_type}`
                          : getStatusLabel(
                              enquiry.status,
                            )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Value
                      </p>

                      <p className="mt-1 font-bold text-slate-900">
                        {formatCurrency(
                          enquiry.estimated_monthly_value,
                        )}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Start:{" "}
                        {formatDate(
                          enquiry.requested_start_date,
                        )}
                      </p>
                    </div>

                    <div className="flex items-center md:justify-end">
                      <span
                        className={[
                          "rounded-full px-3 py-1.5 text-xs font-bold",
                          getStatusClass(
                            enquiry.status,
                          ),
                        ].join(
                          " ",
                        )}
                      >
                        {getStatusLabel(
                          enquiry.status,
                        )}
                      </span>
                    </div>
                  </button>
                );
              },
            )}
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-slate-400">
        Won customers: {won}
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4">
          <div className="mx-auto my-8 max-w-3xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
                  CRM
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-950">
                  New Enquiry
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Capture what we
                  currently know. Missing
                  information can be
                  completed later.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCreateForm(
                    false,
                  )
                }
                className="rounded-xl px-3 py-2 text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={
                createEnquiry
              }
              className="space-y-6 p-6"
            >
              <section>
                <h3 className="font-bold text-slate-900">
                  Parent / Guardian
                </h3>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <input
                    value={
                      parentFirstName
                    }
                    onChange={(
                      event,
                    ) =>
                      setParentFirstName(
                        event.target.value,
                      )
                    }
                    placeholder="First name"
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  />

                  <input
                    value={
                      parentLastName
                    }
                    onChange={(
                      event,
                    ) =>
                      setParentLastName(
                        event.target.value,
                      )
                    }
                    placeholder="Last name"
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  />

                  <input
                    value={
                      phoneNumber
                    }
                    onChange={(
                      event,
                    ) =>
                      setPhoneNumber(
                        event.target.value,
                      )
                    }
                    placeholder="Phone number"
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  />

                  <input
                    value={
                      whatsappNumber
                    }
                    onChange={(
                      event,
                    ) =>
                      setWhatsappNumber(
                        event.target.value,
                      )
                    }
                    placeholder="WhatsApp number"
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  />

                  <input
                    type="email"
                    value={
                      email
                    }
                    onChange={(
                      event,
                    ) =>
                      setEmail(
                        event.target.value,
                      )
                    }
                    placeholder="Email"
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 md:col-span-2"
                  />
                </div>
              </section>

              <section>
                <h3 className="font-bold text-slate-900">
                  Learner
                </h3>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <input
                    value={
                      learnerName
                    }
                    onChange={(
                      event,
                    ) =>
                      setLearnerName(
                        event.target.value,
                      )
                    }
                    placeholder="Learner name"
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  />

                  <input
                    value={
                      grade
                    }
                    onChange={(
                      event,
                    ) =>
                      setGrade(
                        event.target.value,
                      )
                    }
                    placeholder="Grade"
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  />

                  <input
                    value={
                      schoolName
                    }
                    onChange={(
                      event,
                    ) =>
                      setSchoolName(
                        event.target.value,
                      )
                    }
                    placeholder="School"
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 md:col-span-2"
                  />
                </div>
              </section>

              <section>
                <h3 className="font-bold text-slate-900">
                  Transport Request
                </h3>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <input
                    value={
                      pickupAddress
                    }
                    onChange={(
                      event,
                    ) =>
                      setPickupAddress(
                        event.target.value,
                      )
                    }
                    placeholder="Pickup address"
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 md:col-span-2"
                  />

                  <input
                    value={
                      dropoffAddress
                    }
                    onChange={(
                      event,
                    ) =>
                      setDropoffAddress(
                        event.target.value,
                      )
                    }
                    placeholder="Drop-off address"
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 md:col-span-2"
                  />

                  <select
                    value={
                      serviceType
                    }
                    onChange={(
                      event,
                    ) =>
                      setServiceType(
                        event.target.value as ServiceType,
                      )
                    }
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  >
                    <option value="return">
                      Morning + Afternoon
                    </option>

                    <option value="morning">
                      Morning only
                    </option>

                    <option value="afternoon">
                      Afternoon only
                    </option>

                    <option value="custom">
                      Custom
                    </option>
                  </select>

                  <input
                    type="date"
                    value={
                      requestedStartDate
                    }
                    onChange={(
                      event,
                    ) =>
                      setRequestedStartDate(
                        event.target.value,
                      )
                    }
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  />

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      estimatedMonthlyValue
                    }
                    onChange={(
                      event,
                    ) =>
                      setEstimatedMonthlyValue(
                        event.target.value,
                      )
                    }
                    placeholder="Estimated monthly value"
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 md:col-span-2"
                  />

                  <textarea
                    value={
                      notes
                    }
                    onChange={(
                      event,
                    ) =>
                      setNotes(
                        event.target.value,
                      )
                    }
                    placeholder="Notes"
                    rows={4}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 md:col-span-2"
                  />
                </div>
              </section>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() =>
                    setShowCreateForm(
                      false,
                    )
                  }
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                >
                  {saving
                    ? "Creating..."
                    : "Create Enquiry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}