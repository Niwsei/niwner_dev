import { Brain, Workflow, Trophy, ShoppingCart, Video, Code2 } from 'lucide-react';

const features = [
  { icon: Video, title: 'Video Streaming', desc: 'คุณภาพสูง + Download ออฟไลน์' },
  { icon: Code2, title: 'Interactive', desc: 'Quiz • Assignment • Live Coding' },
  { icon: Brain, title: 'Logic Training', desc: 'Puzzle • Analyzer • Adaptive' },
  { icon: Workflow, title: 'Flow Design', desc: 'Workflow Builder • Simulation' },
  { icon: Trophy, title: 'Gamification', desc: 'XP • Levels • Badges • Streaks' },
  { icon: ShoppingCart, title: 'Commerce', desc: 'Subscriptions • Coupons • Bundles' }
];

export default function FeatureList() {
  return (
    <section>
      <div className="grid">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="col-4">
            <div className="card" style={{ padding: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
              <div className="badge" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36 }}>
                <Icon size={18} />
              </div>
              <div>
                <strong>{title}</strong>
                <div className="muted" style={{ fontSize: 12 }}>{desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

