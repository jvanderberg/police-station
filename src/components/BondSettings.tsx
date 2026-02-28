import { useState, useEffect, useRef } from "react";
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
  const [avText, setAvText] = useState(formatDollars(advanced.totalAV));
  const [eqText, setEqText] = useState(String(advanced.equalizationMultiplier));
  const derivedEAV = advanced.totalAV * advanced.equalizationMultiplier;
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showEavHelp, setShowEavHelp] = useState(false);
  const [showEqHelp, setShowEqHelp] = useState(false);
  const eavRef = useRef<HTMLDivElement>(null);
  const eqRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showEavHelp && !showEqHelp) return;
    function onMouseDown(e: MouseEvent) {
      if (showEavHelp && eavRef.current && !eavRef.current.contains(e.target as Node)) setShowEavHelp(false);
      if (showEqHelp && eqRef.current && !eqRef.current.contains(e.target as Node)) setShowEqHelp(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [showEavHelp, showEqHelp]);

  useEffect(() => {
    setBondText(formatDollars(bond.principal));
  }, [bond.principal]);

  useEffect(() => {
    setAvText(formatDollars(advanced.totalAV));
  }, [advanced.totalAV]);

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
            <div className="bond-input-label" ref={eavRef}>
              <span className="label-with-help">
                Oak Park Total Assessed Value
                <button
                  className="help-btn"
                  onClick={() => setShowEavHelp(!showEavHelp)}
                  aria-label="What is total assessed value?"
                >?</button>
              </span>
              {showEavHelp && (
                <div className="help-popup-wrapper">
                  <div className="help-popup">
                    The total assessed value of all property in Oak Park before the state equalization factor is applied. This is multiplied by the equalization factor to get the total EAV, which determines how the bond levy is spread across properties.
                  </div>
                </div>
              )}
              <input
                type="text"
                inputMode="numeric"
                className="bond-input"
                value={avText}
                onChange={(e) => {
                  setAvText(e.target.value);
                  const parsed = Number(e.target.value.replace(/[^0-9]/g, ""));
                  if (!isNaN(parsed) && parsed > 0) onAdvancedChange({ ...advanced, totalAV: parsed });
                }}
                onBlur={() => setAvText(formatDollars(advanced.totalAV))}
              />
            </div>
            <div className="bond-input-label" ref={eqRef}>
              <span className="label-with-help">
                State Equalization Multiplier
                <button
                  className="help-btn"
                  onClick={() => setShowEqHelp(!showEqHelp)}
                  aria-label="What is the equalization multiplier?"
                >?</button>
              </span>
              {showEqHelp && (
                <div className="help-popup-wrapper">
                  <div className="help-popup">
                    A factor set annually by the Illinois Department of Revenue to equalize Cook County assessments with the rest of the state. Both your individual assessed value and the village total are multiplied by this factor.
                  </div>
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
          <p className="advanced-derived">
            Total EAV = ${formatDollars(Math.round(derivedEAV))}
          </p>
          <p className="defaults-note">
            Defaults are from Tax Year 2024: EAV ${formatDollars(DEFAULTS.oakParkTotalEAV)} (Cook County Clerk),
            Equalization Factor {DEFAULTS.equalizationMultiplier} (IL Dept. of Revenue)
          </p>
        </div>
      )}
    </div>
  );
}
