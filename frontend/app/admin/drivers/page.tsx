"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

type Driver = {
  id: string;
  full_name: string;
  phone: string | null;
  active: boolean;
  created_at: string;
};

type DriversApiResponse = {
  data?: Driver[];
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

export default function DriversPage() {
  const [
    drivers,
    setDrivers,
  ] =
    useState<Driver[]>([]);

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
    async function loadDrivers() {
      try {
        setLoading(true);
        setError(null);

        const apiUrl =
          getApiUrl();

        const response =
          await fetch(
            `${apiUrl}/drivers`,
            {
              cache: "no-store",
            },
          );

        const result =
          (await response.json()) as
            DriversApiResponse;

        if (
          !response.ok ||
          !result.data
        ) {
          throw new Error(
            result.error ??
              "Failed to load drivers.",
          );
        }

        setDrivers(
          result.data,
        );
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load drivers.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadDrivers();
  }, []);

  const filteredDrivers =
    useMemo(
      () => {
        const search =
          searchTerm
            .trim()
            .toLowerCase();

        if (!search) {
          return drivers;
        }

        return drivers.filter(
          (driver) =>
            driver.full_name
              .toLowerCase()
              .includes(search) ||
            (
              driver.phone ??
              ""
            )
              .toLowerCase()
              .includes(search),
        );
      },
      [
        drivers,
        searchTerm,
      ],
    );

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            Driver management
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Drivers
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Manage active and inactive
            transport drivers.
          </p>
        </div>

        <button
          type="button"
          className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-500"
        >
          + Add Driver
        </button>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-900">
                Registered drivers
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {drivers.length}
                {" "}
                driver
                {drivers.length === 1
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
              placeholder="Search drivers..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white sm:max-w-xs"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

            <p className="mt-3 text-sm font-semibold text-slate-500">
              Loading drivers...
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
        filteredDrivers.length ===
          0 ? (
          <div className="p-8 text-center">
            <p className="font-semibold text-slate-700">
              No drivers found
            </p>
          </div>
        ) : null}

        {!loading &&
        !error &&
        filteredDrivers.length >
          0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">
                    Driver
                  </th>

                  <th className="px-5 py-3">
                    Phone
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
                {filteredDrivers.map(
                  (driver) => (
                    <tr
                      key={
                        driver.id
                      }
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {
                              driver.full_name
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            ID:{" "}
                            {driver.id.slice(
                              0,
                              8,
                            )}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {driver.phone ??
                          "Not set"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={[
                            "rounded-full px-3 py-1 text-xs font-bold",
                            driver.active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600",
                          ].join(" ")}
                        >
                          {driver.active
                            ? "Active"
                            : "Inactive"}
                        </span>
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