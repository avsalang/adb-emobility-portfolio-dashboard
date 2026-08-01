import { useState } from 'react';
import {
  DataTableDrawer,
  DataViewButton,
  type DataView,
} from '../components/DataTableDrawer';
import { PageHeader, Panel } from '../components/Panel';
import { usePortfolio } from '../context/PortfolioContext';
import {
  COLORS,
  fmtNumber,
  fmtPercent,
  formatVehicleMode,
  sum,
} from '../utils';

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

interface FleetBreakdownItem {
  key: string;
  label: string;
  value: number;
  color: string;
}

function FleetSummaryCard({
  label,
  total,
  breakdown,
  contributorCount,
  onViewContributors,
}: {
  label: string;
  total: number;
  breakdown: FleetBreakdownItem[];
  contributorCount: number;
  onViewContributors: () => void;
}) {
  return (
    <article className="kpi-card fleet-summary-card">
      <div className="fleet-summary-total">
        <span className="kpi-label">{label}</span>
        <strong>{fmtNumber(total)}</strong>
      </div>
      <div className="fleet-composition">
        <div
          className="fleet-composition-stack"
          role="img"
          aria-label={breakdown
            .map(
              (row) =>
                `${row.label}: ${fmtNumber(row.value)} vehicles, ${fmtPercent(row.value / Math.max(total, 1))}`,
            )
            .join('; ')}
        >
          {breakdown.map((row) => (
            <i
              key={row.key}
              style={{
                width: `${(row.value / Math.max(total, 1)) * 100}%`,
                background: row.color,
              }}
            />
          ))}
        </div>
        <div className="fleet-breakdown-list">
          {breakdown.map((row) => (
            <div key={row.key}>
              <i style={{ background: row.color }} />
              <span>{row.label}</span>
              <strong>{fmtNumber(row.value)}</strong>
              <small>{fmtPercent(row.value / Math.max(total, 1))}</small>
            </div>
          ))}
        </div>
      </div>
      <div className="fleet-summary-actions">
        <span>{fmtNumber(contributorCount)} contributing projects</span>
        <DataViewButton label="View projects" onClick={onViewContributors} />
      </div>
    </article>
  );
}

export function OutputsPage() {
  const { filteredKpis, filteredProjects } = usePortfolio();
  const [dataView, setDataView] = useState<DataView | null>(null);
  const projectById = new Map(
    filteredProjects.map((project) => [project.project_number, project]),
  );

  const directSafe = filteredKpis.filter(
    (row) => row.emobility_attribution === 'direct' && row.is_safe_to_aggregate,
  );
  const deliveredFleetRows = directSafe.filter(
    (row) =>
      row.kpi_family === 'fleet_deployment' &&
      row.aggregation_bucket === 'actual_delivered_completed_or_operational',
  );
  const deliveredFleet = sum(deliveredFleetRows, (row) => row.value_numeric ?? 0);
  const deliveredFleetBreakdown = [
    {
      key: 'three-wheelers',
      label: 'Electric three-wheelers',
      value: sum(
        deliveredFleetRows.filter(
          (row) => row.vehicle_or_mode === 'electric_three_wheeler',
        ),
        (row) => row.value_numeric ?? 0,
      ),
      color: COLORS.teal,
    },
    {
      key: 'buses',
      label: 'Electric, hybrid and trolleybuses',
      value: sum(
        deliveredFleetRows.filter((row) =>
          [
            'battery_electric_bus',
            'electric_bus',
            'electric_trolleybus',
            'plug_in_hybrid_electric_bus',
          ].includes(row.vehicle_or_mode),
        ),
        (row) => row.value_numeric ?? 0,
      ),
      color: COLORS.blue,
    },
    {
      key: 'other',
      label: 'Other electric and hybrid vehicles',
      value: sum(
        deliveredFleetRows.filter(
          (row) =>
            row.vehicle_or_mode !== 'electric_three_wheeler' &&
            ![
              'battery_electric_bus',
              'electric_bus',
              'electric_trolleybus',
              'plug_in_hybrid_electric_bus',
            ].includes(row.vehicle_or_mode),
        ),
        (row) => row.value_numeric ?? 0,
      ),
      color: COLORS.amber,
    },
  ].filter((row) => row.value > 0);
  const pipelineFleetRows = directSafe.filter(
    (row) =>
      row.kpi_family === 'fleet_deployment' &&
      row.aggregation_bucket === 'pipeline_planned_approved_or_proposed',
  );
  const pipelineFleet = sum(pipelineFleetRows, (row) => row.value_numeric ?? 0);
  const pipelineFleetBreakdown = [
    {
      key: 'buses',
      label: 'Electric buses, including articulated',
      value: sum(
        pipelineFleetRows.filter((row) =>
          [
            'articulated_electric_bus',
            'battery_electric_bus',
            'electric_bus',
          ].includes(row.vehicle_or_mode),
        ),
        (row) => row.value_numeric ?? 0,
      ),
      color: COLORS.blue,
    },
    {
      key: 'three-wheelers',
      label: 'Electric three-wheelers',
      value: sum(
        pipelineFleetRows.filter(
          (row) => row.vehicle_or_mode === 'electric_three_wheeler',
        ),
        (row) => row.value_numeric ?? 0,
      ),
      color: COLORS.teal,
    },
    {
      key: 'ferries',
      label: 'Electric ferries',
      value: sum(
        pipelineFleetRows.filter(
          (row) => row.vehicle_or_mode === 'electric_ferry',
        ),
        (row) => row.value_numeric ?? 0,
      ),
      color: COLORS.plum,
    },
    {
      key: 'other',
      label: 'Other pipeline vehicles',
      value: sum(
        pipelineFleetRows.filter(
          (row) =>
            ![
              'articulated_electric_bus',
              'battery_electric_bus',
              'electric_bus',
              'electric_three_wheeler',
              'electric_ferry',
            ].includes(row.vehicle_or_mode),
        ),
        (row) => row.value_numeric ?? 0,
      ),
      color: COLORS.amber,
    },
  ].filter((row) => row.value > 0);
  const fleetDataView = (
    title: string,
    filename: string,
    rows: typeof deliveredFleetRows,
  ): DataView => {
    const grouped = new Map<
      string,
      { value: number; modes: Set<string>; indicators: Set<string> }
    >();
    rows.forEach((row) => {
      const current = grouped.get(row.project_number) ?? {
        value: 0,
        modes: new Set<string>(),
        indicators: new Set<string>(),
      };
      current.value += row.value_numeric ?? 0;
      current.modes.add(formatVehicleMode(row.vehicle_or_mode));
      current.indicators.add(row.indicator);
      grouped.set(row.project_number, current);
    });
    return {
      title,
      filename,
      columns: [
        { key: 'project_number', label: 'Project number' },
        { key: 'project_title', label: 'Project title' },
        { key: 'status', label: 'Status' },
        { key: 'vehicle_mode', label: 'Vehicle or mode' },
        { key: 'reported_value', label: 'Fleet vehicles', align: 'right' },
        { key: 'indicator', label: 'Reported output' },
      ],
      rows: [...grouped.entries()]
        .map(([projectNumber, value]) => ({
          project_number: projectNumber,
          project_title:
            projectById.get(projectNumber)?.project_title ?? projectNumber,
          status: projectById.get(projectNumber)?.status ?? '',
          vehicle_mode: [...value.modes].join('; '),
          reported_value: value.value,
          indicator: [...value.indicators].join('; '),
        }))
        .sort((a, b) =>
          String(a.project_number).localeCompare(String(b.project_number)),
        ),
    };
  };

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

      <div className="kpi-grid outputs-kpi-grid">
        <FleetSummaryCard
          label="Delivered fleet (vehicles)"
          total={deliveredFleet}
          breakdown={deliveredFleetBreakdown}
          contributorCount={new Set(deliveredFleetRows.map((row) => row.project_number)).size}
          onViewContributors={() =>
            setDataView(
              fleetDataView(
                'Delivered fleet contributing projects',
                'ato_delivered_fleet_projects.csv',
                deliveredFleetRows,
              ),
            )
          }
        />
        <FleetSummaryCard
          label="Fleet pipeline (vehicles)"
          total={pipelineFleet}
          breakdown={pipelineFleetBreakdown}
          contributorCount={new Set(pipelineFleetRows.map((row) => row.project_number)).size}
          onViewContributors={() =>
            setDataView(
              fleetDataView(
                'Fleet pipeline contributing projects',
                'ato_fleet_pipeline_projects.csv',
                pipelineFleetRows,
              ),
            )
          }
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

      {dataView && (
        <DataTableDrawer view={dataView} onClose={() => setDataView(null)} />
      )}
    </div>
  );
}
