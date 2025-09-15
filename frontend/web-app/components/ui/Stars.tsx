export default function Stars({ value = 0, outOf = 5 }: { value?: number; outOf?: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const empty = outOf - full - (half ? 1 : 0);
  return (
    <span aria-label={`${value} out of ${outOf} stars`} className="muted" style={{ letterSpacing: 1 }}>
      {'★'.repeat(full)}{half ? '☆' : ''}{'✩'.repeat(Math.max(0, empty))}
    </span>
  );
}

