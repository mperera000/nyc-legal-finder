"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import OrgCard from "./OrgCard";
import { getEligibility, type IncomeBracket } from "@/lib/eligibility";
import orgsData from "@/data/orgs.json";

type Org = (typeof orgsData)[number];

const BOROUGHS = ["Manhattan", "Brooklyn", "Bronx", "Queens", "Staten Island"] as const;

const CASE_TYPES = [
  "Housing",
  "Immigration",
  "Benefits",
  "Consumer Debt",
  "Family Law",
  "Employment",
  "Criminal Defense",
  "Civil Rights",
  "Health Law",
  "Domestic Violence",
  "Divorce",
  "Child Custody",
  "Civil / Small Claims",
] as const;

const INCOME_BRACKETS: IncomeBracket[] = [
  "under_15k",
  "15k_25k",
  "25k_40k",
  "40k_55k",
  "over_55k",
];

// Pill button used in all steps
function Pill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        selected
          ? "bg-indigo-700 text-white border-indigo-700"
          : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:text-indigo-700"
      }`}
    >
      {label}
    </button>
  );
}

// Progress bar across the top of each step
function StepProgress({ step }: { step: number }) {
  return (
    <div className="flex gap-1.5 mb-6" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={3}>
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            n <= step ? "bg-indigo-600" : "bg-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function OrgFinder() {
  const { t } = useTranslation();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [borough, setBorough] = useState<string | null>(null);
  const [caseType, setCaseType] = useState<string | null>(null);
  const [income, setIncome] = useState<IncomeBracket | null>(null);

  // Filter orgs based on selections
  function getResults(): Org[] {
    return orgsData.filter((org) => {
      if (borough && !org.boroughs.includes(borough)) return false;
      if (
        caseType &&
        caseType !== "Civil / Small Claims" &&
        !org.caseTypes.includes(caseType)
      )
        return false;
      // Civil / Small Claims: show all orgs (any can advise)
      return true;
    });
  }

  function reset() {
    setStep(1);
    setBorough(null);
    setCaseType(null);
    setIncome(null);
  }

  const results = step === 4 ? getResults() : [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("orgs.title")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("orgs.subtitle")}</p>
        </div>
      </div>

      {/* Steps 1–3 */}
      {step < 4 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <StepProgress step={step} />

          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            {t("steps.step", { n: step })}
          </p>

          {/* Step 1: Borough */}
          {step === 1 && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-5">
                {t("steps.step1_title")}
              </h2>
              <div className="flex flex-wrap gap-2">
                <Pill
                  label={t("steps.any_borough")}
                  selected={borough === null}
                  onClick={() => {
                    setBorough(null);
                    setStep(2);
                  }}
                />
                {BOROUGHS.map((b) => (
                  <Pill
                    key={b}
                    label={t(`boroughs.${b}`, b)}
                    selected={borough === b}
                    onClick={() => {
                      setBorough(b);
                      setStep(2);
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {/* Step 2: Case type */}
          {step === 2 && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-5">
                {t("steps.step2_title")}
              </h2>
              <div className="flex flex-wrap gap-2">
                <Pill
                  label={t("steps.any_case")}
                  selected={caseType === null}
                  onClick={() => {
                    setCaseType(null);
                    setStep(3);
                  }}
                />
                {CASE_TYPES.map((ct) => (
                  <Pill
                    key={ct}
                    label={t(`caseTypes.${ct}`, ct)}
                    selected={caseType === ct}
                    onClick={() => {
                      setCaseType(ct);
                      setStep(3);
                    }}
                  />
                ))}
              </div>
              <button
                onClick={() => setStep(1)}
                className="mt-5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
              >
                ← {t("steps.back")}
              </button>
            </>
          )}

          {/* Step 3: Income */}
          {step === 3 && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-5">
                {t("steps.step3_title")}
              </h2>
              <div className="flex flex-col gap-2">
                {INCOME_BRACKETS.map((bracket) => (
                  <Pill
                    key={bracket}
                    label={t(`income.${bracket}`)}
                    selected={income === bracket}
                    onClick={() => {
                      setIncome(bracket);
                      setStep(4);
                    }}
                  />
                ))}
              </div>
              <button
                onClick={() => setStep(2)}
                className="mt-5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
              >
                ← {t("steps.back")}
              </button>
            </>
          )}
        </div>
      )}

      {/* Results */}
      {step === 4 && income && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              {results.length === 1
                ? t("orgs.results_count", { count: results.length })
                : t("orgs.results_count_plural", { count: results.length })}
            </p>
            <button
              onClick={reset}
              className="text-sm text-indigo-700 hover:text-indigo-900 font-medium underline underline-offset-2"
            >
              {t("orgs.start_over")}
            </button>
          </div>

          {results.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500">
              {t("orgs.no_results")}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {results.map((org) => (
                <OrgCard
                  key={org.id}
                  org={org}
                  eligibility={getEligibility(income, org.incomeLimit_pct_fpl)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
