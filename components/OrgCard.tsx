"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { EligibilityStatus } from "@/lib/eligibility";
import { addOutreach, isTracked } from "@/lib/storage";

interface Org {
  id: string;
  name: string;
  boroughs: string[];
  caseTypes: string[];
  incomeLimit_pct_fpl: number;
  phone: string;
  hours: string;
  languages: string[];
  walkIns: boolean;
  website: string;
  notes_en: string;
  notes_es: string;
}

interface OrgCardProps {
  org: Org;
  eligibility: EligibilityStatus;
}

const BADGE_STYLES: Record<EligibilityStatus, string> = {
  likely: "bg-green-100 text-green-800 border-green-200",
  check: "bg-yellow-100 text-yellow-800 border-yellow-200",
  unlikely: "bg-red-100 text-red-700 border-red-200",
};

export default function OrgCard({ org, eligibility }: OrgCardProps) {
  const { t, i18n } = useTranslation();
  const notes = i18n.language === "es" ? org.notes_es : org.notes_en;
  const [tracked, setTracked] = useState(false);

  useEffect(() => {
    setTracked(isTracked(org.id));
  }, [org.id]);

  function handleAddOutreach() {
    addOutreach({ orgId: org.id, orgName: org.name });
    setTracked(true);
  }

  return (
    <article className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-gray-900 text-base leading-snug">{org.name}</h3>
        <span
          className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${BADGE_STYLES[eligibility]}`}
          title={t(`eligibility.${eligibility}_desc`)}
        >
          {t(`eligibility.${eligibility}`)}
        </span>
      </div>

      {/* Notes */}
      <p className="text-sm text-gray-600 leading-relaxed">{notes}</p>

      {/* Details grid */}
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm">
        <div>
          <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            {t("orgs.phone")}
          </dt>
          <dd>
            <a href={`tel:${org.phone}`} className="text-indigo-700 hover:underline">
              {org.phone}
            </a>
          </dd>
        </div>

        <div>
          <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            {t("orgs.hours")}
          </dt>
          <dd className="text-gray-700">{org.hours}</dd>
        </div>

        <div>
          <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            {t("orgs.languages")}
          </dt>
          <dd className="text-gray-700">{org.languages.join(", ")}</dd>
        </div>

        <div>
          <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            {t("orgs.income_limit", { pct: org.incomeLimit_pct_fpl })}
          </dt>
          <dd className="text-gray-700">
            {org.walkIns && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                ✓ {t("orgs.walk_ins")}
              </span>
            )}
          </dd>
        </div>
      </dl>

      {/* Boroughs */}
      <div className="flex flex-wrap gap-1.5">
        {org.boroughs.map((b) => (
          <span key={b} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {b}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-auto pt-1 border-t border-gray-100">
        <a
          href={org.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-indigo-700 hover:text-indigo-900 underline underline-offset-2"
          aria-label={`${t("orgs.website")} — ${org.name}`}
        >
          {t("orgs.website")} ↗
        </a>

        <button
          onClick={handleAddOutreach}
          disabled={tracked}
          className={`ml-auto text-sm font-medium px-3 py-1.5 rounded-full border transition-colors ${
            tracked
              ? "bg-green-50 text-green-700 border-green-200 cursor-default"
              : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
          }`}
          aria-label={tracked ? t("orgs.added_outreach") : t("orgs.add_outreach")}
        >
          {tracked ? `✓ ${t("orgs.added_outreach")}` : `+ ${t("orgs.add_outreach")}`}
        </button>
      </div>
    </article>
  );
}
