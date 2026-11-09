import { useEffect, useState } from 'react'

export function useStats(intervalMs = 2000) {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/stats')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!cancelled) {
          setStats(data)
          setError(null)
        }
      } catch (e) {
        if (!cancelled) setError(e.message)
      }
    }
    load()
    const id = setInterval(load, intervalMs)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [intervalMs])

  return { stats, error }
}
