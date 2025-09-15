export default function Skeleton({ height = 16, width = '100%', rounded = 8 }: { height?: number; width?: number | string; rounded?: number }) {
  return (
    <div className="skeleton" style={{ height, width, borderRadius: rounded }} />
  );
}

