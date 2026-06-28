"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import guidesData from "@/data/guides.json";

const ALL_CASE_TYPES = Array.from(
  new Set(guidesData.flatMap((g) => g.caseTypes))
).sort();

const LANGUAGE_BADGES: Record<string, string> = {
  both: "bg-indigo-50 text-indigo-700 border-indigo-200",
  en: "bg-gray-100 text-gray-600 border-gray-200",
  es: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function GuidesScreen() {
  const { t, i18n } = useTranslation();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const isEs = i18n.language === "es";

  const filtered = selectedType
    ? guidesData.filter((g) => g.caseTypes.includes(selectedType))
    : guidesData;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("guides.title")}</h1>
        <p className="text-sm text-gray-500 mt-1">{t("guides.subtitle")}</p>
      </div>

      {/* Filter chips */}
      <div className="mb-6">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
          {t("guides.filter_label")}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType(null)}
            className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
              selectedType === null
                ? "bg-indigo-700 text-white border-indigo-700"
                : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
            }`}
          >
            {t("guides.all_types")}
          </button>
          {ALL_CASE_TYPES.map((ct) => (
            <button
              key={ct}
              onClick={() => setSelectedType(ct === selectedType ? null : ct)}
              className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                selectedType === ct
                  ? "bg-indigo-700 text-white border-indigo-700"
                  : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
              }`}
            >
              {t(`caseTypes.${ct}`, ct)}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500">
          {t("guides.empty")}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((guide) => {
            const title = isEs ? guide.title_es : guide.title_en;
            const langKey = guide.language === "both" ? "language_both" : `language_${guide.language}`;
            return (
              <a
                key={guide.id}
                href={guide.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3 hover:border-indigo-300 transition-colors group"
                aria-label={`${title} — ${guide.source}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-base font-medium text-gray-900 group-hover:text-indigo-700 transition-colors leading-snug">
                    {title}
                  </p>
                  <span className="text-gray-300 group-hover:text-indigo-500 transition-colors shrink-0 mt-0.5">
                    ↗
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500">
                    {t("guides.source")}: <span className="font-medium text-gray-700">{guide.source}</span>
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full border ${LANGUAGE_BADGES[guide.language]}`}
                  >
                    {t(`guides.${langKey}`)}
                  </span>
                  {guide.caseTypes.map((ct) => (
                    <span
                      key={ct}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                    >
                      {t(`caseTypes.${ct}`, ct)}
                    </span>
                  ))}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
