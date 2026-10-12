"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "changes_requested"
  | "approved"
  | "rejected"
  | "converted";

type TransportApplication = {
  id: string;
  status: ApplicationStatus;
  reference_number: string | null;
  quoted_price: number | null;
  agreed_price: number | null;
  parent_notes: string | null;
  submitted_at: string | null;
  created_at: string;
};

type ApplicationsApiResponse = {
  data?: TransportApplication[];
  error?: string;
};

function getApiUrl(): string {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured.",
    );
  }

  return apiUrl;
}

function formatCurrency(
  value: number | null,
): string {
  if (value === null) {
    return "Not set";
  }

  return new Intl.NumberFormat(
    "en-ZA",
    {
      style: "currency",
      currency: "ZAR",
    },
  ).format(value);
}

function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "Not submitted";
  }

  const date =
    new Date(value);

  return date.toLocaleDateString(
    "en-ZA",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

function getStatusLabel(
  status: ApplicationStatus,
): string {
  switch (status) {
    case "draft":
      return "Draft";

    case "submitted":
      return "Submitted";

    case "under_review":
      return "Under Review";

    case "changes_requested":
      return "Changes Requested";

    case "approved":
      return "Approved";

    case "rejected":
      return "Rejected";

    case "converted":
      return "Converted";

    default:
      return status;
  }
}

function getStatusClasses(
  status: ApplicationStatus,
): string {
  switch (status) {
    case "submitted":
      return "bg-blue-50 text-blue-700";

    case "under_review":
      return "bg-amber-50 text-amber-700";

    case "changes_requested":
      return "bg-orange-50 text-orange-700";

    case "approved":
      return "bg-emerald-50 text-emerald-700";

    case "converted":
      return "bg-violet-50 text-violet-700";

    case "rejected":
      return "bg-red-50 text-red-700";

    case "draft":
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default function ApplicationsPage() {
  const [
    applications,
    setApplications,
  ] =
    useState<
      TransportApplication[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    searchTerm,
    setSearchTerm,
  ] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<
      "all" | ApplicationStatus
    >("all");

  useEffect(() => {
    async function loadApplications() {
      try {
        setLoading(true);
        setError(null);

        const apiUrl =
          getApiUrl();

        const response =
          await fetch(
            `${apiUrl}/applications`,
            {
              cache: "no-store",
            },
          );

        const result =
          (await response.json()) as
            ApplicationsApiResponse;

        if (
          !response.ok ||
          !result.data
        ) {
          throw new Error(
            result.error ??
              "Failed to load applications.",
          );
        }

        setApplications(
          result.data,
        );
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load applications.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadApplications();
  }, []);

  const filteredApplications =
    useMemo(
      () => {
        const normalizedSearch =
          searchTerm
            .trim()
            .toLowerCase();

        return applications.filter(
          (application) => {
            const matchesSearch =
              !normalizedSearch ||
              (
                application
                  .reference_number ??
                ""
              )
                .toLowerCase()
                .includes(
                  normalizedSearch,
                ) ||
              (
                application
                  .parent_notes ??
                ""
              )
                .toLowerCase()
                .includes(
                  normalizedSearch,
                );

            const matchesStatus =
              statusFilter ===
                "all" ||
              application.status ===
                statusFilter;

            return (
              matchesSearch &&
              matchesStatus
            );
          },
        );
      },
      [
        applications,
        searchTerm,
        statusFilter,
      ],
    );

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold text-slate-500">
          Registration workflow
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Applications
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Review submitted transport applications,
          verify operational details, and prepare
          approved families for onboarding.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total"
          value={
            applications.length
          }
        />

        <StatCard
          label="Submitted"
          value={
            applications.filter(
              (application) =>
                application.status ===
                "submitted",
            ).length
          }
        />

        <StatCard
          label="Under Review"
          value={
            applications.filter(
              (application) =>
                application.status ===
                "under_review",
            ).length
          }
        />

        <StatCard
          label="Approved"
          value={
            applications.filter(
              (application) =>
                application.status ===
                "approved" ||
                application.status ===
                  "converted",
            ).length
          }
        />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-bold text-slate-900">
                Transport applications
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {
                  filteredApplications.length
                }{" "}
                application
                {
                  filteredApplications.length ===
                  1
                    ? ""
                    : "s"
                }{" "}
                shown
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                value={
                  searchTerm
                }
                onChange={(event) => {
                  setSearchTerm(
                    event.target.value,
                  );
                }}
                placeholder="Search reference..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white sm:w-64"
              />

              <select
                value={
                  statusFilter
                }
                onChange={(event) => {
                  setStatusFilter(
                    event.target
                      .value as
                      | "all"
                      | ApplicationStatus,
                  );
                }}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
              >
                <option value="all">
                  All statuses
                </option>

                <option value="submitted">
                  Submitted
                </option>

                <option value="under_review">
                  Under Review
                </option>

                <option value="changes_requested">
                  Changes Requested
                </option>

                <option value="approved">
                  Approved
                </option>

                <option value="rejected">
                  Rejected
                </option>

                <option value="converted">
                  Converted
                </option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

            <p className="mt-3 text-sm font-semibold text-slate-500">
              Loading applications...
            </p>
          </div>
        ) : null}

        {error ? (
          <div
            role="alert"
            className="m-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        ) : null}

        {!loading &&
        !error &&
        filteredApplications.length ===
          0 ? (
          <div className="p-10 text-center">
            <p className="font-semibold text-slate-700">
              No applications found
            </p>

            <p className="mt-1 text-sm text-slate-400">
              New transport applications will
              appear here after submission.
            </p>
          </div>
        ) : null}

        {!loading &&
        !error &&
        filteredApplications.length >
          0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">
                    Reference
                  </th>

                  <th className="px-5 py-3">
                    Submitted
                  </th>

                  <th className="px-5 py-3">
                    Quoted
                  </th>

                  <th className="px-5 py-3">
                    Agreed
                  </th>

                  <th className="px-5 py-3">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredApplications.map(
                  (application) => (
                    <tr
                      key={
                        application.id
                      }
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {application.reference_number ??
                              "No reference"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {application.id.slice(
                              0,
                              8,
                            )}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(
                          application.submitted_at,
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                        {formatCurrency(
                          application.quoted_price,
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                        {formatCurrency(
                          application.agreed_price,
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={[
                            "rounded-full px-3 py-1 text-xs font-bold",
                            getStatusClasses(
                              application.status,
                            ),
                          ].join(" ")}
                        >
                          {getStatusLabel(
                            application.status,
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/applications/${application.id}`}
                          className="text-sm font-semibold text-emerald-700 hover:text-emerald-600"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: number;
};

function StatCard({
  label,
  value,
}: StatCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}