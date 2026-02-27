import { describe, it, expect } from "vitest";
import { pmt, totalExemptions, calculate, DEFAULTS, type BondParams, type HomeParams } from "./calculator";

const DEFAULT_BOND: BondParams = {
  principal: DEFAULTS.bondPrincipal,
  termYears: DEFAULTS.termYears,
  interestRate: DEFAULTS.interestRate,
};

function homeWith(
  marketValue: number,
  overrides: Partial<HomeParams> = {},
): HomeParams {
  return {
    marketValue,
    homeownerExemption: true,
    seniorExemption: false,
    disabledPersonExemption: false,
    returningVeteranExemption: false,
    ...overrides,
  };
}

// ── PMT ──────────────────────────────────────────────────────────────

describe("pmt", () => {
  it("computes ~$6.10M annual debt service for $100M at 4.45% over 30yr", () => {
    const annual = pmt(100_000_000, 0.0445, 30);
    // PDF says "approximately $6.10 million"
    expect(annual).toBeGreaterThan(6_050_000);
    expect(annual).toBeLessThan(6_150_000);
  });

  it("handles zero interest rate (simple division)", () => {
    expect(pmt(300_000, 0, 30)).toBeCloseTo(10_000, 2);
  });

  it("matches Park District scenario: $40M at ~mid-4% over 20yr ≈ $3.14M/yr", () => {
    // The PDF back-solves: $2,361,857,488 × 0.001330 ≈ $3.14M
    // That implies PMT($40M, r, 20) ≈ $3.14M. At r≈4.35% it lands there.
    const annual = pmt(40_000_000, 0.0435, 20);
    expect(annual).toBeGreaterThan(3_000_000);
    expect(annual).toBeLessThan(3_250_000);
  });
});

// ── totalExemptions ──────────────────────────────────────────────────

describe("totalExemptions", () => {
  it("returns $10,000 for homeowner only", () => {
    expect(totalExemptions(homeWith(0))).toBe(10_000);
  });

  it("returns 0 when nothing is checked", () => {
    expect(
      totalExemptions(homeWith(0, { homeownerExemption: false })),
    ).toBe(0);
  });

  it("stacks all four exemptions to $25,000", () => {
    const all = totalExemptions(
      homeWith(0, {
        homeownerExemption: true,
        seniorExemption: true,
        disabledPersonExemption: true,
        returningVeteranExemption: true,
      }),
    );
    expect(all).toBe(10_000 + 8_000 + 2_000 + 5_000);
  });
});

// ── Intermediate values ──────────────────────────────────────────────

describe("calculate intermediate values", () => {
  it("assessed value is 10% of market value", () => {
    const r = calculate(DEFAULT_BOND, homeWith(430_000));
    expect(r.assessedValue).toBeCloseTo(43_000, 2);
  });

  it("equalized value applies 3.0355 multiplier", () => {
    const r = calculate(DEFAULT_BOND, homeWith(430_000));
    expect(r.equalizedValue).toBeCloseTo(130_526.5, 2);
  });

  it("adjusted EAV subtracts homeowner exemption", () => {
    const r = calculate(DEFAULT_BOND, homeWith(430_000));
    expect(r.adjustedEAV).toBeCloseTo(120_526.5, 2);
  });

  it("implied tax rate is ~0.2584%", () => {
    const r = calculate(DEFAULT_BOND, homeWith(300_000));
    expect(r.impliedTaxRate * 100).toBeCloseTo(0.2584, 3);
  });

  it("adjusted EAV floors at zero for very low values with many exemptions", () => {
    const r = calculate(DEFAULT_BOND, homeWith(10_000, {
      homeownerExemption: true,
      seniorExemption: true,
    }));
    expect(r.adjustedEAV).toBe(0);
    expect(r.annualCost).toBe(0);
  });
});

// ── Full end-to-end: PDF example homes ───────────────────────────────

describe("PDF example calculations (homeowner exemption only)", () => {
  const cases: [number, number, number][] = [
    //  [marketValue, expectedAnnual, expectedMonthly]
    [300_000, 209.47, 17.46],
    [430_000, 311.44, 25.95],
    [465_500, 339.29, 28.27],
    [500_000, 366.35, 30.53],
    [750_000, 562.44, 46.87],
  ];

  for (const [value, annual, monthly] of cases) {
    it(`$${value.toLocaleString()} home → $${annual}/yr, $${monthly}/mo`, () => {
      const r = calculate(DEFAULT_BOND, homeWith(value));
      expect(r.annualCost).toBeCloseTo(annual, 1);
      expect(r.monthlyCost).toBeCloseTo(monthly, 1);
    });
  }
});

// ── Exemption value tests from PDF ───────────────────────────────────

describe("exemption value impacts", () => {
  // PDF states each exemption reduces annual tax by approximately:
  //   Homeowner ($10,000): ~$25.84/yr
  //   Senior ($8,000): ~$20.67/yr
  //   Disabled ($2,000): ~$5.17/yr
  //   Veteran ($5,000): ~$12.92/yr

  it("homeowner exemption saves ~$25.84/yr", () => {
    const without = calculate(DEFAULT_BOND, homeWith(430_000, { homeownerExemption: false }));
    const withEx = calculate(DEFAULT_BOND, homeWith(430_000, { homeownerExemption: true }));
    const savings = without.annualCost - withEx.annualCost;
    expect(savings).toBeCloseTo(25.84, 1);
  });

  it("senior exemption saves ~$20.67/yr", () => {
    const base = calculate(DEFAULT_BOND, homeWith(430_000, { seniorExemption: false }));
    const with_ = calculate(DEFAULT_BOND, homeWith(430_000, { seniorExemption: true }));
    const savings = base.annualCost - with_.annualCost;
    expect(savings).toBeCloseTo(20.67, 1);
  });

  it("disabled person exemption saves ~$5.17/yr", () => {
    const base = calculate(DEFAULT_BOND, homeWith(430_000, { disabledPersonExemption: false }));
    const with_ = calculate(DEFAULT_BOND, homeWith(430_000, { disabledPersonExemption: true }));
    const savings = base.annualCost - with_.annualCost;
    expect(savings).toBeCloseTo(5.17, 1);
  });

  it("returning veteran exemption saves ~$12.92/yr", () => {
    const base = calculate(DEFAULT_BOND, homeWith(430_000, { returningVeteranExemption: false }));
    const with_ = calculate(DEFAULT_BOND, homeWith(430_000, { returningVeteranExemption: true }));
    const savings = base.annualCost - with_.annualCost;
    expect(savings).toBeCloseTo(12.92, 1);
  });
});

// ── Bond parameter sensitivity ───────────────────────────────────────

describe("bond parameter changes", () => {
  it("higher principal increases cost proportionally", () => {
    const r1 = calculate(DEFAULT_BOND, homeWith(465_500));
    const r2 = calculate({ ...DEFAULT_BOND, principal: 200_000_000 }, homeWith(465_500));
    expect(r2.annualCost / r1.annualCost).toBeCloseTo(2.0, 5);
  });

  it("zero principal means zero cost", () => {
    const r = calculate({ ...DEFAULT_BOND, principal: 0 }, homeWith(465_500));
    expect(r.annualCost).toBe(0);
  });

  it("higher interest rate increases annual cost", () => {
    const low = calculate({ ...DEFAULT_BOND, interestRate: 0.04 }, homeWith(465_500));
    const high = calculate({ ...DEFAULT_BOND, interestRate: 0.05 }, homeWith(465_500));
    expect(high.annualCost).toBeGreaterThan(low.annualCost);
  });

  it("longer term reduces annual cost but increases total repaid", () => {
    const short = calculate({ ...DEFAULT_BOND, termYears: 20 }, homeWith(465_500));
    const long = calculate({ ...DEFAULT_BOND, termYears: 30 }, homeWith(465_500));
    expect(long.annualCost).toBeLessThan(short.annualCost);
    expect(long.annualDebtService * 30).toBeGreaterThan(short.annualDebtService * 20);
  });

  it("monthly cost is annual / 12", () => {
    const r = calculate(DEFAULT_BOND, homeWith(465_500));
    expect(r.monthlyCost).toBeCloseTo(r.annualCost / 12, 10);
  });
});
