import { InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  id?: string;
};

export default function Input({ label, hint, error, id, ...rest }: Props) {
  const inputId = id || rest.name || Math.random().toString(36).slice(2);
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      {label && (
        <label htmlFor={inputId} style={{ fontWeight: 600 }}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        {...rest}
        className={`input${error ? ' invalid' : ''}`}
        aria-invalid={!!error}
        aria-describedby={describedBy}
      />
      {hint && !error && (
        <div id={`${inputId}-hint`} className="muted" style={{ fontSize: 12 }}>
          {hint}
        </div>
      )}
      {error && (
        <div id={`${inputId}-error`} style={{ color: 'salmon', fontSize: 12 }}>
          {error}
        </div>
      )}
    </div>
  );
}
