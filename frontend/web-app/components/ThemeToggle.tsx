import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (typeof window !== 'undefined' && (localStorage.getItem('theme') as any)) || 'dark');
  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.setAttribute('data-theme', theme);
    if (typeof localStorage !== 'undefined') localStorage.setItem('theme', theme);
  }, [theme]);
  return (
    <button className="btn btn-ghost" onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}>
      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}

