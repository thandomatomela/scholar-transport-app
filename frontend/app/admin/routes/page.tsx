"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

type RouteDirection =
  | "home_to_school"
  | "school_to_home"
  | "both"
  | null;

type RouteRecord = {
  id: string;
  name: string;
  direction: RouteDirection;
  active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type RoutesApiResponse = {
  data?: RouteRecord[];
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

function getDirectionLabel(
  direction: RouteDirection,
): string {
  switch (direction) {
    case "home_to_school":
      return "Home → School";

    case "school_to_home":
      return "School → Home";

    case "both":
      return "Both directions";

    default:
      return "Not set";
  }
}

export default function RoutesPage() {
  const [
    routes,
    setRoutes,
  ] =
    useState<RouteRecord[]>([]);

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

  useEffect(() => {
    async function loadRoutes() {
      try {
        setLoading(true);
        setError(null);

        const apiUrl =
          getApiUrl();

        const response =
          await fetch(
            `${apiUrl}/routes`,
            {
              cache: "no-store",
            },
          );

        const result =
          (await response.json()) as
            RoutesApiResponse;

        if (
          !response.ok ||
          !result.data
        ) {
          throw new Error(
            result.error ??
              "Failed to load routes.",
          );
        }

        setRoutes(
          result.data,
        );
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load routes.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadRoutes();
  }, []);

  const filteredRoutes =
    useMemo(
      () => {
        const search =
          searchTerm
            .trim()
            .toLowerCase();

        if (!search) {
          return routes;
        }

        return routes.filter(
          (route) => {
            const name =
              route.name
                .toLowerCase();

            const notes =
              route.notes
                ?.toLowerCase() ??
              "";

            return (
              name.includes(
                search,
              ) ||
              notes.includes(
                search,
              )
            );
          },
        );
      },
      [
        routes,
        searchTerm,
      ],
    );

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            Route management
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Routes
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Manage transport routes,
            direction, availability, and
            operational route information.
          </p>
        </div>

        <button
          type="button"
          className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-500"
        >
          + Add Route
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Routes"
          value={
            routes.length
          }
        />

        <StatCard
          label="Active"
          value={
            routes.filter(
              (route) =>
                route.active,
            ).length
          }
        />

        <StatCard
          label="Both Directions"
          value={
            routes.filter(
              (route) =>
                route.direction ===
                "both",
            ).length
          }
        />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-900">
                Transport routes
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {routes.length}
                {" "}
                route
                {routes.length === 1
                  ? ""
                  : "s"}{" "}
                registered
              </p>
            </div>

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
              placeholder="Search routes..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white sm:max-w-xs"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

            <p className="mt-3 text-sm font-semibold text-slate-500">
              Loading routes...
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
        filteredRoutes.length ===
          0 ? (
          <div className="p-8 text-center">
            <p className="font-semibold text-slate-700">
              No routes found
            </p>
          </div>
        ) : null}

        {!loading &&
        !error &&
        filteredRoutes.length >
          0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">
                    Route
                  </th>

                  <th className="px-5 py-3">
                    Direction
                  </th>

                  <th className="px-5 py-3">
                    Status
                  </th>

                  <th className="px-5 py-3">
                    Notes
                  </th>

                  <th className="px-5 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredRoutes.map(
                  (route) => (
                    <tr
                      key={
                        route.id
                      }
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {
                              route.name
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Route ID:{" "}
                            {route.id.slice(
                              0,
                              8,
                            )}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                        {getDirectionLabel(
                          route.direction,
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={[
                            "rounded-full px-3 py-1 text-xs font-bold",
                            route.active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600",
                          ].join(" ")}
                        >
                          {route.active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {route.notes ??
                          "No notes"}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          className="text-sm font-semibold text-emerald-700 hover:text-emerald-600"
                        >
                          View
                        </button>
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