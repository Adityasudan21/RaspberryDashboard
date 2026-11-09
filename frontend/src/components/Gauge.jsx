export default function Gauge({ value, max = 100, label, color }) {
  const r = 52
  const c = 2 * Math.PI * r
  const pct = Math.min(Math.max(value ?? 0, 0), max) / max
  return (
    <svg viewBox="0 0 120 120" className="gauge" role="img" aria-label={`${label}: ${value ?? 'n/a'}`}>
      <circle cx="60" cy="60" r={r} className="gauge-track" />
      <circle
        cx="60" cy="60" r={r}
        className="gauge-fill"
        stroke={color}
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="66" textAnchor="middle" className="gauge-text">{label}</text>
    </svg>
  )
}
