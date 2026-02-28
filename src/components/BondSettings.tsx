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
  const [showEavHelp, setShowEavHelp] = useState(false);
  const [showEqHelp, setShowEqHelp] = useState(false);

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
          <div className="advanced-inputs">
            <div className="bond-input-label">
              <span className="label-with-help">
                Oak Park Total EAV
                <button
                  className="help-btn"
                  onClick={() => setShowEavHelp(!showEavHelp)}
                  aria-label="What is EAV?"
                >?</button>
              </span>
              {showEavHelp && (
                <div className="help-popup">
                  <strong>Equalized Assessed Value (EAV)</strong> is the total taxable value of all property in Oak Park after the state equalization factor is applied. The village's bond debt service is spread across this total EAV to determine each property's share.
                </div>
              )}
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
            </div>
            <div className="bond-input-label">
              <span className="label-with-help">
                State Equalization Multiplier
                <button
                  className="help-btn"
                  onClick={() => setShowEqHelp(!showEqHelp)}
                  aria-label="What is the equalization multiplier?"
                >?</button>
              </span>
              {showEqHelp && (
                <div className="help-popup">
                  <strong>State Equalization Multiplier</strong> is a factor set annually by the Illinois Department of Revenue to equalize Cook County assessments with the rest of the state. Your assessed value (10% of market value) is multiplied by this factor to get your equalized assessed value.
                </div>
              )}
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
            </div>
          </div>
          <p className="defaults-note">
            Defaults are from Tax Year 2024: EAV ${formatDollars(DEFAULTS.oakParkTotalEAV)} (Cook County Clerk),
            Equalization Factor {DEFAULTS.equalizationMultiplier} (IL Dept. of Revenue)
          </p>
        </div>
      )}
    </div>
  );
}
