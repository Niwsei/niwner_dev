import { SelectHTMLAttributes } from 'react';

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  id?: string;
};

export default function Select({ label, error, id, children, ...rest }: Props) {
  const selectId = id || rest.name || Math.random().toString(36).slice(2);
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      {label && (
        <label htmlFor={selectId} style={{ fontWeight: 600 }}>
          {label}
        </label>
      )}
      <select id={selectId} {...rest} className="input">
        {children}
      </select>
      {error && <div style={{ color: 'salmon', fontSize: 12 }}>{error}</div>}
    </div>
  );
}
