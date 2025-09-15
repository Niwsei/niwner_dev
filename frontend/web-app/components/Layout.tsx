import Link from 'next/link';
import { useRouter } from 'next/router';
import { PropsWithChildren, useMemo, useState } from 'react';
import ThemeToggle from './ThemeToggle';
import { useCart } from '../store/cart';
import AccentPicker from './ui/AccentPicker';
import CommandPalette from './ui/CommandPalette';
import Select from './ui/Select';
import Button from './ui/Button';
import { useAuth } from '../store/auth';

type NavLink = { href: string; label: string };
type NavGroup = { label: string; items: NavLink[] };

const groups: NavGroup[] = [
  { label: 'Courses', items: [
    { href: '/courses', label: 'Overview' },
    { href: '/courses/search', label: 'Search' },
    { href: '/courses/categories', label: 'Categories' },
    { href: '/courses/compare', label: 'Compare' },
  ]},
  { label: 'LMS', items: [
    { href: '/lms/player', label: 'Player' },
    { href: '/lms/builder', label: 'Builder' },
    { href: '/lms/quiz', label: 'Quiz' },
    { href: '/lms/notes', label: 'Notes' },
    { href: '/lms/dashboard', label: 'Dashboard' },
    { href: '/lms/certificate', label: 'Certificate' },
  ]},
  { label: 'Logic', items: [
    { href: '/logic/analyzer', label: 'Analyzer' },
    { href: '/logic/builder', label: 'Builder' },
    { href: '/logic/games', label: 'Games' },
    { href: '/logic/assessment', label: 'Assessment' },
    { href: '/logic/diagram', label: 'Diagram' },
    { href: '/logic/solver', label: 'Solver' },
  ]},
  { label: 'Flow', items: [
    { href: '/flow/builder', label: 'Builder' },
    { href: '/flow/analytics', label: 'Analytics' },
    { href: '/flow/simulation', label: 'Simulation' },
    { href: '/flow/mapping', label: 'Mapping' },
    { href: '/flow/templates', label: 'Templates' },
    { href: '/flow/version-control', label: 'Version Control' },
    { href: '/flow/collaboration', label: 'Collaboration' },
  ]},
  { label: 'Gamification', items: [
    { href: '/gamification/points', label: 'Points' },
    { href: '/gamification/badges', label: 'Badges' },
    { href: '/gamification/achievements', label: 'Achievements' },
    { href: '/gamification/leaderboards', label: 'Leaderboards' },
    { href: '/gamification/streaks', label: 'Streaks' },
    { href: '/gamification/challenges', label: 'Challenges' },
    { href: '/gamification/share', label: 'Share' },
  ]},
  { label: 'Community', items: [
    { href: '/community/chat', label: 'Live Chat' },
    { href: '/community/video-calls', label: 'Video Calls' },
    { href: '/community/peer-review', label: 'Peer Review' },
    { href: '/community/mentorship', label: 'Mentorship' },
    { href: '/community/knowledge', label: 'Knowledge' },
    { href: '/community/forums', label: 'Forums' },
    { href: '/community/groups', label: 'Groups' },
  ]},
  { label: 'Dashboard', items: [
    { href: '/dashboard/profile', label: 'Profile' },
    { href: '/dashboard/payments', label: 'Payments' },
    { href: '/dashboard/purchases', label: 'Purchases' },
    { href: '/dashboard/progress', label: 'Progress' },
    { href: '/dashboard/certificates', label: 'Certificates' },
    { href: '/dashboard/notifications', label: 'Notifications' },
    { href: '/dashboard/subscription', label: 'Subscription' },
    { href: '/dashboard/settings', label: 'Settings' },
  ]},
  { label: 'Analytics', items: [
    { href: '/analytics/usage', label: 'Usage' },
    { href: '/analytics/performance', label: 'Performance' },
    { href: '/analytics/reports', label: 'Reports' },
    { href: '/analytics/goals', label: 'Goals' },
    { href: '/analytics/learning', label: 'Learning' },
  ]},
  { label: 'About', items: [
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]},
  { label: 'Shop', items: [
    { href: '/shop/cart', label: 'Cart' },
    { href: '/shop/checkout', label: 'Checkout' },
    { href: '/shop/orders', label: 'Orders' },
    { href: '/shop/payments', label: 'Payments' },
    { href: '/shop/invoices', label: 'Invoices' },
    { href: '/shop/refunds', label: 'Refunds' },
    { href: '/shop/subscriptions', label: 'Subscriptions' },
  ]},
];

const topLevel: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/courses', label: 'Courses' },
  { href: '/lms/player', label: 'LMS' },
  { href: '/logic/analyzer', label: 'Logic' },
  { href: '/flow/builder', label: 'Flow' },
  { href: '/gamification/points', label: 'Gamification' },
  { href: '/community/chat', label: 'Community' },
  { href: '/dashboard/profile', label: 'Dashboard' },
];

export default function Layout({ children }: PropsWithChildren<{}>) {
  const router = useRouter();
  const { pathname } = router;
  const { user, logout } = useAuth();
  const { items } = useCart();
  const [open, setOpen] = useState(false);
  const [palette, setPalette] = useState(false);
  const isActive = (href: string) => (href !== '/' && pathname.startsWith(href)) || (href === '/' && pathname === '/');
  const navLinks = useMemo(() => topLevel.map(l => ({ ...l, active: isActive(l.href) })), [pathname]);
  const groupOptions = groups;
  const currentValue = useMemo(() => {
    for (const g of groupOptions) {
      for (const it of g.items) {
        if (pathname === it.href || pathname.startsWith(it.href)) return it.href;
      }
    }
    return '';
  }, [pathname]);
  return (
    <div>
      <nav className="nav">
        <div className="nav-inner container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-ghost" aria-label="Menu" onClick={() => setOpen(o => !o)}>☰</button>
            <Link href="/" className="text-gradient" style={{ fontWeight: 800, letterSpacing: '.02em' }}>SkillFlow</Link>
            <div className="hide-sm" style={{ display: 'flex', alignItems: 'center' }}>
              {navLinks.map((l) => (
                <Link key={l.href} href={l.href} className={l.active ? 'active' : ''}>{l.label}</Link>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="btn btn-ghost" onClick={() => setPalette(true)} aria-label="Search">⌘K</button>
            <Link href="/shop/cart" className={isActive('/shop/cart') ? 'active' : ''}>Cart ({items.length})</Link>
            <ThemeToggle />
            <AccentPicker />
            {user ? (
              <Button variant="ghost" onClick={() => { logout(); }}>Logout</Button>
            ) : (
              <Link href="/auth/login" className={isActive('/auth/login') ? 'active' : ''}>Login</Link>
            )}
            <div className="show-sm" style={{ minWidth: 160 }}>
              <Select aria-label="Navigate" value={currentValue} onChange={(e) => { const v = e.target.value; if (v) router.push(v); }}>
                <option value="">Navigate…</option>
                {groupOptions.map((g) => (
                  <optgroup key={g.label} label={g.label}>
                    {g.items.map((it) => (
                      <option key={it.href} value={it.href}>{it.label}</option>
                    ))}
                  </optgroup>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </nav>
      {open && (
        <div className="container" style={{ paddingTop: 8, paddingBottom: 8 }}>
          <div style={{ display: 'grid', gap: 12 }}>
            {groupOptions.map((g) => (
              <div key={g.label} className="card" style={{ padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <strong>{g.label}</strong>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {g.items.map((it) => (
                    <Link key={it.href} href={it.href} className={isActive(it.href) ? 'active' : ''} onClick={() => setOpen(false)}>
                      {it.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="container">
        {children}
      </div>
      <CommandPalette open={palette} onClose={() => setPalette(false)} />
      </div>
  );
}
