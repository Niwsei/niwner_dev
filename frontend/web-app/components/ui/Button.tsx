import { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type Variant = 'primary' | 'ghost' | 'danger' | 'outline' | 'link';
type Size = 'sm' | 'md' | 'lg';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export default function Button({ variant = 'primary', size = 'md', children, ...rest }: PropsWithChildren<Props>) {
  const cls = ['btn'];
  if (variant === 'primary') cls.push('btn-primary');
  if (variant === 'ghost') cls.push('btn-ghost');
  if (variant === 'danger') cls.push('btn-danger');
  if (variant === 'outline') cls.push('btn-outline');
  if (variant === 'link') cls.push('btn-link');
  if (size === 'sm') cls.push('btn-sm');
  if (size === 'lg') cls.push('btn-lg');
  return (
    <button className={cls.join(' ')} {...rest}>
      {children}
    </button>
  );
}
