import Seo from '../components/Seo';
import PageHeader from '../components/ui/PageHeader';
import Card, { CardHeader, CardMeta } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Link from 'next/link';

type Item = { label: string; href: string; note?: string };
type Group = { title: string; items: Item[]; tag?: string };

const groups: Group[] = [
  {
    title: 'Landing & Marketing',
    items: [
      { label: 'Home (Hero, Stats, Feature highlights, Testimonials)', href: '/' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Courses',
    items: [
      { label: 'Catalog', href: '/courses' },
      { label: 'Search', href: '/courses/search' },
      { label: 'Categories', href: '/courses/categories' },
      { label: 'Compare', href: '/courses/compare' },
      { label: 'Preview', href: '/courses/preview' },
      { label: 'Course Detail', href: '/courses/[id]' },
    ],
  },
  {
    title: 'LMS (Learning)',
    items: [
      { label: 'Player', href: '/lms/player' },
      { label: 'Quiz', href: '/lms/quiz' },
      { label: 'Assignment', href: '/lms/assignment' },
      { label: 'Notes', href: '/lms/notes' },
      { label: 'Bookmarks', href: '/lms/bookmarks' },
      { label: 'Download Manager', href: '/lms/download' },
      { label: 'Certificate', href: '/lms/certificate' },
      { label: 'Course Builder', href: '/lms/builder' },
      { label: 'Learning Dashboard', href: '/lms/dashboard' },
    ],
  },
  {
    title: 'Logic Training',
    items: [
      { label: 'Analyzer', href: '/logic/analyzer' },
      { label: 'Visual Builder', href: '/logic/builder' },
      { label: 'Games', href: '/logic/games' },
      { label: 'Assessment', href: '/logic/assessment' },
      { label: 'Diagram', href: '/logic/diagram' },
      { label: 'Solver', href: '/logic/solver' },
      { label: 'Solution', href: '/logic/solution' },
    ],
  },
  {
    title: 'Flow Design',
    items: [
      { label: 'Flow Builder', href: '/flow/builder' },
      { label: 'Mapping', href: '/flow/mapping' },
      { label: 'Simulation', href: '/flow/simulation' },
      { label: 'Analytics', href: '/flow/analytics' },
      { label: 'Templates', href: '/flow/templates' },
      { label: 'Version Control', href: '/flow/version-control' },
      { label: 'Collaboration', href: '/flow/collaboration' },
    ],
  },
  {
    title: 'Gamification',
    items: [
      { label: 'Points', href: '/gamification/points' },
      { label: 'Badges', href: '/gamification/badges' },
      { label: 'Achievements', href: '/gamification/achievements' },
      { label: 'Leaderboards', href: '/gamification/leaderboards' },
      { label: 'Streaks', href: '/gamification/streaks' },
      { label: 'Challenges', href: '/gamification/challenges' },
      { label: 'Share', href: '/gamification/share' },
    ],
  },
  {
    title: 'Community & Communication',
    items: [
      { label: 'Live Chat', href: '/community/chat' },
      { label: 'Video Calls', href: '/community/video-calls' },
      { label: 'Peer Review', href: '/community/peer-review' },
      { label: 'Mentorship', href: '/community/mentorship' },
      { label: 'Knowledge Base', href: '/community/knowledge' },
      { label: 'Forums', href: '/community/forums' },
      { label: 'Groups', href: '/community/groups' },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { label: 'Usage', href: '/analytics/usage' },
      { label: 'Performance', href: '/analytics/performance' },
      { label: 'Reports', href: '/analytics/reports' },
      { label: 'Goals', href: '/analytics/goals' },
      { label: 'Learning Analytics', href: '/analytics/learning' },
    ],
  },
  {
    title: 'Shop & Billing',
    items: [
      { label: 'Cart', href: '/shop/cart' },
      { label: 'Checkout', href: '/shop/checkout' },
      { label: 'Orders', href: '/shop/orders' },
      { label: 'Payments', href: '/shop/payments' },
      { label: 'Invoices', href: '/shop/invoices' },
      { label: 'Refunds', href: '/shop/refunds' },
      { label: 'Subscriptions', href: '/shop/subscriptions' },
    ],
  },
  {
    title: 'User Dashboard',
    items: [
      { label: 'Profile', href: '/dashboard/profile' },
      { label: 'Payments', href: '/dashboard/payments' },
      { label: 'Purchases', href: '/dashboard/purchases' },
      { label: 'Progress', href: '/dashboard/progress' },
      { label: 'Certificates', href: '/dashboard/certificates' },
      { label: 'Notifications', href: '/dashboard/notifications' },
      { label: 'Subscription', href: '/dashboard/subscription' },
      { label: 'Settings', href: '/dashboard/settings' },
    ],
  },
  {
    title: 'Authentication & User Management',
    items: [
      { label: 'Register (Email/Phone/SSO)', href: '/auth/register' },
      { label: 'Login (Password/SSO)', href: '/auth/login' },
      { label: 'Password Reset (Email/SMS)', href: '/auth/password-reset' },
      { label: 'Email Verification', href: '/auth/verify-email' },
      { label: 'Two-Factor (MFA)', href: '/auth/two-factor' },
    ],
  },
  {
    title: 'UX Enhancements',
    items: [
      { label: 'Theme Toggle (Light/Dark)', href: '#' },
      { label: 'Accent Picker', href: '#' },
      { label: 'Command Palette (⌘K)', href: '#' },
      { label: 'Responsive Navbar w/ grouped Select', href: '#' },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <main>
      <Seo title="Complete Feature List" description="รายละเอียดครบถ้วนของทุกฟีเจอร์ใน EduPro Academy" />
      <PageHeader title="Complete Feature List – EduPro Academy Platform" subtitle="รายละเอียดครบถ้วนของทุก Features และการทำงาน" />
      <div className="grid">
        {groups.map((g) => (
          <div key={g.title} className="col-6">
            <Card>
              <CardHeader title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{g.title}</span>
                <Badge>Available</Badge>
              </div>} />
              <CardMeta>ลิงก์ไปยังหน้าการทำงานที่เกี่ยวข้อง</CardMeta>
              <ul style={{ marginTop: 10, paddingLeft: 18 }}>
                {g.items.map((it) => (
                  <li key={it.label} style={{ marginBottom: 6 }}>
                    {it.href === '#' ? (
                      <span className="muted">{it.label}</span>
                    ) : (
                      <Link href={it.href}>{it.label}</Link>
                    )}
                    {it.note && <span className="muted"> — {it.note}</span>}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        ))}
      </div>
    </main>
  );
}
