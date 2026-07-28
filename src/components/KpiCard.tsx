export function KpiCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <article className="kpi-card">
      <span className="kpi-label">{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
