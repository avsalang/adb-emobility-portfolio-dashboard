import { useMemo } from 'react';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { PageHeader, Panel } from '../components/Panel';
import { usePortfolio } from '../context/PortfolioContext';
import {
  COLORS,
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

function CoverageBars({
  rows,
  denominator,
  formatter = (value) => value,
  color = COLORS.blue,
  onSelect,
}: {
  rows: { name: string; value: number }[];
  denominator: number;
  formatter?: (value: string) => string;
  color?: string;
  onSelect?: (value: string) => void;
}) {
  const rowContent = (row: { name: string; value: number }) => (
    <>
      <span>{formatter(row.name)}</span>
      <strong>{fmtNumber(row.value)}</strong>
      <small>{fmtPercent(row.value / Math.max(denominator, 1))}</small>
      <i>
        <em
          style={{
            width: `${Math.min((row.value / Math.max(denominator, 1)) * 100, 100)}%`,
            background: color,
          }}
        />
      </i>
    </>
  );

  return (
    <div className="coverage-bars">
      {rows.map((row) =>
        onSelect ? (
          <button type="button" key={row.name} onClick={() => onSelect(row.name)}>
            {rowContent(row)}
          </button>
        ) : (
          <div key={row.name}>{rowContent(row)}</div>
        ),
      )}
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

  return (
    <div className="page">
      <PageHeader
        title="Technology profile"
      />

      <div className="profile-main-grid">
        <Panel
          title="Subtheme coverage"
          subtitle="Unique projects by multi-label e-mobility subtheme."
        >
          <CoverageBars
            rows={subthemes.map((row) => ({
              name: row.name,
              value: row.projects,
            }))}
            denominator={filteredProjects.length}
            formatter={shortSubtheme}
            onSelect={(subtheme) =>
              setFilters((current) => ({ ...current, subtheme }))
            }
          />
        </Panel>

        <Panel
          title="E-mobility attribution"
          subtitle="How central e-mobility is to each project."
        >
          <div className="pie-profile">
            <div
              className="pie-chart-wrap"
              role="img"
              aria-label={`${filteredProjects.length} projects by e-mobility attribution. ${attribution
                .map((row) => `${humanize(row.name)}: ${row.value}`)
                .join('; ')}.`}
            >
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
                <button type="button" key={row.name} onClick={() => setFilters((current) => ({ ...current, attribution: row.name }))}>
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
          subtitle="Unique project coverage by grouped mode; projects may span groups."
        >
          <CoverageBars
            rows={modes}
            denominator={filteredProjects.length}
            color={COLORS.teal}
          />
        </Panel>

        <Panel
          title="Sector distribution"
          subtitle="Projects by primary ADB sector."
        >
          <CoverageBars
            rows={sectors}
            denominator={filteredProjects.length}
          />
        </Panel>
      </div>

      <div className="two-column-grid">
        <Panel
          title="Value-chain stages"
          subtitle="Project coverage across multi-label value-chain stages."
        >
          <CoverageBars
            rows={valueChain}
            denominator={filteredProjects.length}
            formatter={humanize}
            color={COLORS.amber}
          />
        </Panel>

        <Panel
          title="Cross-cutting priorities"
          subtitle="Multi-label project coverage; related priorities may overlap."
        >
          <CoverageBars
            rows={crossCutting}
            denominator={filteredProjects.length}
            formatter={humanize}
          />
        </Panel>
      </div>
    </div>
  );
}
