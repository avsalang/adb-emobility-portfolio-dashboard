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
import { PortfolioMap, type MapCountry } from '../components/PortfolioMap';
import { usePortfolio } from '../context/PortfolioContext';
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

  const mapCountries = useMemo<MapCountry[]>(() => {
    const grouped = new Map<string, { funding: number; projects: Set<string> }>();
    filteredRecipients
      .filter((row) => row.recipient_type === 'Country')
      .forEach((row) => {
        const current = grouped.get(row.allocated_recipient) ?? {
          funding: 0,
          projects: new Set<string>(),
        };
        current.funding += row.funding_usd_m;
        current.projects.add(row.project_number);
        grouped.set(row.allocated_recipient, current);
      });
    return [...grouped.entries()]
      .map(([name, value]) => ({
        name,
        funding: value.funding,
        projects: value.projects.size,
      }))
      .sort((a, b) => b.funding - a.funding);
  }, [filteredRecipients]);

  const statusMix = useMemo(
    () =>
      Object.keys(STATUS_COLORS).map((status) => ({
        name: status,
        value: filteredProjects.filter((project) => project.status === status).length,
        color: STATUS_COLORS[status],
      })),
    [filteredProjects],
  );
  const regionalAllocation = useMemo(() => {
    const rows = filteredRecipients.filter(
      (row) => row.recipient_type !== 'Country',
    );
    return {
      funding: sum(rows, (row) => row.funding_usd_m),
      projects: new Set(rows.map((row) => row.project_number)).size,
    };
  }, [filteredRecipients]);

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
                <button
                  key={item.name}
                  onClick={() =>
                    setFilters((current) => ({ ...current, status: item.name }))
                  }
                >
                  <i style={{ background: item.color }} />
                  <span>{item.name}</span>
                  <strong>{item.value}</strong>
                  <small>{fmtPercent(item.value / Math.max(filteredProjects.length, 1))}</small>
                </button>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      <div className="map-overview-grid">
        <Panel
          className="map-panel"
          title="Geographic footprint"
          subtitle="Associated funding by recipient economy."
        >
          <PortfolioMap
            countries={mapCountries}
            onSelect={(recipient) =>
              setFilters((current) => ({ ...current, recipient }))
            }
          />
        </Panel>

        <Panel
          title="Leading country allocations"
          subtitle="Largest country allocations in the current selection."
        >
          <div className="ranking-list">
            {mapCountries.slice(0, 8).map((country, index) => (
              <button
                key={country.name}
                onClick={() =>
                  setFilters((current) => ({ ...current, recipient: country.name }))
                }
              >
                <b>{String(index + 1).padStart(2, '0')}</b>
                <div>
                  <strong>{country.name}</strong>
                  <span>{country.projects} project{country.projects === 1 ? '' : 's'}</span>
                </div>
                <em>{fmtMoney(country.funding, true)}</em>
                <i>
                  <span style={{ width: `${(country.funding / Math.max(mapCountries[0]?.funding ?? 1, 1)) * 100}%` }} />
                </i>
              </button>
            ))}
          </div>
          {regionalAllocation.projects > 0 && (
            <div className="regional-allocation-summary">
              <div>
                <span>Regional allocations</span>
                <small>
                  {regionalAllocation.projects} project
                  {regionalAllocation.projects === 1 ? '' : 's'}
                </small>
              </div>
              <strong>{fmtMoney(regionalAllocation.funding, true)}</strong>
            </div>
          )}
        </Panel>
      </div>

    </div>
  );
}
