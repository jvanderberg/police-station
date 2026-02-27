import { calculate, type BondParams, type HomeParams } from "../calculator";

interface ComparisonTableProps {
  bond: BondParams;
  home: HomeParams;
}

const COMPARISON_VALUES = [300_000, 430_000, 465_500, 500_000, 750_000];

function fmtCurrency(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtHome(n: number): string {
  return "$" + n.toLocaleString("en-US");
}

export default function ComparisonTable({ bond, home }: ComparisonTableProps) {
  const rows = COMPARISON_VALUES.map((value) => {
    const result = calculate(bond, { ...home, marketValue: value });
    const isActive = home.marketValue === value;
    return { value, result, isActive };
  });

  return (
    <div className="comparison-section">
      <h3>Cost by Home Value</h3>
      <p className="comparison-note">
        All figures assume the same exemptions you selected above.
      </p>
      <table className="comparison-table">
        <thead>
          <tr>
            <th>Home Value</th>
            <th>Annual Cost</th>
            <th>Monthly Cost</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.value} className={row.isActive ? "active-row" : ""}>
              <td>{fmtHome(row.value)}</td>
              <td className="num">${fmtCurrency(row.result.annualCost)}</td>
              <td className="num">${fmtCurrency(row.result.monthlyCost)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
