import { HTMLAttributes, PropsWithChildren, ReactNode } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'elevated' | 'glass';
};

export default function Card({ children, variant = 'default', ...rest }: PropsWithChildren<CardProps>) {
  const cls = ['card'];
  if (variant !== 'default') cls.push(variant);
  return (
    <div className={cls.join(' ')} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ title, extra }: { title: ReactNode; extra?: ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
      <h3 style={{ margin: 0 }}>{title}</h3>
      {extra}
    </div>
  );
}

export function CardMeta({ children }: PropsWithChildren<{}>) {
  return <div className="muted" style={{ fontSize: 12 }}>{children}</div>;
}
