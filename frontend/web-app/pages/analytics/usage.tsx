import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { getLearningSeries } from '../../lib/api';
import PageHeader from '../../components/ui/PageHeader';
const Line = dynamic(() => import('react-chartjs-2').then(m => m.Line), { ssr: false });
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function Usage() {
  const [series, setSeries] = useState<{ labels: string[]; data: number[] } | null>(null);
  useEffect(() => { getLearningSeries().then(setSeries); }, []);
  const data = useMemo(() => ({
    labels: series?.labels || [],
    datasets: [{ label: 'Learning Minutes', data: series?.data || [], borderColor: '#7ee787', backgroundColor: 'rgba(126,231,135,.2)' }]
  }), [series]);
  return (
    <main>
      <PageHeader title="Usage Statistics" subtitle="Weekly learning activity" />
      <div className="card">
        {series ? <Line data={data} /> : 'Loading...'}
      </div>
    </main>
  );
}
