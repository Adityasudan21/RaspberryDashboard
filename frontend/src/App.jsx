import { useStats } from './hooks/useStats'
import StatCard from './components/StatCard'
import Gauge from './components/Gauge'
import { formatBytes, formatUptime, tempColor, percentColor } from './utils'

export default function App() {
  const { stats, error } = useStats(2000)

  return (
    <main>
      <header>
        <h1>Raspberry Pi Dashboard</h1>
        <span className={`status ${error ? 'offline' : 'online'}`}>
          {error ? `Offline (${error})` : stats ? stats.hostname : 'Connecting…'}
        </span>
      </header>

      {stats && (
        <div className="grid">
          <StatCard label="CPU Usage" sub={`Load avg: ${stats.load.join(' / ')}`}>
            <Gauge value={stats.cpu.usage} label={`${stats.cpu.usage.toFixed(0)}%`} color={percentColor(stats.cpu.usage)} />
          </StatCard>

          <StatCard label="CPU Temperature" sub="Throttles at 80°C+">
            <Gauge value={stats.cpu.temp} max={100} label={stats.cpu.temp != null ? `${stats.cpu.temp.toFixed(1)}°C` : 'n/a'} color={tempColor(stats.cpu.temp)} />
          </StatCard>

          <StatCard label="Memory" sub={`${formatBytes(stats.memory.used)} of ${formatBytes(stats.memory.total)}`}>
            <Gauge value={stats.memory.percent} label={`${stats.memory.percent.toFixed(0)}%`} color={percentColor(stats.memory.percent)} />
          </StatCard>

          <StatCard label="SSD Usage" sub={`${formatBytes(stats.disk.used)} used · ${formatBytes(stats.disk.free)} free of ${formatBytes(stats.disk.total)}`}>
            <Gauge value={stats.disk.percent} label={`${stats.disk.percent.toFixed(0)}%`} color={percentColor(stats.disk.percent)} />
          </StatCard>

          <StatCard label="Uptime">
            <p className="big">{formatUptime(stats.uptime)}</p>
          </StatCard>

          <StatCard label="Cores">
            <p className="big">{stats.cpu.cores}</p>
          </StatCard>

          <section className="card wide">
            <h2>Per-core Usage</h2>
            <div className="cores">
              {stats.cpu.perCore.map((u, i) => (
                <div key={i} className="core">
                  <span>Core {i}</span>
                  <div className="bar"><div style={{ width: `${u}%`, background: percentColor(u) }} /></div>
                  <span>{u.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
