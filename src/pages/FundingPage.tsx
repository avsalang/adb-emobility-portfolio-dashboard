import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { KpiCard } from '../components/KpiCard';
import {
  DataTableDrawer,
  DataViewButton,
  type DataView,
} from '../components/DataTableDrawer';
import { PageHeader, Panel } from '../components/Panel';
import { usePortfolio } from '../context/PortfolioContext';
import {
  ASSISTANCE_COLORS,
  COLORS,
  dedicatedEmobilityFunding,
  fmtMoney,
  fmtNumber,
  sum,
} from '../utils';

type Metric = 'associated' | 'identified' | 'projects';

const ASSISTANCE_TYPES = ['Loan', 'Grant', 'TA'] as const;

export function FundingPage() {
  const {
    filteredProjects,
    filteredRecipients,
    filteredModalities,
    filters,
  } = usePortfolio();
  const [metric, setMetric] = useState<Metric>('associated');
  const [dataView, setDataView] = useState<DataView | null>(null);

  const fundingForProject = (project: (typeof filteredProjects)[number]) =>
    metric === 'identified'
      ? dedicatedEmobilityFunding(project) ?? 0
      : project.funding_total_usd_m;
  const isFundingMetric = metric !== 'projects';
  const fundingName =
    metric === 'identified'
      ? 'Identified e-mobility funding'
      : 'Associated funding';
  const fundingPrefix = metric === 'identified' ? 'At least ' : '';
  const projectById = useMemo(
    () =>
      new Map(
        filteredProjects.map((project) => [project.project_number, project]),
      ),
    [filteredProjects],
  );

  const sovereign = filteredProjects.filter((project) => project.project_type === 'Sovereign');
  const nonsovereign = filteredProjects.filter((project) => project.project_type === 'Nonsovereign');

  const assistanceByYear = useMemo<
    Array<{ year: number; Loan: number; Grant: number; TA: number }>
  >(() => {
    const grouped = new Map<
      number,
      Map<string, { funding: number; projectIds: Set<string> }>
    >();
    filteredModalities.forEach((row) => {
      const year = grouped.get(row.approval_year) ?? new Map();
      const current = year.get(row.generalized_assistance_type) ?? {
        funding: 0,
        projectIds: new Set<string>(),
      };
      const project = projectById.get(row.project_number);
      const ratio =
        metric === 'identified' && project
          ? (dedicatedEmobilityFunding(project) ?? 0) /
            Math.max(project.funding_total_usd_m, 1e-9)
          : 1;
      current.funding += row.funding_usd_m * ratio;
      current.projectIds.add(row.project_number);
      year.set(row.generalized_assistance_type, current);
      grouped.set(row.approval_year, year);
    });
    return Array.from(
      { length: filters.yearEnd - filters.yearStart + 1 },
      (_, index) => {
        const year = filters.yearStart + index;
        return {
          year,
          ...Object.fromEntries(
            ASSISTANCE_TYPES.map((name) => {
              const cell = grouped.get(year)?.get(name);
              return [
                name,
                isFundingMetric
                  ? cell?.funding ?? 0
                  : cell?.projectIds.size ?? 0,
              ];
            }),
          ),
        } as { year: number; Loan: number; Grant: number; TA: number };
      },
    );
  }, [filteredModalities, filters.yearEnd, filters.yearStart, isFundingMetric, metric, projectById]);

  const sovereigntyByYear = useMemo(() => {
    const grouped = new Map<
      number,
      { year: number; Sovereign: number; Nonsovereign: number; projects: number }
    >();
    filteredProjects.forEach((project) => {
      const current = grouped.get(project.approval_year) ?? {
        year: project.approval_year,
        Sovereign: 0,
        Nonsovereign: 0,
        projects: 0,
      };
      current[project.project_type as 'Sovereign'] +=
        isFundingMetric ? fundingForProject(project) : 1;
      current.projects += 1;
      grouped.set(project.approval_year, current);
    });
    return Array.from(
      { length: filters.yearEnd - filters.yearStart + 1 },
      (_, index) => {
        const year = filters.yearStart + index;
        return grouped.get(year) ?? {
          year,
          Sovereign: 0,
          Nonsovereign: 0,
          projects: 0,
        };
      },
    );
  }, [filteredProjects, filters.yearEnd, filters.yearStart, isFundingMetric, metric]);

  const recipients = useMemo(() => {
    const rankingMetric = metric === 'projects' ? 'projects' : 'funding';
    const grouped = new Map<string, { funding: number; projectIds: Set<string> }>();
    filteredRecipients.forEach((row) => {
      const current = grouped.get(row.allocated_recipient) ?? {
        funding: 0,
        projectIds: new Set<string>(),
      };
      const project = projectById.get(row.project_number);
      const ratio =
        metric === 'identified' && project
          ? (dedicatedEmobilityFunding(project) ?? 0) /
            Math.max(project.funding_total_usd_m, 1e-9)
          : 1;
      current.funding += row.funding_usd_m * ratio;
      current.projectIds.add(row.project_number);
      grouped.set(row.allocated_recipient, current);
    });
    return [...grouped.entries()]
      .map(([name, value]) => ({
        name,
        funding: value.funding,
        projects: value.projectIds.size,
        projectIds: value.projectIds,
      }))
      .sort((a, b) => b[rankingMetric] - a[rankingMetric]);
  }, [filteredRecipients, metric, projectById]);

  const portfolioValue =
    isFundingMetric
      ? `${fundingPrefix}${fmtMoney(sum(filteredProjects, fundingForProject), true)}`
      : fmtNumber(filteredProjects.length);
  const sovereignValue =
    isFundingMetric
      ? `${fundingPrefix}${fmtMoney(sum(sovereign, fundingForProject), true)}`
      : fmtNumber(sovereign.length);
  const nonsovereignValue =
    isFundingMetric
      ? `${fundingPrefix}${fmtMoney(sum(nonsovereign, fundingForProject), true)}`
      : fmtNumber(nonsovereign.length);

  return (
    <div className="page">
      <PageHeader
        title="Funding and geography"
        action={
          <div className="segmented-control" role="group" aria-label="Portfolio metric">
            <button
              className={metric === 'associated' ? 'active' : ''}
              aria-pressed={metric === 'associated'}
              onClick={() => setMetric('associated')}
            >
              Associated
            </button>
            <button
              className={metric === 'identified' ? 'active' : ''}
              aria-pressed={metric === 'identified'}
              onClick={() => setMetric('identified')}
            >
              Identified e-mobility
            </button>
            <button
              className={metric === 'projects' ? 'active' : ''}
              aria-pressed={metric === 'projects'}
              onClick={() => setMetric('projects')}
            >
              Projects
            </button>
          </div>
        }
      />

      <div className="kpi-grid kpi-grid-three">
        <KpiCard
          label={isFundingMetric ? fundingName : 'Portfolio projects'}
          value={portfolioValue}
        />
        <KpiCard
          label={isFundingMetric ? `Sovereign ${fundingName.toLowerCase()}` : 'Sovereign projects'}
          value={sovereignValue}
        />
        <KpiCard
          label={isFundingMetric ? `Nonsovereign ${fundingName.toLowerCase()}` : 'Nonsovereign projects'}
          value={nonsovereignValue}
        />
      </div>

      <div className="two-column-grid funding-charts">
        <Panel
          title="Sovereign and nonsovereign trajectory"
          subtitle={
            isFundingMetric
              ? `${fundingName} by approval or expected year.`
              : 'Projects by approval or expected year.'
          }
          action={
            <DataViewButton
              onClick={() =>
                setDataView({
                  title: 'Sovereign and nonsovereign trajectory',
                  filename: 'ato_sovereign_trajectory.csv',
                  columns: [
                    { key: 'year', label: 'Approval or expected year' },
                    { key: 'sovereign', label: 'Sovereign', align: 'right' },
                    { key: 'nonsovereign', label: 'Nonsovereign', align: 'right' },
                  ],
                  rows: sovereigntyByYear.map((row) => ({
                    year: row.year,
                    sovereign: Number(row.Sovereign.toFixed(3)),
                    nonsovereign: Number(row.Nonsovereign.toFixed(3)),
                  })),
                })
              }
            />
          }
        >
          <div className="chart-xl">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sovereigntyByYear} margin={{ top: 12, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="#e8eef4" vertical={false} />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 16 }} />
                <YAxis tickFormatter={(value) => isFundingMetric ? `$${value >= 1000 ? `${(value / 1000).toFixed(1)}B` : `${value}M`}` : value} axisLine={false} tickLine={false} tick={{ fontSize: 16 }} width={58} />
                <Tooltip
                  formatter={(value, name) => [
                    isFundingMetric
                      ? fmtMoney(Number(value), true)
                      : `${fmtNumber(Number(value))} projects`,
                    String(name),
                  ]}
                  labelFormatter={(year) => `Approval or expected year ${year}`}
                />
                <Legend iconType="circle" iconSize={8} />
                <Bar
                  dataKey="Sovereign"
                  barSize={metric === 'projects' ? 7 : undefined}
                  fill={COLORS.blue}
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="Nonsovereign"
                  barSize={metric === 'projects' ? 7 : undefined}
                  fill={COLORS.teal}
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel
          title="Assistance mix over time"
          subtitle={
            isFundingMetric
              ? `${fundingName} by assistance type and year.`
              : 'Project assignments by assistance type; projects may span types.'
          }
          action={
            <DataViewButton
              onClick={() =>
                setDataView({
                  title: 'Assistance mix over time',
                  filename: 'ato_assistance_mix_by_year.csv',
                  columns: [
                    { key: 'year', label: 'Approval or expected year' },
                    { key: 'loan', label: 'Loan', align: 'right' },
                    { key: 'grant', label: 'Grant', align: 'right' },
                    { key: 'ta', label: 'Technical assistance', align: 'right' },
                  ],
                  rows: assistanceByYear.map((row) => ({
                    year: row.year,
                    loan: Number(Number(row.Loan ?? 0).toFixed(3)),
                    grant: Number(Number(row.Grant ?? 0).toFixed(3)),
                    ta: Number(Number(row.TA ?? 0).toFixed(3)),
                  })),
                })
              }
            />
          }
        >
          <div className="chart-xl">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={assistanceByYear}
                margin={{ top: 12, right: 8, bottom: 0, left: 0 }}
              >
                <CartesianGrid stroke="#e8eef4" vertical={false} />
                <XAxis
                  dataKey="year"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 16 }}
                />
                <YAxis
                  tickFormatter={(value) =>
                    isFundingMetric
                      ? `${
                          value >= 1000
                            ? `$${(value / 1000).toFixed(1)}B`
                            : `$${value}M`
                        }`
                      : value
                  }
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 16 }}
                  width={58}
                />
                <Tooltip
                  formatter={(value, name) => [
                    isFundingMetric
                      ? fmtMoney(Number(value), true)
                      : `${fmtNumber(Number(value))} project${
                          Number(value) === 1 ? '' : 's'
                        }`,
                    String(name),
                  ]}
                  labelFormatter={(year) => `Approval or expected year ${year}`}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) =>
                    value === 'TA' ? 'Technical assistance' : value
                  }
                />
                {ASSISTANCE_TYPES.map((name) => (
                  <Bar
                    key={name}
                    dataKey={name}
                    stackId="assistance"
                    fill={ASSISTANCE_COLORS[name]}
                    maxBarSize={28}
                    radius={[0, 0, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel
        title="Recipient ranking"
        subtitle={`Recipients ranked by ${isFundingMetric ? fundingName.toLowerCase() : 'project count'}.`}
        action={
          <DataViewButton
            label={`View all ${recipients.length}`}
            onClick={() =>
              setDataView({
                title: 'Recipient ranking',
                filename: 'ato_recipient_ranking.csv',
                columns: [
                  { key: 'rank', label: 'Rank', align: 'right' },
                  { key: 'recipient', label: 'Recipient' },
                  { key: 'value', label: isFundingMetric ? `${fundingName} (USD million)` : 'Projects', align: 'right' },
                  { key: 'projects', label: 'Projects', align: 'right' },
                ],
                rows: recipients.map((recipient, index) => ({
                  rank: index + 1,
                  recipient: recipient.name,
                  value: Number(recipient[metric === 'projects' ? 'projects' : 'funding'].toFixed(3)),
                  projects: recipient.projects,
                })),
              })
            }
          />
        }
      >
        <div className="recipient-bars">
          {recipients.slice(0, 15).map((recipient, index) => {
            const rankingMetric = metric === 'projects' ? 'projects' : 'funding';
            const value = recipient[rankingMetric];
            const max = recipients[0]?.[rankingMetric] || 1;
            return (
              <div key={recipient.name}>
                <b>{index + 1}</b>
                <span>{recipient.name}</span>
                <i><em style={{ width: `${(value / max) * 100}%` }} /></i>
                <strong>{isFundingMetric ? fmtMoney(value, true) : fmtNumber(value)}</strong>
              </div>
            );
          })}
        </div>
      </Panel>

      {dataView && (
        <DataTableDrawer view={dataView} onClose={() => setDataView(null)} />
      )}
    </div>
  );
}
