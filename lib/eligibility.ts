// 2024 HHS Federal Poverty Level for a single person: $15,060/yr
// These brackets map income ranges to approximate FPL percentages.
// We use the midpoint of each bracket for comparison.

export type IncomeBracket = "under_15k" | "15k_25k" | "25k_40k" | "40k_55k" | "over_55k";

const BRACKET_FPL_PCT: Record<IncomeBracket, number> = {
  under_15k: 90,
  "15k_25k": 133,
  "25k_40k": 220,
  "40k_55k": 320,
  over_55k: 420,
};

export type EligibilityStatus = "likely" | "check" | "unlikely";

export function getEligibility(
  bracket: IncomeBracket,
  orgLimitPct: number
): EligibilityStatus {
  const userPct = BRACKET_FPL_PCT[bracket];
  if (userPct <= orgLimitPct) return "likely";
  if (userPct <= orgLimitPct * 1.2) return "check";
  return "unlikely";
}
