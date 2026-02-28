import { useState } from "react";
import type { CalculationResult, AdvancedParams } from "../calculator";

interface ResultsPanelProps {
  result: CalculationResult;
  advanced: AdvancedParams;
}

function fmtCurrency(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtPercent(n: number): string {
  return (n * 100).toFixed(4) + "%";
}

export default function ResultsPanel({ result, advanced }: ResultsPanelProps) {
  const [showEavHelp, setShowEavHelp] = useState(false);
  const [showEqHelp, setShowEqHelp] = useState(false);

  return (
    <div className="results-panel">
      <h2>Your Estimated Bond Cost</h2>

      <div className="hero-numbers">
        <div className="hero-card">
          <span className="hero-amount">${fmtCurrency(result.monthlyCost)}</span>
          <span className="hero-label">per month</span>
        </div>
        <div className="hero-card">
          <span className="hero-amount">${fmtCurrency(result.annualCost)}</span>
          <span className="hero-label">per year</span>
        </div>
      </div>

      <div className="breakdown">
        <h3>How it's calculated</h3>
        <table className="breakdown-table">
          <tbody>
            <tr className="section-label">
              <td colSpan={2}>Village-wide bond levy</td>
            </tr>
            <tr>
              <td>Annual Debt Service</td>
              <td className="num">${fmtCurrency(result.annualDebtService)}</td>
            </tr>
            <tr>
              <td>
                Oak Park Total EAV
                <button className="help-btn" onClick={() => setShowEavHelp(!showEavHelp)} aria-label="What is EAV?">?</button>
                {showEavHelp && (
                  <div className="help-popup">
                    <strong>Equalized Assessed Value (EAV)</strong> is the total taxable value of all property in Oak Park after the state equalization factor is applied. The village's bond debt service is spread across this total EAV to determine each property's share.
                  </div>
                )}
              </td>
              <td className="num">${fmtCurrency(advanced.totalEAV)}</td>
            </tr>
            <tr className="highlight-row">
              <td>Implied Tax Rate (debt service / EAV)</td>
              <td className="num">{fmtPercent(result.impliedTaxRate)}</td>
            </tr>
            <tr className="section-label">
              <td colSpan={2}>Your property</td>
            </tr>
            <tr>
              <td>Assessed Value (10% of market)</td>
              <td className="num">${fmtCurrency(result.assessedValue)}</td>
            </tr>
            <tr>
              <td>
                Equalized Value (&times; {advanced.equalizationMultiplier})
                <button className="help-btn" onClick={() => setShowEqHelp(!showEqHelp)} aria-label="What is the equalization multiplier?">?</button>
                {showEqHelp && (
                  <div className="help-popup">
                    <strong>State Equalization Multiplier</strong> is a factor set annually by the Illinois Department of Revenue to equalize Cook County assessments with the rest of the state. Your assessed value (10% of market value) is multiplied by this factor to get your equalized assessed value.
                  </div>
                )}
              </td>
              <td className="num">${fmtCurrency(result.equalizedValue)}</td>
            </tr>
            <tr>
              <td>Exemptions</td>
              <td className="num">-${fmtCurrency(result.totalExemptions)}</td>
            </tr>
            <tr className="highlight-row">
              <td>Your Adjusted EAV</td>
              <td className="num">${fmtCurrency(result.adjustedEAV)}</td>
            </tr>
            <tr className="section-label">
              <td colSpan={2}>Your cost = EAV &times; tax rate</td>
            </tr>
            <tr>
              <td>${fmtCurrency(result.adjustedEAV)} &times; {fmtPercent(result.impliedTaxRate)}</td>
              <td className="num"><strong>${fmtCurrency(result.annualCost)}/yr</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
