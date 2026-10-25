"use client";

import {
  FormEvent,
  useState,
} from "react";

type ServiceType =
  | "morning"
  | "afternoon"
  | "return";

type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday";

type SelectedDays = Record<
  Weekday,
  boolean
>;

const weekdays: Array<{
  key: Weekday;
  short: string;
  label: string;
}> = [
  {
    key: "monday",
    short: "Mon",
    label: "Monday",
  },
  {
    key: "tuesday",
    short: "Tue",
    label: "Tuesday",
  },
  {
    key: "wednesday",
    short: "Wed",
    label: "Wednesday",
  },
  {
    key: "thursday",
    short: "Thu",
    label: "Thursday",
  },
  {
    key: "friday",
    short: "Fri",
    label: "Friday",
  },
];

const defaultDays: SelectedDays = {
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
};

function FormSection({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description?: string;
  children:
    React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6 flex gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
          {number}
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-950">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {description}
            </p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}

export default function ApplyPage() {
  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    submittedReference,
    setSubmittedReference,
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
    grade,
    setGrade,
  ] = useState("");

  const [
    schoolName,
    setSchoolName,
  ] = useState("");

  const [
    pickupAddress,
    setPickupAddress,
  ] = useState("");

  const [
    pickupSuburb,
    setPickupSuburb,
  ] = useState("");

  const [
    sameDropoff,
    setSameDropoff,
  ] = useState(true);

  const [
    dropoffAddress,
    setDropoffAddress,
  ] = useState("");

  const [
    dropoffSuburb,
    setDropoffSuburb,
  ] = useState("");

  const [
    serviceType,
    setServiceType,
  ] = useState<ServiceType>(
    "return",
  );

  const [
    selectedDays,
    setSelectedDays,
  ] = useState<SelectedDays>(
    defaultDays,
  );

  const [
    requestedStartDate,
    setRequestedStartDate,
  ] = useState("");

  const [
    notes,
    setNotes,
  ] = useState("");

  /*
   * Honeypot.
   * Hidden from normal users.
   */
  const [
    companyWebsite,
    setCompanyWebsite,
  ] = useState("");

  function toggleDay(
    day: Weekday,
  ) {
    setSelectedDays(
      (current) => ({
        ...current,
        [day]:
          !current[day],
      }),
    );
  }

  function buildTripSelection() {
    const morning =
      serviceType ===
        "morning" ||
      serviceType ===
        "return";

    const afternoon =
      serviceType ===
        "afternoon" ||
      serviceType ===
        "return";

    return {
      mondayMorning:
        selectedDays.monday &&
        morning,

      mondayAfternoon:
        selectedDays.monday &&
        afternoon,

      tuesdayMorning:
        selectedDays.tuesday &&
        morning,

      tuesdayAfternoon:
        selectedDays.tuesday &&
        afternoon,

      wednesdayMorning:
        selectedDays.wednesday &&
        morning,

      wednesdayAfternoon:
        selectedDays.wednesday &&
        afternoon,

      thursdayMorning:
        selectedDays.thursday &&
        morning,

      thursdayAfternoon:
        selectedDays.thursday &&
        afternoon,

      fridayMorning:
        selectedDays.friday &&
        morning,

      fridayAfternoon:
        selectedDays.friday &&
        afternoon,
    };
  }

  async function submitEnquiry(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    if (
      !Object.values(
        selectedDays,
      ).some(Boolean)
    ) {
      setError(
        "Please select at least one day that transport is required.",
      );

      return;
    }

    try {
      setSubmitting(true);

      const response =
        await fetch(
          "/api/public/enquiries",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                parentFirstName:
                  parentFirstName.trim(),

                parentLastName:
                  parentLastName.trim(),

                whatsappNumber:
                  whatsappNumber.trim(),

                email:
                  email.trim() ||
                  null,

                learnerName:
                  learnerName.trim() ||
                  null,

                grade:
                  grade.trim() ||
                  null,

                schoolName:
                  schoolName.trim(),

                pickupAddress:
                  pickupAddress.trim(),

                pickupSuburb:
                  pickupSuburb.trim(),

                dropoffAddress:
                  sameDropoff
                    ? pickupAddress.trim()
                    : dropoffAddress.trim(),

                dropoffSuburb:
                  sameDropoff
                    ? pickupSuburb.trim()
                    : dropoffSuburb.trim(),

                serviceType,

                requestedStartDate:
                  requestedStartDate ||
                  null,

                ...buildTripSelection(),

                notes:
                  notes.trim() ||
                  null,

                companyWebsite,
              }),
          },
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ??
            "We could not submit your enquiry.",
        );
      }

      setSubmittedReference(
        data.enquiry
          ?.reference ??
          "Submitted",
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We could not submit your enquiry. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (
    submittedReference
  ) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-screen max-w-xl items-center px-5 py-12">
          <div className="w-full rounded-[2rem] border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
              ✓
            </div>

            <p className="mt-7 text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">
              Enquiry Received
            </p>

            <h1 className="mt-3 text-3xl font-bold text-slate-950">
              Thank you,
              {" "}
              {parentFirstName}.
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-600">
              We&apos;ve received
              your scholar transport
              enquiry and will assess
              the requested route.
              Via Nova will contact
              you using the WhatsApp
              number you provided.
            </p>

            <div className="mt-8 rounded-2xl bg-slate-950 p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Your reference
              </p>

              <p className="mt-2 text-2xl font-bold">
                {
                  submittedReference
                }
              </p>
            </div>

            <div className="mt-8 text-left">
              <p className="text-sm font-bold text-slate-900">
                What happens next?
              </p>

              <div className="mt-4 space-y-4">
                <div className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                    1
                  </div>

                  <p className="text-sm leading-6 text-slate-600">
                    We assess your
                    pickup location,
                    school and
                    transport
                    requirements.
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                    2
                  </div>

                  <p className="text-sm leading-6 text-slate-600">
                    If we can service
                    the route, we
                    provide you with
                    a quote.
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                    3
                  </div>

                  <p className="text-sm leading-6 text-slate-600">
                    Once you accept,
                    we&apos;ll send
                    you the full
                    learner
                    registration and
                    transport
                    agreement.
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-8 text-xs text-slate-400">
              Safe and On Time.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-5 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-black tracking-tight text-slate-950">
                VIA NOVA
              </p>

              <p className="text-xs font-semibold text-emerald-600">
                Safe and On Time.
              </p>
            </div>

            <div className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
              Scholar Transport
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">
            Get a Quote
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Tell us about your
            child&apos;s transport
            needs.
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-600">
            Complete the short
            enquiry below and
            we&apos;ll assess whether
            Via Nova can service the
            route before providing a
            monthly quotation.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={
            submitEnquiry
          }
          className="space-y-5"
        >
          <div
            aria-hidden="true"
            className="absolute -left-[9999px] h-px w-px overflow-hidden"
          >
            <label>
              Company website
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={
                  companyWebsite
                }
                onChange={(
                  event,
                ) =>
                  setCompanyWebsite(
                    event.target.value,
                  )
                }
              />
            </label>
          </div>

          <FormSection
            number="1"
            title="Parent / Guardian"
            description="We'll use these details to contact you about the enquiry."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">
                First name
                <span className="text-red-500">
                  {" "}
                  *
                </span>

                <input
                  required
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
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 font-normal text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Surname

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
                  placeholder="Surname"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 font-normal text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                WhatsApp number
                <span className="text-red-500">
                  {" "}
                  *
                </span>

                <input
                  required
                  type="tel"
                  inputMode="tel"
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
                  placeholder="e.g. 082 123 4567"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 font-normal text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Email

                <input
                  type="email"
                  inputMode="email"
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
                  placeholder="name@example.com"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 font-normal text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                />
              </label>
            </div>
          </FormSection>

          <FormSection
            number="2"
            title="Learner"
            description="Tell us which school the learner needs transport to or from."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">
                Learner name

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
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3.5 font-normal outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Grade

                <input
                  value={grade}
                  onChange={(
                    event,
                  ) =>
                    setGrade(
                      event.target.value,
                    )
                  }
                  placeholder="e.g. Grade 4"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3.5 font-normal outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                School
                <span className="text-red-500">
                  {" "}
                  *
                </span>

                <input
                  required
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
                  placeholder="School name"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3.5 font-normal outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                />
              </label>
            </div>
          </FormSection>

          <FormSection
            number="3"
            title="Pickup & Drop-off"
            description="This helps us assess whether your request fits an existing route or indicates demand for a new route."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">
                Pickup suburb
                <span className="text-red-500">
                  {" "}
                  *
                </span>

                <input
                  required
                  value={
                    pickupSuburb
                  }
                  onChange={(
                    event,
                  ) =>
                    setPickupSuburb(
                      event.target.value,
                    )
                  }
                  placeholder="e.g. Lorraine"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3.5 font-normal outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                Pickup address
                <span className="text-red-500">
                  {" "}
                  *
                </span>

                <input
                  required
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
                  placeholder="Street address"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3.5 font-normal outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                />
              </label>
            </div>

            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl bg-slate-50 p-4">
              <input
                type="checkbox"
                checked={
                  sameDropoff
                }
                onChange={(
                  event,
                ) =>
                  setSameDropoff(
                    event.target.checked,
                  )
                }
                className="mt-1 h-4 w-4"
              />

              <span>
                <span className="block text-sm font-bold text-slate-800">
                  Drop-off is the
                  same address
                </span>

                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  Untick this if the
                  learner needs to be
                  dropped at a
                  different address
                  in the afternoon.
                </span>
              </span>
            </label>

            {!sameDropoff && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700">
                  Drop-off suburb
                  <span className="text-red-500">
                    {" "}
                    *
                  </span>

                  <input
                    required
                    value={
                      dropoffSuburb
                    }
                    onChange={(
                      event,
                    ) =>
                      setDropoffSuburb(
                        event.target.value,
                      )
                    }
                    placeholder="Suburb"
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3.5 font-normal outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                  />
                </label>

                <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                  Drop-off address
                  <span className="text-red-500">
                    {" "}
                    *
                  </span>

                  <input
                    required
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
                    placeholder="Street address"
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3.5 font-normal outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                  />
                </label>
              </div>
            )}
          </FormSection>

          <FormSection
            number="4"
            title="Transport Required"
            description="Select the service and the school days transport is needed."
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  value:
                    "morning" as const,
                  title:
                    "Morning",
                  description:
                    "Home → School",
                },
                {
                  value:
                    "afternoon" as const,
                  title:
                    "Afternoon",
                  description:
                    "School → Home",
                },
                {
                  value:
                    "return" as const,
                  title:
                    "Return",
                  description:
                    "Morning + Afternoon",
                },
              ].map(
                (option) => {
                  const selected =
                    serviceType ===
                    option.value;

                  return (
                    <button
                      key={
                        option.value
                      }
                      type="button"
                      onClick={() =>
                        setServiceType(
                          option.value,
                        )
                      }
                      className={[
                        "rounded-2xl border p-4 text-left transition",
                        selected
                          ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100"
                          : "border-slate-200 bg-white hover:border-slate-300",
                      ].join(
                        " ",
                      )}
                    >
                      <p className="font-bold text-slate-900">
                        {
                          option.title
                        }
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {
                          option.description
                        }
                      </p>
                    </button>
                  );
                },
              )}
            </div>

            <div className="mt-6">
              <p className="text-sm font-bold text-slate-800">
                Which days?
              </p>

              <div className="mt-3 grid grid-cols-5 gap-2">
                {weekdays.map(
                  (day) => {
                    const selected =
                      selectedDays[
                        day.key
                      ];

                    return (
                      <button
                        key={
                          day.key
                        }
                        type="button"
                        title={
                          day.label
                        }
                        onClick={() =>
                          toggleDay(
                            day.key,
                          )
                        }
                        className={[
                          "rounded-xl px-2 py-3 text-sm font-bold transition",
                          selected
                            ? "bg-slate-950 text-white"
                            : "bg-slate-100 text-slate-500",
                        ].join(
                          " ",
                        )}
                      >
                        {
                          day.short
                        }
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            <label className="mt-6 block text-sm font-semibold text-slate-700">
              When would you like
              transport to start?

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
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3.5 font-normal outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 sm:max-w-xs"
              />
            </label>
          </FormSection>

          <FormSection
            number="5"
            title="Anything else?"
            description="Optional information that may help us understand your transport requirements."
          >
            <textarea
              value={notes}
              onChange={(
                event,
              ) =>
                setNotes(
                  event.target.value,
                )
              }
              maxLength={2000}
              rows={5}
              placeholder="For example: aftercare times, alternating days, temporary arrangements or anything else we should know."
              className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
            />
          </FormSection>

          <div className="rounded-3xl bg-slate-950 p-6 text-white sm:p-7">
            <h2 className="text-xl font-bold">
              Ready to request
              your quote?
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Submitting an enquiry
              does not commit you to
              the service. We&apos;ll
              first assess the route
              and confirm availability
              and pricing with you.
            </p>

            <button
              type="submit"
              disabled={
                submitting
              }
              className="mt-6 w-full rounded-2xl bg-emerald-400 px-6 py-4 text-base font-black text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {submitting
                ? "Submitting..."
                : "Request a Quote"}
            </button>
          </div>
        </form>

        <footer className="py-10 text-center text-xs text-slate-400">
          Via Nova Scholar Transport
          · Safe and On Time.
        </footer>
      </div>
    </main>
  );
}