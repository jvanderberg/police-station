/** Standard Cook County property tax constants */
export const DEFAULTS = {
  bondPrincipal: 100_000_000,
  termYears: 30,
  interestRate: 0.0445,
  assessmentRatio: 0.10,
  equalizationMultiplier: 3.0355,
  oakParkTotalEAV: 2_361_857_488,
  medianHomeValue: 465_500,
  homeownerExemption: 10_000,
  seniorExemption: 8_000,
  disabledPersonExemption: 2_000,
  returningVeteranExemption: 5_000,
} as const;

export interface BondParams {
  principal: number;
  termYears: number;
  interestRate: number;
}

export interface HomeParams {
  marketValue: number;
  homeownerExemption: boolean;
  seniorExemption: boolean;
  disabledPersonExemption: boolean;
  returningVeteranExemption: boolean;
}

export interface CalculationResult {
  assessedValue: number;
  equalizedValue: number;
  totalExemptions: number;
  adjustedEAV: number;
  annualDebtService: number;
  impliedTaxRate: number;
  annualCost: number;
  monthlyCost: number;
}

/**
 * Standard PMT (payment) formula for level-payment amortization.
 * Returns the annual payment amount (positive).
 *
 * PMT = P * r / (1 - (1 + r)^-n)
 */
export function pmt(principal: number, annualRate: number, years: number): number {
  if (annualRate === 0) return principal / years;
  const r = annualRate;
  const n = years;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

/** Sum the dollar value of all checked exemptions */
export function totalExemptions(home: HomeParams): number {
  let total = 0;
  if (home.homeownerExemption) total += DEFAULTS.homeownerExemption;
  if (home.seniorExemption) total += DEFAULTS.seniorExemption;
  if (home.disabledPersonExemption) total += DEFAULTS.disabledPersonExemption;
  if (home.returningVeteranExemption) total += DEFAULTS.returningVeteranExemption;
  return total;
}

/**
 * Full calculation using Cook County property tax mechanics.
 *
 * 1. Annual debt service = PMT(rate, term, principal)
 * 2. Implied tax rate = annual debt service / Oak Park total EAV
 * 3. Adjusted EAV = (market value * 10% * equalization multiplier) - exemptions
 * 4. Annual cost = adjusted EAV * implied tax rate
 */
export function calculate(bond: BondParams, home: HomeParams): CalculationResult {
  const annualDebtService = pmt(bond.principal, bond.interestRate, bond.termYears);
  const impliedTaxRate = annualDebtService / DEFAULTS.oakParkTotalEAV;

  const assessedValue = home.marketValue * DEFAULTS.assessmentRatio;
  const equalizedValue = assessedValue * DEFAULTS.equalizationMultiplier;
  const exemptions = totalExemptions(home);
  const adjustedEAV = Math.max(0, equalizedValue - exemptions);

  const annualCost = adjustedEAV * impliedTaxRate;
  const monthlyCost = annualCost / 12;

  return {
    assessedValue,
    equalizedValue,
    totalExemptions: exemptions,
    adjustedEAV,
    annualDebtService,
    impliedTaxRate,
    annualCost,
    monthlyCost,
  };
}
