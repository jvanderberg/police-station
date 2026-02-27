import { useState, useEffect } from "react";
import type { HomeParams } from "../calculator";

interface InputPanelProps {
  home: HomeParams;
  onHomeChange: (home: HomeParams) => void;
}

function formatDollars(value: number): string {
  return value.toLocaleString("en-US");
}

export default function InputPanel({ home, onHomeChange }: InputPanelProps) {
  const [textValue, setTextValue] = useState(formatDollars(home.marketValue));

  // Sync text when home value changes externally (e.g. reset)
  useEffect(() => {
    setTextValue(formatDollars(home.marketValue));
  }, [home.marketValue]);

  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value);
    onHomeChange({ ...home, marketValue: val });
    setTextValue(formatDollars(val));
  }

  function handleTextInput(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setTextValue(raw);
    const parsed = Number(raw.replace(/[^0-9]/g, ""));
    if (!isNaN(parsed) && parsed >= 0) {
      onHomeChange({ ...home, marketValue: parsed });
    }
  }

  function handleTextBlur() {
    setTextValue(formatDollars(home.marketValue));
  }

  function toggleExemption(field: keyof HomeParams) {
    onHomeChange({ ...home, [field]: !home[field] });
  }

  return (
    <div className="input-panel">
      <h2>Your Home</h2>

      <label className="input-label">
        Home Market Value
        <div className="value-row">
          <span className="dollar-sign">$</span>
          <input
            type="text"
            inputMode="numeric"
            className="value-input"
            value={textValue}
            onChange={handleTextInput}
            onBlur={handleTextBlur}
          />
        </div>
        <input
          type="range"
          min={100_000}
          max={1_500_000}
          step={500}
          value={home.marketValue}
          onChange={handleSlider}
          className="slider"
        />
        <div className="slider-labels">
          <span>$100k</span>
          <span>$1.5M</span>
        </div>
      </label>

      <fieldset className="exemptions">
        <legend>Exemptions</legend>
        <label>
          <input
            type="checkbox"
            checked={home.homeownerExemption}
            onChange={() => toggleExemption("homeownerExemption")}
          />
          Homeowner ($10,000)
        </label>
        <label>
          <input
            type="checkbox"
            checked={home.seniorExemption}
            onChange={() => toggleExemption("seniorExemption")}
          />
          Senior ($8,000)
        </label>
        <label>
          <input
            type="checkbox"
            checked={home.disabledPersonExemption}
            onChange={() => toggleExemption("disabledPersonExemption")}
          />
          Disabled Person ($2,000)
        </label>
        <label>
          <input
            type="checkbox"
            checked={home.returningVeteranExemption}
            onChange={() => toggleExemption("returningVeteranExemption")}
          />
          Returning Veteran ($5,000)
        </label>
      </fieldset>
    </div>
  );
}
