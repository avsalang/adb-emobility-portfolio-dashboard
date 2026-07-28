import { KpiCard } from '../components/KpiCard';
import { PageHeader, Panel } from '../components/Panel';
import { usePortfolio } from '../context/PortfolioContext';
import { COLORS, fmtNumber, fmtPercent, sum } from '../utils';

const OUTPUT_FAMILY_LABELS: Record<string, string> = {
  finance_market: 'Finance and market development',
  policy_capacity: 'Policy and institutional capacity',
  fleet_deployment: 'Vehicle and fleet deployment',
  charging_energy_integration: 'Charging and energy integration',
  integrated_transport_infrastructure: 'Integrated transport infrastructure',
  digital_systems: 'Digital mobility systems',
  depots_operations: 'Depots and operations',
  manufacturing_battery: 'Manufacturing and batteries',
  service_coverage: 'Service coverage',
};

const OUTPUT_PROFILE_DEFINITIONS = [
  {
    key: 'delivered_or_operational_physical_output',
    label: 'Delivered or operational physical outputs',
    color: COLORS.plum,
  },
  {
    key: 'physical_output_in_progress',
    label: 'Physical outputs in progress',
    color: COLORS.coral,
  },
  {
    key: 'planned_or_financed_physical_output',
    label: 'Planned or financed physical outputs',
    color: COLORS.blue,
  },
  {
    key: 'knowledge_policy_or_capacity_output_only',
    label: 'Policy, knowledge and capacity outputs',
    color: COLORS.teal,
  },
  {
    key: 'finance_input_or_eligibility_only',
    label: 'Financing or eligibility only',
    color: COLORS.amber,
  },
  {
    key: 'no_distinct_or_only_potential_emobility_output',
    label: 'No distinct or only potential e-mobility output',
    color: COLORS.slate,
  },
] as const;

const PHYSICAL_OUTPUT_FAMILIES = new Set([
  'fleet_deployment',
  'charging_energy_integration',
  'integrated_transport_infrastructure',
  'depots_operations',
  'manufacturing_battery',
  'digital_systems',
  'service_coverage',
]);

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
  const quantified = filteredKpis.filter((row) => row.is_quantified);
  const quantifiedPhysicalProjects = new Set(
    directSafe
      .filter(
        (row) =>
          row.is_quantified && PHYSICAL_OUTPUT_FAMILIES.has(row.kpi_family),
      )
      .map((row) => row.project_number),
  ).size;

  const families = (() => {
    const grouped = new Map<string, { records: number; projects: Set<string> }>();
    filteredKpis
      .filter((row) => row.kpi_family !== 'no_distinct_emobility_output')
      .forEach((row) => {
        const current = grouped.get(row.kpi_family) ?? {
          records: 0,
          projects: new Set<string>(),
        };
        current.records += 1;
        current.projects.add(row.project_number);
        grouped.set(row.kpi_family, current);
      });
    return [...grouped.entries()]
      .map(([name, value]) => ({
        name,
        label: OUTPUT_FAMILY_LABELS[name] ?? name,
        records: value.records,
        projects: value.projects.size,
      }))
      .sort((a, b) => b.projects - a.projects);
  })();

  const outputProfiles = OUTPUT_PROFILE_DEFINITIONS.map((definition) => ({
    ...definition,
    value: filteredProjects.filter(
      (project) => project.manual_output_primary_profile === definition.key,
    ).length,
  })).filter((row) => row.value > 0);

  return (
    <div className="page">
      <PageHeader
        title="Outputs and KPIs"
      />

      <div className="kpi-grid">
        <KpiCard label="Delivered fleet (vehicles)" value={fmtNumber(deliveredFleet)} />
        <KpiCard label="Fleet pipeline (vehicles)" value={fmtNumber(pipelineFleet)} />
        <KpiCard label="Quantified KPI records" value={fmtNumber(quantified.length)} />
        <KpiCard
          label="Projects with quantified physical outputs"
          value={fmtNumber(quantifiedPhysicalProjects)}
        />
      </div>

      <div className="outputs-grid">
        <Panel
          title="Output coverage by project"
          subtitle="Unique projects with a structured record in each output category."
        >
          <div className="coverage-bars output-coverage-bars">
            {families.map((row) => (
              <div
                key={row.name}
                title={`${fmtNumber(row.records)} structured records across ${fmtNumber(row.projects)} projects`}
              >
                <span>{row.label}</span>
                <strong>{fmtNumber(row.projects)}</strong>
                <small>{fmtPercent(row.projects / Math.max(filteredProjects.length, 1))}</small>
                <i>
                  <em
                    style={{
                      width: `${(row.projects / Math.max(families[0]?.projects ?? 1, 1)) * 100}%`,
                    }}
                  />
                </i>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Primary output profile"
          subtitle="Share of projects by their principal e-mobility output profile."
        >
          <div
            className="output-profile-stack"
            role="img"
            aria-label={outputProfiles
              .map((row) => `${row.label}: ${row.value} projects`)
              .join('; ')}
          >
            {outputProfiles.map((row) => (
              <i
                key={row.key}
                style={{
                  width: `${(row.value / Math.max(filteredProjects.length, 1)) * 100}%`,
                  background: row.color,
                }}
                title={`${row.label}: ${row.value} projects`}
              />
            ))}
          </div>
          <div className="maturity-list">
            {outputProfiles.map((row) => (
              <div key={row.key}>
                <i style={{ background: row.color }} />
                <span>{row.label}</span>
                <strong>{row.value}</strong>
                <em>{fmtPercent(row.value / Math.max(filteredProjects.length, 1))}</em>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
