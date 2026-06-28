"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import LanguageToggle from "@/components/LanguageToggle";

export default function NavBar() {
  const { t } = useTranslation();
  const pathname = usePathname();

  const links = [
    { href: "/", label: t("nav.home") },
    { href: "/orgs", label: t("nav.orgs") },
    { href: "/tracker", label: t("nav.tracker") },
    { href: "/guides", label: t("nav.guides") },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-gray-900 hover:text-indigo-700 transition-colors text-xl" style={{ fontFamily: "var(--font-domine)", fontWeight: 600 }}>
          NYC Legal Aid
        </Link>
        <nav className="flex items-center gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${pathname === href
                ? "text-indigo-700 bg-indigo-50 font-medium"
                : "text-gray-600 hover:text-indigo-700 hover:bg-gray-100"
                }`}
              style={{ fontFamily: "var(--font-domine)", fontWeight: 400 }}
            >
              {label}
            </Link>
          ))}
          <LanguageToggle />
        </nav>
      </div>
    </header>
  );
}
