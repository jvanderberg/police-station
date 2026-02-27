import { useState, useEffect } from "react";
import type { BondParams } from "../calculator";

interface BondSettingsProps {
  bond: BondParams;
  onBondChange: (bond: BondParams) => void;
  annualDebtService: number;
}

function formatDollars(value: number): string {
  return value.toLocaleString("en-US");
}

function formatMillions(value: number): string {
  return (value / 1_000_000).toFixed(2);
}

export default function BondSettings({ bond, onBondChange, annualDebtService }: BondSettingsProps) {
  const totalRepaid = annualDebtService * bond.termYears;
  const totalInterest = totalRepaid - bond.principal;
  const [bondText, setBondText] = useState(formatDollars(bond.principal));

  // Sync text when bond changes externally (e.g. reset)
  useEffect(() => {
    setBondText(formatDollars(bond.principal));
  }, [bond.principal]);

  function handleBondSlider(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value);
    onBondChange({ ...bond, principal: val });
    setBondText(formatDollars(val));
  }

  function handleBondText(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setBondText(raw);
    const parsed = Number(raw.replace(/[^0-9]/g, ""));
    if (!isNaN(parsed) && parsed >= 0) {
      onBondChange({ ...bond, principal: parsed });
    }
  }

  function handleBondTextBlur() {
    setBondText(formatDollars(bond.principal));
  }

  return (
    <div className="bond-settings">
      <div className="bond-top-row">
        <label className="bond-field">
          Bond Amount
          <div className="value-row">
            <span className="dollar-sign">$</span>
            <input
              type="text"
              inputMode="numeric"
              className="value-input"
              value={bondText}
              onChange={handleBondText}
              onBlur={handleBondTextBlur}
            />
          </div>
          <input
            type="range"
            min={10_000_000}
            max={150_000_000}
            step={5_000_000}
            value={bond.principal}
            onChange={handleBondSlider}
            className="slider"
          />
          <div className="slider-labels">
            <span>$10M</span>
            <span>$150M</span>
          </div>
        </label>
        <div className="bond-rate-term">
          <label className="bond-input-label">
            Interest Rate
            <input
              type="text"
              inputMode="decimal"
              className="bond-input"
              value={`${(bond.interestRate * 100).toFixed(2)}%`}
              onChange={(e) => {
                const parsed = parseFloat(e.target.value.replace(/[^0-9.]/g, ""));
                if (!isNaN(parsed)) onBondChange({ ...bond, interestRate: parsed / 100 });
              }}
            />
          </label>
          <label className="bond-input-label">
            Term (years)
            <input
              type="number"
              className="bond-input"
              value={bond.termYears}
              min={1}
              max={50}
              onChange={(e) => {
                const parsed = Number(e.target.value);
                if (!isNaN(parsed) && parsed > 0) onBondChange({ ...bond, termYears: parsed });
              }}
            />
          </label>
        </div>
      </div>
      <div className="bond-derived">
        <div className="bond-derived-item">
          <span className="bond-derived-value">${formatMillions(annualDebtService)}M</span>
          <span className="bond-derived-label">debt service / year</span>
        </div>
        <div className="bond-derived-item">
          <span className="bond-derived-value">${formatMillions(totalRepaid)}M</span>
          <span className="bond-derived-label">total repaid</span>
        </div>
        <div className="bond-derived-item">
          <span className="bond-derived-value">${formatMillions(totalInterest)}M</span>
          <span className="bond-derived-label">total interest</span>
        </div>
      </div>
    </div>
  );
}
