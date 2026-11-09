export function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  let v = bytes
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${v.toFixed(i < 2 ? 0 : 1)} ${units[i]}`
}

export function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return [d && `${d}d`, (d || h) && `${h}h`, `${m}m`].filter(Boolean).join(' ')
}

export function tempColor(t) {
  if (t == null) return 'var(--muted)'
  if (t < 60) return 'var(--ok)'
  if (t < 75) return 'var(--warn)'
  return 'var(--bad)'
}

export function percentColor(p) {
  if (p < 70) return 'var(--ok)'
  if (p < 90) return 'var(--warn)'
  return 'var(--bad)'
}
