import { useState, useEffect } from "react";
import { DEFAULTS, type BondParams, type AdvancedParams } from "../calculator";

interface BondSettingsProps {
  bond: BondParams;
  onBondChange: (bond: BondParams) => void;
  advanced: AdvancedParams;
  onAdvancedChange: (advanced: AdvancedParams) => void;
  annualDebtService: number;
}

function formatDollars(value: number): string {
  return value.toLocaleString("en-US");
}

function formatMillions(value: number): string {
  return (value / 1_000_000).toFixed(2);
}

export default function BondSettings({ bond, onBondChange, advanced, onAdvancedChange, annualDebtService }: BondSettingsProps) {
  const totalRepaid = annualDebtService * bond.termYears;
  const totalInterest = totalRepaid - bond.principal;
  const [bondText, setBondText] = useState(formatDollars(bond.principal));
  const [eavText, setEavText] = useState(formatDollars(advanced.totalEAV));
  const [eqText, setEqText] = useState(String(advanced.equalizationMultiplier));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setBondText(formatDollars(bond.principal));
  }, [bond.principal]);

  useEffect(() => {
    setEavText(formatDollars(advanced.totalEAV));
  }, [advanced.totalEAV]);

  useEffect(() => {
    setEqText(String(advanced.equalizationMultiplier));
  }, [advanced.equalizationMultiplier]);

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
      <div className="hero-numbers bond-derived">
        <div className="hero-card">
          <span className="hero-amount">${formatMillions(annualDebtService)}M</span>
          <span className="hero-label">debt service / year</span>
        </div>
        <div className="hero-card">
          <span className="hero-amount">${formatMillions(totalRepaid)}M</span>
          <span className="hero-label">total repaid</span>
        </div>
        <div className="hero-card">
          <span className="hero-amount">${formatMillions(totalInterest)}M</span>
          <span className="hero-label">total interest</span>
        </div>
      </div>
      <div className="advanced-toggle-row">
        <button
          className="advanced-toggle"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? "Hide" : "Show"} Advanced Settings
        </button>
      </div>
      {showAdvanced && (
        <div className="advanced-section">
          <label className="bond-input-label">
            Oak Park Total EAV
            <input
              type="text"
              inputMode="numeric"
              className="bond-input"
              value={eavText}
              onChange={(e) => {
                setEavText(e.target.value);
                const parsed = Number(e.target.value.replace(/[^0-9]/g, ""));
                if (!isNaN(parsed) && parsed > 0) onAdvancedChange({ ...advanced, totalEAV: parsed });
              }}
              onBlur={() => setEavText(formatDollars(advanced.totalEAV))}
            />
          </label>
          <label className="bond-input-label">
            State Equalization Multiplier
            <input
              type="text"
              inputMode="decimal"
              className="bond-input"
              value={eqText}
              onChange={(e) => {
                setEqText(e.target.value);
                const parsed = parseFloat(e.target.value);
                if (!isNaN(parsed) && parsed > 0) onAdvancedChange({ ...advanced, equalizationMultiplier: parsed });
              }}
              onBlur={() => setEqText(String(advanced.equalizationMultiplier))}
            />
          </label>
          <p className="defaults-note">
            Defaults: EAV ${formatDollars(DEFAULTS.oakParkTotalEAV)}, Multiplier {DEFAULTS.equalizationMultiplier}
          </p>
        </div>
      )}
    </div>
  );
}
