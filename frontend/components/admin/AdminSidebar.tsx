"use client";

import Link from "next/link";
import {
  usePathname,
} from "next/navigation";

const navigationItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: "▦",
  },
  {
    label: "Enquiries",
    href: "/admin/enquiries",
    icon: "📋",
  },
  {
    label: "Applications",
    href: "/admin/applications",
    icon: "📝",
  },
  {
    label: "Learners",
    href: "/admin/learners",
    icon: "🎓",
  },
  {
    label: "Drivers",
    href: "/admin/drivers",
    icon: "🚐",
  },
  {
    label: "Vehicles",
    href: "/admin/vehicles",
    icon: "🚙",
  },
  {
    label: "Routes",
    href: "/admin/routes",
    icon: "🗺️",
  },
  {
    label: "Trips",
    href: "/admin/trips",
    icon: "📍",
  },
  {
    label: "WhatsApp",
    href: "/admin/whatsapp",
    icon: "💬",
  },
];

export function AdminSidebar() {
  const pathname =
    usePathname();

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-slate-200 bg-slate-950 px-5 py-6 text-white lg:block">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
          Via Nova
        </p>

        <h1 className="mt-2 text-xl font-bold">
          Back Office
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Scholar Transport
        </p>
      </div>

      <nav className="space-y-2">
        {navigationItems.map(
          (item) => {
            const isActive =
              item.href ===
              "/admin"
                ? pathname ===
                  "/admin"
                : pathname.startsWith(
                    item.href,
                  );

            return (
              <Link
                key={
                  item.href
                }
                href={
                  item.href
                }
                className={[
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                  isActive
                    ? "bg-emerald-500 text-slate-950"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white",
                ].join(" ")}
              >
                <span
                  aria-hidden="true"
                  className="text-lg"
                >
                  {
                    item.icon
                  }
                </span>

                <span>
                  {
                    item.label
                  }
                </span>
              </Link>
            );
          },
        )}
      </nav>
    </aside>
  );
}