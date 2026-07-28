import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { KpiCard } from '../components/KpiCard';
import { PageHeader, Panel } from '../components/Panel';
import { usePortfolio } from '../context/PortfolioContext';
import { COLORS, fmtNumber, groupCount, humanize, sum } from '../utils';

export function OutputsPage() {
  const { filteredKpis, filteredProjects } = usePortfolio();

  const directSafe = filteredKpis.filter(
    (row) => row.emobility_attribution === 'direct' && row.is_safe_to_aggregate,
  );
  const deliveredFleet = sum(
    directSafe.filter(
      (row) =>
        row.kpi_family === 'fleet_deployment' &&
        row.aggregation_bucket === 'actual_delivered_completed_or_operational',
    ),
    (row) => row.value_numeric ?? 0,
  );
  const pipelineFleet = sum(
    directSafe.filter(
      (row) =>
        row.kpi_family === 'fleet_deployment' &&
        row.aggregation_bucket === 'pipeline_planned_approved_or_proposed',
    ),
    (row) => row.value_numeric ?? 0,
  );
  const traction = directSafe.find(
    (row) => row.project_number === '50010-002' && row.indicator === 'traction_substations',
  );
  const quantified = filteredKpis.filter((row) => row.is_quantified);

  const families = groupCount(
    filteredKpis.filter(
      (row) => row.kpi_family !== 'no_distinct_emobility_output',
    ),
    (row) => row.kpi_family,
  ).map((row) => ({
    ...row,
    label: humanize(row.name),
  }));

  const outputProfiles = groupCount(
    filteredProjects,
    (project) => project.manual_output_primary_profile,
  );

  return (
    <div className="page">
      <PageHeader
        title="Outputs and KPIs"
      />

      <div className="kpi-grid">
        <KpiCard label="Delivered fleet" value={fmtNumber(deliveredFleet)} />
        <KpiCard label="Fleet pipeline" value={fmtNumber(pipelineFleet)} />
        <KpiCard label="Quantified indicators" value={fmtNumber(quantified.length)} />
        <KpiCard label="Traction substations" value={fmtNumber(traction?.value_numeric ?? 33)} />
      </div>

      <div className="outputs-grid">
        <Panel
          title="Output record profile"
          subtitle="Structured records by output category."
        >
          <div className="chart-output">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={families} layout="vertical" margin={{ top: 2, right: 18, bottom: 0, left: 8 }}>
                <CartesianGrid stroke="#edf2f6" horizontal={false} />
                <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 16 }} />
                <YAxis type="category" dataKey="label" width={240} axisLine={false} tickLine={false} tick={{ fontSize: 16 }} />
                <Tooltip
                  formatter={(value) => [
                    `${fmtNumber(Number(value))} records`,
                    'Records',
                  ]}
                />
                <Bar dataKey="value" radius={[0, 5, 5, 0]}>
                  {families.map((row, index) => (
                    <Cell key={row.name} fill={[COLORS.blue, COLORS.teal, COLORS.amber, COLORS.plum, COLORS.coral][index % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel
          title="Project output maturity"
          subtitle="Projects by the maturity of their e-mobility outputs."
        >
          <div className="maturity-list">
            {outputProfiles.map((row, index) => (
              <div key={row.name}>
                <i style={{ background: [COLORS.teal, COLORS.blue, COLORS.amber, COLORS.plum, COLORS.slate, COLORS.coral][index % 6] }} />
                <span>{humanize(row.name)}</span>
                <strong>{row.value}</strong>
                <em>{Math.round((row.value / Math.max(filteredProjects.length, 1)) * 100)}%</em>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
