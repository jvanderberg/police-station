import { useState } from "react";
import { DEFAULTS, calculate, type BondParams, type HomeParams, type AdvancedParams } from "./calculator";
import InputPanel from "./components/InputPanel";
import BondSettings from "./components/BondSettings";
import ResultsPanel from "./components/ResultsPanel";
import ComparisonTable from "./components/ComparisonTable";

export default function App() {
  const [home, setHome] = useState<HomeParams>({
    marketValue: DEFAULTS.medianHomeValue,
    homeownerExemption: true,
    seniorExemption: false,
    disabledPersonExemption: false,
    returningVeteranExemption: false,
  });

  const [bond, setBond] = useState<BondParams>({
    principal: DEFAULTS.bondPrincipal,
    termYears: DEFAULTS.termYears,
    interestRate: DEFAULTS.interestRate,
  });

  const [advanced, setAdvanced] = useState<AdvancedParams>({
    totalEAV: DEFAULTS.oakParkTotalEAV,
    equalizationMultiplier: DEFAULTS.equalizationMultiplier,
  });

  const result = calculate(bond, home, advanced);

  function handleReset() {
    setHome({
      marketValue: DEFAULTS.medianHomeValue,
      homeownerExemption: true,
      seniorExemption: false,
      disabledPersonExemption: false,
      returningVeteranExemption: false,
    });
    setBond({
      principal: DEFAULTS.bondPrincipal,
      termYears: DEFAULTS.termYears,
      interestRate: DEFAULTS.interestRate,
    });
    setAdvanced({
      totalEAV: DEFAULTS.oakParkTotalEAV,
      equalizationMultiplier: DEFAULTS.equalizationMultiplier,
    });
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-row">
          <h1>Oak Park Police Station Bond Cost Calculator</h1>
          <button className="reset-button" onClick={handleReset}>Reset</button>
        </div>
        <p className="subtitle">
          Estimate your household tax impact using Cook County property tax mechanics
        </p>
      </header>
      <BondSettings bond={bond} onBondChange={setBond} advanced={advanced} onAdvancedChange={setAdvanced} annualDebtService={result.annualDebtService} />
      <main className="app-layout">
        <InputPanel home={home} onHomeChange={setHome} />
        <ResultsPanel result={result} advanced={advanced} />
        <ComparisonTable bond={bond} home={home} advanced={advanced} />
      </main>
      <footer className="app-footer">
        <p>
          Based on analysis applying Park District of Oak Park bond tax calculator logic
          to a hypothetical $100M police station bond. This is an estimate for informational
          purposes only. Actual costs depend on final bond terms, market conditions, and
          individual property tax circumstances.
        </p>
      </footer>
    </div>
  );
}
