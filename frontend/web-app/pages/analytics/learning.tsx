import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import PageHeader from '../../components/ui/PageHeader';

const Line = dynamic(() => import('react-chartjs-2').then(m => m.Line), { ssr: false });
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function Learning() {
  const data = useMemo(() => ({
    labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    datasets: [{ label: 'Minutes Studied', data: [30, 42, 28, 60, 90, 120, 75], borderColor: '#6ea8fe', backgroundColor: 'rgba(110,168,254,.2)' }]
  }), []);
  const options = useMemo(() => ({ responsive: true, plugins: { legend: { display: true } } }), []);
  return (
    <main>
      <PageHeader title="Learning Analytics" subtitle="Track performance and trends" />
      <div className="card">
        <Line data={data} options={options as any} />
      </div>
    </main>
  );
}
