import { Activity, Info } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  DataTableDrawer,
  DataViewButton,
  type DataView,
} from '../components/DataTableDrawer';
import { PageHeader, Panel } from '../components/Panel';
import { PortfolioMap } from '../components/PortfolioMap';
import { usePortfolio } from '../context/PortfolioContext';
import {
  buildProjectMapLocations,
  LOCATION_PRECISION_LABELS,
} from '../map/projectLocations';
import {
  COLORS,
  STATUS_COLORS,
  dedicatedEmobilityFunding,
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
  const [dataView, setDataView] = useState<DataView | null>(null);

  const totalFunding = sum(filteredProjects, (project) => project.funding_total_usd_m);
  const identifiedFunding = sum(
    filteredProjects,
    (project) => dedicatedEmobilityFunding(project) ?? 0,
  );
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
        description="This page provides a high-level view of the selected ADB e-mobility portfolio, including project funding, approval details, delivery status and geographic coverage. Use the filters to examine specific periods, recipients, sectors, project types and e-mobility classifications."
        action={
          <div className="scope-badge">
            <Activity size={15} />
            <span>Filtered scope</span>
            <strong>{fmtNumber(filteredProjects.length)} projects</strong>
          </div>
        }
      />

      <div className="kpi-grid overview-kpi-grid">
        <article className="kpi-card overview-funding-card">
          <div>
            <span className="kpi-label">Associated project funding</span>
            <strong>{fmtMoney(totalFunding, true)}</strong>
          </div>
          <div className="overview-identified-funding">
            <span>Identified e-mobility funding</span>
            <strong>At least {fmtMoney(identifiedFunding, true)}</strong>
          </div>
          <p>
            Associated funding is the full reported amount of projects in the
            portfolio. Identified e-mobility funding includes only amounts that
            can be directly attributed to e-mobility. Where a project includes
            an e-mobility component but gives no separate amount, that component
            is not included in the identified total; identified funding is
            therefore a minimum.
          </p>
        </article>
      </div>

      <div className="overview-grid">
        <Panel
          className="timeline-panel"
          title="Project pipeline by approval or expected year"
          subtitle="Associated funding and project count by recorded year."
          action={
            <DataViewButton
              onClick={() =>
                setDataView({
                  title: 'Project pipeline by year',
                  filename: 'ato_project_pipeline_by_year.csv',
                  columns: [
                    { key: 'year', label: 'Approval or expected year' },
                    { key: 'funding', label: 'Associated funding (USD million)', align: 'right' },
                    { key: 'projects', label: 'Projects', align: 'right' },
                    { key: 'active', label: 'Active', align: 'right' },
                    { key: 'approved', label: 'Approved', align: 'right' },
                    { key: 'proposed', label: 'Proposed', align: 'right' },
                    { key: 'closed', label: 'Closed', align: 'right' },
                  ],
                  rows: timeline.map((row) => ({
                    year: row.year,
                    funding: Number(row.funding.toFixed(3)),
                    projects: row.projects,
                    active: row.Active,
                    approved: row.Approved,
                    proposed: row.Proposed,
                    closed: row.Closed,
                  })),
                })
              }
            />
          }
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
                    labelFormatter={(year) => `Approval or expected year ${year}`}
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
                    labelFormatter={(year) => `Approval or expected year ${year}`}
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
            <div className="status-reach">
              <span>Recipient economies</span>
              <strong>{fmtNumber(recipientNames.size)}</strong>
            </div>
          </div>
        </Panel>
      </div>

      <div className="map-overview-grid map-overview-grid-full">
        <Panel
          className="map-panel"
          title="Geographic footprint"
          subtitle="Markers show reported project activity locations. Country-level locations are used when project documents do not identify a specific city, province, site or corridor. Regional-level projects are reflected at the country level, where applicable."
          action={
            <div className="panel-action-group">
              <span
                className="panel-info"
                tabIndex={0}
                title={`${new Set(projectLocations.map((location) => location.projectNumber)).size} of ${filteredProjects.length} projects mapped; ${projectLocations.filter((location) => location.precision === 'country').length} locations use economy-level coordinates.`}
                aria-label={`${new Set(projectLocations.map((location) => location.projectNumber)).size} of ${filteredProjects.length} projects mapped; ${projectLocations.filter((location) => location.precision === 'country').length} locations use economy-level coordinates.`}
              >
                <Info size={16} />
              </span>
              <DataViewButton
                label="View locations"
                onClick={() =>
                  setDataView({
                    title: 'Mapped project locations',
                    filename: 'ato_mapped_project_locations.csv',
                    columns: [
                      { key: 'project_number', label: 'Project number' },
                      { key: 'project_title', label: 'Project title' },
                      { key: 'location', label: 'Mapped location' },
                      { key: 'location_type', label: 'Location type' },
                      { key: 'recipient', label: 'Recipient' },
                      { key: 'year', label: 'Approval or expected year', align: 'right' },
                      { key: 'funding', label: 'Associated funding (USD million)', align: 'right' },
                      { key: 'identified_funding', label: 'Identified e-mobility funding (USD million)', align: 'right' },
                    ],
                    rows: projectLocations.map((location) => ({
                      project_number: location.projectNumber,
                      project_title: location.projectTitle,
                      location: location.locationName,
                      location_type: LOCATION_PRECISION_LABELS[location.precision],
                      recipient: location.recipient,
                      year: location.approvalYear,
                      funding: Number(location.funding.toFixed(3)),
                      identified_funding:
                        location.identifiedFunding === null
                          ? ''
                          : Number(location.identifiedFunding.toFixed(3)),
                    })),
                  })
                }
              />
            </div>
          }
        >
          <PortfolioMap
            locations={projectLocations}
            onSelectProject={(projectNumber) =>
              setFilters((current) => ({ ...current, mapProject: projectNumber }))
            }
          />
        </Panel>
      </div>

      {dataView && (
        <DataTableDrawer view={dataView} onClose={() => setDataView(null)} />
      )}

    </div>
  );
}
