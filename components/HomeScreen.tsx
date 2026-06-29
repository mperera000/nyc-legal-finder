"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { loadOutreach, type OutreachEntry } from "@/lib/storage";

const STATUS_COLORS: Record<string, string> = {
  saved: "bg-gray-200",
  contacted: "bg-yellow-400",
  org_replied: "bg-green-400",
};

function daysSince(dateStr: string | null): number {
  if (!dateStr) return 0;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const [outreach, setOutreach] = useState<OutreachEntry[]>([]);

  useEffect(() => {
    setOutreach(loadOutreach());
  }, []);

  const needsAttention = outreach.filter(
    (e) => e.status === "contacted" && daysSince(e.contactedDate) >= 5
  );

  const trackerLabel =
    outreach.length > 0
      ? `${outreach.length} ${t("home.tracker_desc")}`
      : t("home.tracker_empty_desc");

  return (
    <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Hero */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("home.title")}</h1>
        <p className="text-sm text-gray-500 mt-1">{t("home.description")}</p>
      </div>

      {/* Empathetic banner */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl px-5 py-4">
        <p className="text-sm font-semibold text-indigo-900">You&rsquo;re not alone.</p>
        <p className="text-xs text-indigo-600 mt-1 leading-relaxed">
          Free legal help is available in NYC. This tool will help you find the right organization and keep track of your outreach.
        </p>
      </div>

      {/* Entry point cards */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/orgs"
          className="rounded-2xl bg-indigo-700 text-white p-5 flex flex-col gap-2 hover:bg-indigo-600 transition-colors"
        >
          <span className="text-2xl" aria-hidden="true">🔍</span>
          <p className="font-semibold text-base">{t("home.find_cta")}</p>
          <p className="text-xs text-indigo-100">{t("home.find_desc")}</p>
        </Link>

        <Link
          href="/tracker"
          className="rounded-2xl bg-white border border-gray-200 p-5 flex flex-col gap-2 hover:border-indigo-300 transition-colors"
        >
          <span className="text-2xl" aria-hidden="true">📋</span>
          <p className="font-semibold text-base text-gray-900">{t("home.tracker_cta")}</p>
          <p className="text-xs text-gray-500">{trackerLabel}</p>
        </Link>
      </div>

      <Link
        href="/guides"
        className="rounded-2xl bg-white border border-gray-200 p-5 flex items-center gap-4 hover:border-indigo-300 transition-colors"
      >
        <span className="text-2xl" aria-hidden="true">📖</span>
        <div>
          <p className="font-semibold text-gray-900">{t("home.guides_cta")}</p>
          <p className="text-xs text-gray-500">{t("home.guides_desc")}</p>
        </div>
        <span className="ml-auto text-gray-300">→</span>
      </Link>

      {/* Needs attention */}
      {needsAttention.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            {t("home.needs_attention")}
          </h2>
          <div className="flex flex-col gap-2">
            {needsAttention.map((entry) => (
              <Link
                key={entry.id}
                href="/tracker"
                className="bg-white border border-yellow-200 rounded-xl p-4 flex items-center gap-3 hover:border-yellow-400 transition-colors"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shrink-0" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{entry.orgName}</p>
                  <p className="text-xs text-yellow-700">
                    {t("home.follow_up_overdue", { days: daysSince(entry.contactedDate) })}
                  </p>
                </div>
                <span className="text-xs font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-full shrink-0">
                  {t("tracker.follow_up_due")}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent outreach when no attention needed */}
      {outreach.length > 0 && needsAttention.length === 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            {t("home.tracker_cta")}
          </h2>
          <div className="flex flex-col gap-2">
            {outreach.slice(0, 3).map((entry) => (
              <Link
                key={entry.id}
                href="/tracker"
                className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:border-indigo-200 transition-colors"
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${STATUS_COLORS[entry.status]}`}
                  aria-hidden="true"
                />
                <p className="text-sm text-gray-800 truncate flex-1">{entry.orgName}</p>
                <span className="text-xs text-gray-400 capitalize shrink-0">
                  {t(`tracker.status_${entry.status}`)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
