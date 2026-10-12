"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

type Vehicle = {
  id: string;
  registration_number: string;
  make: string | null;
  model: string | null;
  year: number | null;
  capacity: number;
  active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type VehiclesApiResponse = {
  data?: Vehicle[];
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

export default function VehiclesPage() {
  const [
    vehicles,
    setVehicles,
  ] =
    useState<Vehicle[]>([]);

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
    async function loadVehicles() {
      try {
        setLoading(true);
        setError(null);

        const apiUrl =
          getApiUrl();

        const response =
          await fetch(
            `${apiUrl}/vehicles`,
            {
              cache: "no-store",
            },
          );

        const result =
          (await response.json()) as
            VehiclesApiResponse;

        if (
          !response.ok ||
          !result.data
        ) {
          throw new Error(
            result.error ??
              "Failed to load vehicles.",
          );
        }

        setVehicles(
          result.data,
        );
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load vehicles.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadVehicles();
  }, []);

  const filteredVehicles =
    useMemo(
      () => {
        const search =
          searchTerm
            .trim()
            .toLowerCase();

        if (!search) {
          return vehicles;
        }

        return vehicles.filter(
          (vehicle) => {
            const registration =
              vehicle.registration_number
                .toLowerCase();

            const make =
              vehicle.make
                ?.toLowerCase() ??
              "";

            const model =
              vehicle.model
                ?.toLowerCase() ??
              "";

            return (
              registration.includes(
                search,
              ) ||
              make.includes(
                search,
              ) ||
              model.includes(
                search,
              )
            );
          },
        );
      },
      [
        vehicles,
        searchTerm,
      ],
    );

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            Fleet management
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Vehicles
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Manage transport vehicles,
            capacity, availability, and
            operational fleet information.
          </p>
        </div>

        <button
          type="button"
          className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-500"
        >
          + Add Vehicle
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Vehicles"
          value={
            vehicles.length
          }
        />

        <StatCard
          label="Active"
          value={
            vehicles.filter(
              (vehicle) =>
                vehicle.active,
            ).length
          }
        />

        <StatCard
          label="Total Capacity"
          value={
            vehicles
              .filter(
                (vehicle) =>
                  vehicle.active,
              )
              .reduce(
                (
                  total,
                  vehicle,
                ) =>
                  total +
                  vehicle.capacity,
                0,
              )
          }
        />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-900">
                Fleet vehicles
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {vehicles.length}
                {" "}
                vehicle
                {vehicles.length === 1
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
              placeholder="Search vehicles..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white sm:max-w-xs"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

            <p className="mt-3 text-sm font-semibold text-slate-500">
              Loading vehicles...
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
        filteredVehicles.length ===
          0 ? (
          <div className="p-8 text-center">
            <p className="font-semibold text-slate-700">
              No vehicles found
            </p>
          </div>
        ) : null}

        {!loading &&
        !error &&
        filteredVehicles.length >
          0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">
                    Vehicle
                  </th>

                  <th className="px-5 py-3">
                    Registration
                  </th>

                  <th className="px-5 py-3">
                    Year
                  </th>

                  <th className="px-5 py-3">
                    Capacity
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
                {filteredVehicles.map(
                  (vehicle) => (
                    <tr
                      key={
                        vehicle.id
                      }
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {vehicle.make ??
                              "Unknown make"}{" "}
                            {vehicle.model ??
                              ""}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {vehicle.notes ??
                              "No notes"}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                        {
                          vehicle.registration_number
                        }
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {vehicle.year ??
                          "Not set"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                          {
                            vehicle.capacity
                          }{" "}
                          seats
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={[
                            "rounded-full px-3 py-1 text-xs font-bold",
                            vehicle.active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600",
                          ].join(" ")}
                        >
                          {vehicle.active
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