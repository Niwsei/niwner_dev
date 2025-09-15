export default function Progress({ value }: { value: number }) {
  const v = Math.min(100, Math.max(0, value));
  return (
    <div className="progress"><span style={{ width: `${v}%` }} /></div>
  );
}

