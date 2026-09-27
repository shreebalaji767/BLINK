"use client";

import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function BlinkInput({ label, error, id, className = "", ...props }: Props) {
  const inputId = id ?? label.toLowerCase().replace(/\\s+/g, "-");

  return (
    <div className="blink-field">
      <label htmlFor={inputId} className="blink-label">{label}</label>
      <input
        id={inputId}
        className={`blink-input ${className}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && <p id={`${inputId}-error`} className="blink-field-error">{error}</p>}
    </div>
  );
}