"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

type Learner = {
  id: string;
  full_name: string;
  school_name: string | null;
  parent_id: string | null;
};

type LearnersApiResponse = {
  data?: Learner[];
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

export default function LearnersPage() {
  const [
    learners,
    setLearners,
  ] =
    useState<Learner[]>([]);

  const [
    searchTerm,
    setSearchTerm,
  ] =
    useState("");

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

  useEffect(() => {
    async function loadLearners() {
      try {
        setLoading(true);
        setError(null);

        const apiUrl =
          getApiUrl();

        const response =
          await fetch(
            `${apiUrl}/learners`,
            {
              cache: "no-store",
            },
          );

        const result =
          (await response.json()) as
            LearnersApiResponse;

        if (
          !response.ok ||
          !result.data
        ) {
          throw new Error(
            result.error ??
              "Failed to load learners.",
          );
        }

        setLearners(
          result.data,
        );
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load learners.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadLearners();
  }, []);

  const filteredLearners =
    useMemo(
      () => {
        const normalizedSearch =
          searchTerm
            .trim()
            .toLowerCase();

        if (
          !normalizedSearch
        ) {
          return learners;
        }

        return learners.filter(
          (learner) => {
            const name =
              learner.full_name
                .toLowerCase();

            const school =
              learner.school_name
                ?.toLowerCase() ??
              "";

            return (
              name.includes(
                normalizedSearch,
              ) ||
              school.includes(
                normalizedSearch,
              )
            );
          },
        );
      },
      [
        learners,
        searchTerm,
      ],
    );

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            Learner management
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Learners
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Manage learner profiles,
            transport details, schools,
            and linked parent contacts.
          </p>
        </div>

        <button
          type="button"
          className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-500"
        >
          + Add Learner
        </button>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-900">
                Registered learners
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {learners.length}
                {" "}
                learner
                {learners.length === 1
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
              placeholder="Search learners..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white sm:max-w-xs"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

            <p className="mt-3 text-sm font-semibold text-slate-500">
              Loading learners...
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
        filteredLearners.length ===
          0 ? (
          <div className="p-8 text-center">
            <p className="font-semibold text-slate-700">
              No learners found
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Try another search.
            </p>
          </div>
        ) : null}

        {!loading &&
        !error &&
        filteredLearners.length >
          0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">
                    Learner
                  </th>

                  <th className="px-5 py-3">
                    School
                  </th>

                  <th className="px-5 py-3">
                    Parent
                  </th>

                  <th className="px-5 py-3">
                    Profile
                  </th>

                  <th className="px-5 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredLearners.map(
                  (learner) => (
                    <tr
                      key={
                        learner.id
                      }
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {
                              learner.full_name
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            ID:{" "}
                            {learner.id.slice(
                              0,
                              8,
                            )}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {learner.school_name ??
                          "Not set"}
                      </td>

                      <td className="px-5 py-4">
                        {learner.parent_id ? (
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                            Linked
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                            Not linked
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {learner.school_name &&
                        learner.parent_id ? (
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                            Complete
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                            Needs info
                          </span>
                        )}
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