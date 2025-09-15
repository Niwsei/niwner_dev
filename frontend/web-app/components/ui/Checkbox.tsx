import { InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export default function Checkbox({ label, ...rest }: Props) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <input type="checkbox" {...rest} />
      {label && <span>{label}</span>}
    </label>
  );
}

