import type { CalculationResult } from "../calculator";

interface ResultsPanelProps {
  result: CalculationResult;
}

function fmtCurrency(n: number, decimals = 2): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtPercent(n: number): string {
  return (n * 100).toFixed(4) + "%";
}

export default function ResultsPanel({ result }: ResultsPanelProps) {
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
            <tr>
              <td>Assessed Value (10% of market)</td>
              <td className="num">${fmtCurrency(result.assessedValue, 0)}</td>
            </tr>
            <tr>
              <td>Equalized Value (&times; 3.0355)</td>
              <td className="num">${fmtCurrency(result.equalizedValue)}</td>
            </tr>
            <tr>
              <td>Total Exemptions</td>
              <td className="num">-${fmtCurrency(result.totalExemptions, 0)}</td>
            </tr>
            <tr className="highlight-row">
              <td>Adjusted EAV</td>
              <td className="num">${fmtCurrency(result.adjustedEAV)}</td>
            </tr>
            <tr>
              <td>Annual Debt Service (village-wide)</td>
              <td className="num">${fmtCurrency(result.annualDebtService, 0)}</td>
            </tr>
            <tr>
              <td>Implied Tax Rate</td>
              <td className="num">{fmtPercent(result.impliedTaxRate)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
