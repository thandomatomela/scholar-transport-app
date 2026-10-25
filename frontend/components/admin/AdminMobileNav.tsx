"use client";

import Link from "next/link";
import {
  usePathname,
} from "next/navigation";

const navigationItems = [
  {
    label: "Dashboard",
    href: "/admin",
  },
  {
    label: "Applications",
    href: "/admin/applications",
  },
  {
    label: "Learners",
    href: "/admin/learners",
  },
  {
    label: "Drivers",
    href: "/admin/drivers",
  },
  {
    label: "Vehicles",
    href: "/admin/vehicles",
  },
  {
    label: "Routes",
    href: "/admin/routes",
  },
  {
    label: "Trips",
    href: "/admin/trips",
  },
  {
    label: "WhatsApp",
    href: "/admin/whatsapp",
  },
];

export function AdminMobileNav() {
  const pathname =
    usePathname();

  return (
    <nav className="border-b border-slate-200 bg-white lg:hidden">
      <div className="flex gap-2 overflow-x-auto px-4 py-3">
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
                  "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
                  isActive
                    ? "bg-slate-950 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          },
        )}
      </div>
    </nav>
  );
}