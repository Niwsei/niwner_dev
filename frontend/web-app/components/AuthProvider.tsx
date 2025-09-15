import { PropsWithChildren, useEffect } from 'react';
import { useAuth } from '../store/auth';

export default function AuthProvider({ children }: PropsWithChildren<{}>) {
  const { isExpired, logout, expiresAt } = useAuth();

  useEffect(() => {
    if (isExpired()) logout();
    if (!expiresAt) return;
    const ms = Math.max(0, expiresAt - Date.now());
    const t = setTimeout(() => logout(), ms);
    return () => clearTimeout(t);
  }, [expiresAt]);

  return <>{children}</>;
}

