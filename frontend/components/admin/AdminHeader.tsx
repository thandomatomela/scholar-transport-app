"use client";

import { usePathname } from "next/navigation";

function getPageTitle(
  pathname: string,
): string {
  if (
    pathname ===
    "/admin"
  ) {
    return "Dashboard";
  }

  if (
    pathname.startsWith(
      "/admin/learners",
    )
  ) {
    return "Learners";
  }

  if (
    pathname.startsWith(
      "/admin/drivers",
    )
  ) {
    return "Drivers";
  }

  if (
    pathname.startsWith(
      "/admin/vehicles",
    )
  ) {
    return "Vehicles";
  }

  if (
    pathname.startsWith(
      "/admin/routes",
    )
  ) {
    return "Routes";
  }

  if (
    pathname.startsWith(
      "/admin/trips",
    )
  ) {
    return "Trips";
  }

  return "Back Office";
}

export function AdminHeader() {
  const pathname =
    usePathname();

  const pageTitle =
    getPageTitle(
      pathname,
    );

  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
          Via Nova Back Office
        </p>

        <h2 className="mt-1 text-2xl font-bold text-slate-900">
          {pageTitle}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-slate-900">
            Administrator
          </p>

          <p className="text-xs text-slate-500">
            Operations
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
          AD
        </div>
      </div>
    </header>
  );
}