export default function StatCard({ label, children, sub }) {
  return (
    <section className="card">
      <h2>{label}</h2>
      <div className="card-body">{children}</div>
      {sub && <p className="sub">{sub}</p>}
    </section>
  )
}
