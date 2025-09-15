import { useRef, useState } from 'react';

export default function Certificate({ name = 'Student Name', course = 'Course Title' }: { name?: string; course?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [downloading, setDownloading] = useState(false);

  const download = async () => {
    setDownloading(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);
      const el = ref.current!;
      const canvas = await html2canvas(el);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [el.clientWidth, el.clientHeight] } as any);
      pdf.addImage(imgData, 'PNG', 0, 0, el.clientWidth, el.clientHeight);
      pdf.save(`certificate-${name}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <div ref={ref} className="card" style={{ width: 800, height: 560, padding: 40, textAlign: 'center', margin: '0 auto' }}>
        <h1 style={{ marginBottom: 0 }}>Certificate of Completion</h1>
        <p className="muted">This certifies that</p>
        <h2 style={{ marginTop: 0 }}>{name}</h2>
        <p>has successfully completed the course</p>
        <h3 style={{ marginTop: 0 }}>{course}</h3>
        <p className="muted">Issued on {new Date().toLocaleDateString()}</p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
        <button className="btn btn-primary" onClick={download} disabled={downloading}>{downloading ? 'Generating...' : 'Download PDF'}</button>
      </div>
    </div>
  );
}

