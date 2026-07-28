import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { KpiCard } from '../components/KpiCard';
import { PageHeader, Panel } from '../components/Panel';
import { usePortfolio } from '../context/PortfolioContext';
import {
  SUBTHEME_COLORS,
  fmtNumber,
  fmtPercent,
  groupCount,
  humanize,
  shortSubtheme,
  splitTags,
} from '../utils';

const ATTRIBUTION_COLORS: Record<string, string> = {
  dedicated: '#1769aa',
  partial_or_mixed: '#178f8f',
  indirect_or_potential: '#e9a62d',
  quantified_minimum: '#735a83',
  other: '#94a3b8',
};

const DISTRIBUTION_COLORS = [
  '#1769aa',
  '#178f8f',
  '#e9a62d',
  '#735a83',
  '#df6b55',
  '#547fa5',
  '#55a89b',
  '#b76b7d',
];

function DistributionPie({
  rows,
  centerLabel,
}: {
  rows: { name: string; value: number }[];
  centerLabel: string;
}) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeRow = rows[activeIndex] ?? rows[0];

  return (
    <div className="distribution-pie">
      <div className="distribution-pie-chart">
        <div className="distribution-pie-graphic">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={rows}
                dataKey="value"
                nameKey="name"
                innerRadius={54}
                outerRadius={82}
                paddingAngle={2}
                isAnimationActive={false}
                onMouseEnter={(_, index) => setActiveIndex(index)}
              >
                {rows.map((row, index) => (
                  <Cell
                    key={row.name}
                    fill={DISTRIBUTION_COLORS[index % DISTRIBUTION_COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="distribution-pie-center">
            <strong>{fmtNumber(total)}</strong>
            <span>{centerLabel}</span>
          </div>
        </div>
        <div className="distribution-pie-readout" aria-live="polite">
          {activeRow && (
            <>
              <span>{activeRow.name}</span>
              <small>
                {fmtNumber(activeRow.value)} projects ·{' '}
                {fmtPercent(activeRow.value / Math.max(total, 1))}
              </small>
            </>
          )}
        </div>
      </div>
      <div className="distribution-legend">
        {rows.map((row, index) => (
          <div key={row.name} onMouseEnter={() => setActiveIndex(index)}>
            <i
              style={{
                background:
                  DISTRIBUTION_COLORS[index % DISTRIBUTION_COLORS.length],
              }}
            />
            <span>{row.name}</span>
            <strong>{row.value}</strong>
            <small>{fmtPercent(row.value / Math.max(total, 1))}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

function modeGroup(value: string): string {
  if (/trolley|bus/.test(value)) return 'Electric and low-carbon buses';
  if (/two_wheeler|motorcycle|scooter/.test(value)) return 'Two-wheelers';
  if (/three_wheeler|rickshaw|tuktuk|microtransit/.test(value)) return 'Three-wheelers and microtransit';
  if (/ferry|boat|water_transport/.test(value)) return 'Electric water transport';
  if (/rail|metro|ropeway|cable/.test(value)) return 'Rail, metro and cable transit';
  if (/commercial|delivery|distribution|four_wheeler|car|light_vehicle/.test(value)) return 'Cars and commercial vehicles';
  if (/unspecified|mobility/.test(value)) return 'General e-mobility scope';
  return 'Other and enabling modes';
}

export function PortfolioProfilePage() {
  const {
    filteredProjects,
    filteredSubthemes,
    filteredKpis,
    setFilters,
  } = usePortfolio();

  const subthemes = useMemo(() => {
    const grouped = new Map<string, Set<string>>();
    filteredSubthemes.forEach((row) => {
      if (!grouped.has(row.subtheme)) grouped.set(row.subtheme, new Set());
      grouped.get(row.subtheme)?.add(row.project_number);
    });
    return [...grouped.entries()]
      .map(([name, projects]) => ({
        name,
        projects: projects.size,
      }))
      .sort((a, b) => b.projects - a.projects);
  }, [filteredSubthemes]);

  const attribution = groupCount(
    filteredProjects,
    (project) => project.manual_attribution_class,
  );
  const sectors = groupCount(filteredProjects, (project) => project.sector);
  const profiles = groupCount(
    filteredProjects,
    (project) => project.manual_output_primary_profile,
  );

  const valueChain = useMemo(() => {
    const counts = new Map<string, Set<string>>();
    filteredProjects.forEach((project) => {
      splitTags(project.manual_value_chain_stages).forEach((stage) => {
        if (!counts.has(stage)) counts.set(stage, new Set());
        counts.get(stage)?.add(project.project_number);
      });
    });
    return [...counts.entries()]
      .map(([name, projects]) => ({ name, value: projects.size }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 12);
  }, [filteredProjects]);

  const modes = useMemo(() => {
    const projectGroups = new Map<string, Set<string>>();
    filteredProjects.forEach((project) => {
      const groups = new Set(splitTags(project.manual_vehicle_modes).map(modeGroup));
      groups.forEach((group) => {
        if (!projectGroups.has(group)) projectGroups.set(group, new Set());
        projectGroups.get(group)?.add(project.project_number);
      });
    });
    return [...projectGroups.entries()]
      .map(([name, projects]) => ({ name, value: projects.size }))
      .sort((a, b) => b.value - a.value);
  }, [filteredProjects]);

  const crossCutting = useMemo(() => {
    const counts = new Map<string, Set<string>>();
    filteredProjects.forEach((project) => {
      splitTags(project.manual_cross_cutting_focus).forEach((focus) => {
        if (!counts.has(focus)) counts.set(focus, new Set());
        counts.get(focus)?.add(project.project_number);
      });
    });
    return [...counts.entries()]
      .map(([name, projects]) => ({ name, value: projects.size }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filteredProjects]);

  const manufacturingProjects =
    subthemes.find((row) => row.name === 'manufacturing_supply_chains_and_battery_circularity')?.projects ?? 0;
  const physicalProjects = profiles
    .filter((row) => /physical/i.test(row.name))
    .reduce((total, row) => total + row.value, 0);

  return (
    <div className="page">
      <PageHeader
        title="Technology profile"
      />

      <div className="kpi-grid">
        <KpiCard label="Fleet transition" value={fmtNumber(subthemes.find((row) => row.name === 'vehicles_and_fleet_transition')?.projects ?? 0)} />
        <KpiCard label="Charging and power" value={fmtNumber(subthemes.find((row) => row.name === 'charging_swapping_and_power_system_integration')?.projects ?? 0)} />
        <KpiCard label="Physical delivery" value={fmtNumber(physicalProjects)} />
        <KpiCard label="Manufacturing and circularity" value={fmtNumber(manufacturingProjects)} />
      </div>

      <div className="profile-main-grid">
        <Panel
          title="Subtheme coverage"
          subtitle="Unique projects by multi-label e-mobility subtheme."
        >
          <div className="chart-profile">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subthemes} layout="vertical" margin={{ top: 4, right: 20, bottom: 0, left: 8 }}>
                <CartesianGrid stroke="#edf2f6" horizontal={false} />
                <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 16 }} />
                <YAxis type="category" dataKey="name" width={250} tickFormatter={shortSubtheme} axisLine={false} tickLine={false} tick={{ fontSize: 16 }} />
                <Tooltip
                  formatter={(value) => [
                    `${fmtNumber(Number(value))} projects`,
                    'Projects',
                  ]}
                  labelFormatter={shortSubtheme}
                />
                <Bar dataKey="projects" radius={[0, 5, 5, 0]} onClick={(row) => setFilters((current) => ({ ...current, subtheme: String(row.name) }))}>
                  {subthemes.map((row) => <Cell key={row.name} fill={SUBTHEME_COLORS[row.name]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel
          title="E-mobility attribution"
          subtitle="How central e-mobility is to each project."
        >
          <div className="pie-profile">
            <div className="pie-chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={54}
                    outerRadius={82}
                    paddingAngle={2}
                    isAnimationActive={false}
                  >
                    {attribution.map((row) => <Cell key={row.name} fill={ATTRIBUTION_COLORS[row.name] ?? '#94a3b8'} />)}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      `${fmtNumber(Number(value))} projects`,
                      humanize(String(name)),
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-center"><strong>{filteredProjects.length}</strong><span>projects</span></div>
            </div>
            <div className="legend-rows">
              {attribution.map((row) => (
                <button key={row.name} onClick={() => setFilters((current) => ({ ...current, attribution: row.name }))}>
                  <i style={{ background: ATTRIBUTION_COLORS[row.name] ?? '#94a3b8' }} />
                  <span>{humanize(row.name)}</span>
                  <strong>{row.value}</strong>
                  <small>{fmtPercent(row.value / Math.max(filteredProjects.length, 1))}</small>
                </button>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      <div className="two-column-grid">
        <Panel
          title="Vehicle and transport modes"
          subtitle="Unique projects by grouped mode; projects may span groups."
        >
          <DistributionPie rows={modes} centerLabel="mode assignments" />
        </Panel>

        <Panel
          title="Sector distribution"
          subtitle="Projects by primary ADB sector."
        >
          <DistributionPie rows={sectors} centerLabel="projects" />
        </Panel>
      </div>

      <div className="two-column-grid">
        <Panel
          title="Value-chain stages"
          subtitle="Unique projects across multi-label value-chain stages."
        >
          <div className="compact-bars amber">
            {valueChain.map((row) => (
              <div key={row.name}>
                <span>{humanize(row.name)}</span><strong>{row.value}</strong>
                <i><em style={{ width: `${(row.value / Math.max(valueChain[0]?.value ?? 1, 1)) * 100}%` }} /></i>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Cross-cutting priorities"
          subtitle="Most common priorities identified in project records."
        >
          <div className="focus-cloud">
            {crossCutting.map((row, index) => (
              <span key={row.name} style={{ '--weight': Math.max(0.78, 1.12 - index * 0.035) } as React.CSSProperties}>
                {humanize(row.name)} <b>{row.value}</b>
              </span>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
