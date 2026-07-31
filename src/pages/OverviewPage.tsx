import { Activity } from 'lucide-react';
import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { KpiCard } from '../components/KpiCard';
import { PageHeader, Panel } from '../components/Panel';
import { PortfolioMap } from '../components/PortfolioMap';
import { usePortfolio } from '../context/PortfolioContext';
import { buildProjectMapLocations } from '../map/projectLocations';
import {
  COLORS,
  STATUS_COLORS,
  fmtMoney,
  fmtNumber,
  fmtPercent,
  sum,
} from '../utils';

export function OverviewPage() {
  const {
    filteredProjects,
    filteredRecipients,
    filters,
    setFilters,
  } = usePortfolio();

  const totalFunding = sum(filteredProjects, (project) => project.funding_total_usd_m);
  const dedicated = filteredProjects.filter(
    (project) => project.manual_attribution_class === 'dedicated',
  );
  const active = filteredProjects.filter((project) => project.status === 'Active');
  const recipientNames = new Set(
    filteredRecipients
      .filter((row) => row.recipient_type === 'Country')
      .map((row) => row.allocated_recipient),
  );

  const timeline = useMemo(() => {
    const years = new Map<
      number,
      { year: number; funding: number; projects: number; Active: number; Closed: number; Approved: number; Proposed: number }
    >();
    filteredProjects.forEach((project) => {
      const row = years.get(project.approval_year) ?? {
        year: project.approval_year,
        funding: 0,
        projects: 0,
        Active: 0,
        Closed: 0,
        Approved: 0,
        Proposed: 0,
      };
      row.funding += project.funding_total_usd_m;
      row.projects += 1;
      row[project.status as 'Active'] += 1;
      years.set(project.approval_year, row);
    });
    return Array.from(
      { length: filters.yearEnd - filters.yearStart + 1 },
      (_, index) => {
        const year = filters.yearStart + index;
        return years.get(year) ?? {
          year,
          funding: 0,
          projects: 0,
          Active: 0,
          Closed: 0,
          Approved: 0,
          Proposed: 0,
        };
      },
    );
  }, [filteredProjects, filters.yearEnd, filters.yearStart]);

  const projectLocations = useMemo(
    () => buildProjectMapLocations(filteredProjects),
    [filteredProjects],
  );

  const statusMix = useMemo(
    () =>
      Object.keys(STATUS_COLORS).map((status) => ({
        name: status,
        value: filteredProjects.filter((project) => project.status === status).length,
        color: STATUS_COLORS[status],
      })),
    [filteredProjects],
  );
  return (
    <div className="page">
      <PageHeader
        title="E-mobility portfolio"
        action={
          <div className="scope-badge">
            <Activity size={15} />
            <span>Filtered scope</span>
            <strong>{fmtNumber(filteredProjects.length)} projects</strong>
          </div>
        }
      />

      <div className="kpi-grid">
        <KpiCard
          label="Associated project funding"
          value={fmtMoney(totalFunding, true)}
        />
        <KpiCard
          label="Associated funding of dedicated projects"
          value={fmtMoney(sum(dedicated, (project) => project.funding_total_usd_m), true)}
        />
        <KpiCard
          label="Active delivery"
          value={fmtNumber(active.length)}
        />
        <KpiCard
          label="Country reach"
          value={fmtNumber(recipientNames.size)}
        />
      </div>

      <div className="overview-grid">
        <Panel
          className="timeline-panel"
          title="Project pipeline by approval year"
          subtitle="Associated funding and project count by recorded approval year."
        >
          <div className="timeline-small-multiples">
            <div className="timeline-chart">
              <div className="timeline-chart-label">
                <span>Associated funding</span>
                <small>USD million</small>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeline} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="#e8eef4" vertical={false} />
                  <XAxis dataKey="year" hide />
                  <YAxis
                    tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(1)}B` : `${value}M`}`}
                    tick={{ fontSize: 16 }}
                    axisLine={false}
                    tickLine={false}
                    width={62}
                  />
                  <Tooltip
                    formatter={(value) => [fmtMoney(Number(value), true), 'Associated funding']}
                    labelFormatter={(year) => `Approval year ${year}`}
                  />
                  <Bar dataKey="funding" fill={COLORS.teal} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="timeline-chart">
              <div className="timeline-chart-label">
                <span>Projects</span>
                <small>Count</small>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeline} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="#e8eef4" vertical={false} />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 16 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 16 }}
                    axisLine={false}
                    tickLine={false}
                    width={62}
                  />
                  <Tooltip
                    formatter={(value) => [`${fmtNumber(Number(value))} projects`, 'Projects']}
                    labelFormatter={(year) => `Approval year ${year}`}
                  />
                  <Bar dataKey="projects" fill={COLORS.blue} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Panel>

        <Panel
          title="Delivery status"
          subtitle="Current status of projects in the filtered portfolio."
        >
          <div className="status-stack">
            <div className="status-track">
              {statusMix.map((item) => (
                <i
                  key={item.name}
                  style={{
                    width: `${(item.value / Math.max(filteredProjects.length, 1)) * 100}%`,
                    background: item.color,
                  }}
                  title={`${item.name}: ${item.value}`}
                />
              ))}
            </div>
            <div className="status-list">
              {statusMix.map((item) => (
                <div key={item.name}>
                  <i style={{ background: item.color }} />
                  <span>{item.name}</span>
                  <strong>{item.value}</strong>
                  <small>{fmtPercent(item.value / Math.max(filteredProjects.length, 1))}</small>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      <div className="map-overview-grid map-overview-grid-full">
        <Panel
          className="map-panel"
          title="Geographic footprint"
          subtitle="Reported project activity locations, with economy-level fallbacks where needed."
        >
          <PortfolioMap
            locations={projectLocations}
            onSelectProject={(projectNumber) =>
              setFilters((current) => ({ ...current, mapProject: projectNumber }))
            }
          />
        </Panel>
      </div>

    </div>
  );
}
