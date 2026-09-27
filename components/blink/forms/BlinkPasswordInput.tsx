"use client";

import { useState, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function BlinkPasswordInput({ label, error, id = "password", ...props }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="blink-field">
      <label htmlFor={id} className="blink-label">{label}</label>
      <div className="blink-password-wrap">
        <input
          {...props}
          id={id}
          type={visible ? "text" : "password"}
          className="blink-input blink-password-input"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <button
          type="button"
          className="blink-password-toggle"
          onClick={() => setVisible(v => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {error && <p id={`${id}-error`} className="blink-field-error">{error}</p>}
    </div>
  );
}