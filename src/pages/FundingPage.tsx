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
import {
  DataTableDrawer,
  DataViewButton,
  type DataView,
} from '../components/DataTableDrawer';
import { KpiCard } from '../components/KpiCard';
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

type PrimaryMetric = 'associated' | 'projects';
type AnalysisMetric = PrimaryMetric | 'identified';

interface SovereigntyYearRow {
  year: number;
  Sovereign: number;
  Nonsovereign: number;
  projects: number;
}

interface AssistanceYearRow {
  year: number;
  Loan: number;
  Grant: number;
  TA: number;
}

interface RecipientRankRow {
  name: string;
  funding: number;
  projects: number;
  projectIds: Set<string>;
}

interface FundingSeries {
  sovereigntyByYear: SovereigntyYearRow[];
  assistanceByYear: AssistanceYearRow[];
  recipients: RecipientRankRow[];
}

const ASSISTANCE_TYPES = ['Loan', 'Grant', 'TA'] as const;

function FundingCharts({
  metric,
  series,
  setDataView,
  filePrefix,
}: {
  metric: AnalysisMetric;
  series: FundingSeries;
  setDataView: (view: DataView) => void;
  filePrefix: string;
}) {
  const isFundingMetric = metric !== 'projects';
  const fundingName =
    metric === 'identified'
      ? 'Identified e-mobility funding'
      : 'Associated funding';
  const analysisName = metric === 'projects' ? 'Projects' : fundingName;
  const recipientValueLabel = isFundingMetric
    ? `${fundingName} (USD million)`
    : 'Projects';

  return (
    <>
      <div className="two-column-grid funding-charts">
        <Panel
          title="Sovereign and nonsovereign trajectory"
          subtitle={
            isFundingMetric
              ? `${fundingName} by approval or expected year. Hover over the bars for yearly values.`
              : 'Projects by approval or expected year. Hover over the bars for yearly counts.'
          }
          action={
            <DataViewButton
              onClick={() =>
                setDataView({
                  title: `${analysisName} by project type and year`,
                  filename: `${filePrefix}_sovereign_trajectory.csv`,
                  columns: [
                    { key: 'year', label: 'Approval or expected year' },
                    { key: 'sovereign', label: 'Sovereign', align: 'right' },
                    {
                      key: 'nonsovereign',
                      label: 'Nonsovereign',
                      align: 'right',
                    },
                  ],
                  rows: series.sovereigntyByYear.map((row) => ({
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
              <BarChart
                data={series.sovereigntyByYear}
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
                      ? `$${
                          value >= 1000
                            ? `${(value / 1000).toFixed(1)}B`
                            : `${value}M`
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
                      : `${fmtNumber(Number(value))} projects`,
                    String(name),
                  ]}
                  labelFormatter={(year) =>
                    `Approval or expected year ${year}`
                  }
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
            metric === 'identified'
              ? 'Identified funding by assistance type and year. Amounts follow each project\'s recorded assistance shares. Hover over the bars for details.'
              : isFundingMetric
                ? 'Associated funding by assistance type and year. Hover over the bars for details.'
                : 'Project assignments by assistance type; projects may span types. Hover over the bars for details.'
          }
          action={
            <DataViewButton
              onClick={() =>
                setDataView({
                  title: `${analysisName} assistance mix over time`,
                  filename: `${filePrefix}_assistance_mix_by_year.csv`,
                  columns: [
                    { key: 'year', label: 'Approval or expected year' },
                    { key: 'loan', label: 'Loan', align: 'right' },
                    { key: 'grant', label: 'Grant', align: 'right' },
                    {
                      key: 'ta',
                      label: 'Technical assistance',
                      align: 'right',
                    },
                  ],
                  rows: series.assistanceByYear.map((row) => ({
                    year: row.year,
                    loan: Number(row.Loan.toFixed(3)),
                    grant: Number(row.Grant.toFixed(3)),
                    ta: Number(row.TA.toFixed(3)),
                  })),
                })
              }
            />
          }
        >
          <div className="chart-xl">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={series.assistanceByYear}
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
                      ? `$${
                          value >= 1000
                            ? `${(value / 1000).toFixed(1)}B`
                            : `${value}M`
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
                  labelFormatter={(year) =>
                    `Approval or expected year ${year}`
                  }
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
        subtitle={
          metric === 'identified'
            ? 'Recipients ranked by identified e-mobility funding. Amounts follow each project\'s recorded recipient funding shares.'
            : `Recipients ranked by ${
                isFundingMetric ? fundingName.toLowerCase() : 'project count'
              }.`
        }
        action={
          <DataViewButton
            label={`View all ${series.recipients.length}`}
            onClick={() =>
              setDataView({
                title: `${analysisName} recipient ranking`,
                filename: `${filePrefix}_recipient_ranking.csv`,
                columns: [
                  { key: 'rank', label: 'Rank', align: 'right' },
                  { key: 'recipient', label: 'Recipient' },
                  {
                    key: 'value',
                    label: recipientValueLabel,
                    align: 'right',
                  },
                  { key: 'projects', label: 'Projects', align: 'right' },
                ],
                rows: series.recipients.map((recipient, index) => ({
                  rank: index + 1,
                  recipient: recipient.name,
                  value: Number(
                    recipient[
                      metric === 'projects' ? 'projects' : 'funding'
                    ].toFixed(3),
                  ),
                  projects: recipient.projects,
                })),
              })
            }
          />
        }
      >
        <div className="recipient-bars">
          {series.recipients.slice(0, 15).map((recipient, index) => {
            const rankingMetric =
              metric === 'projects' ? 'projects' : 'funding';
            const value = recipient[rankingMetric];
            const max = series.recipients[0]?.[rankingMetric] || 1;
            return (
              <div key={recipient.name}>
                <b>{index + 1}</b>
                <span>{recipient.name}</span>
                <i>
                  <em style={{ width: `${(value / max) * 100}%` }} />
                </i>
                <strong>
                  {isFundingMetric ? fmtMoney(value, true) : fmtNumber(value)}
                </strong>
              </div>
            );
          })}
        </div>
      </Panel>
    </>
  );
}

export function FundingPage() {
  const {
    filteredProjects,
    filteredRecipients,
    filteredModalities,
    filters,
  } = usePortfolio();
  const [metric, setMetric] = useState<PrimaryMetric>('associated');
  const [dataView, setDataView] = useState<DataView | null>(null);

  const projectById = useMemo(
    () =>
      new Map(
        filteredProjects.map((project) => [project.project_number, project]),
      ),
    [filteredProjects],
  );

  const buildSeries = (analysisMetric: AnalysisMetric): FundingSeries => {
    const isFundingMetric = analysisMetric !== 'projects';
    const fundingForProject = (
      project: (typeof filteredProjects)[number],
    ) =>
      analysisMetric === 'identified'
        ? dedicatedEmobilityFunding(project) ?? 0
        : project.funding_total_usd_m;

    const assistanceGroups = new Map<
      number,
      Map<string, { funding: number; projectIds: Set<string> }>
    >();
    filteredModalities.forEach((row) => {
      const year = assistanceGroups.get(row.approval_year) ?? new Map();
      const current = year.get(row.generalized_assistance_type) ?? {
        funding: 0,
        projectIds: new Set<string>(),
      };
      const project = projectById.get(row.project_number);
      const ratio =
        analysisMetric === 'identified' && project
          ? (dedicatedEmobilityFunding(project) ?? 0) /
            Math.max(project.funding_total_usd_m, 1e-9)
          : 1;
      current.funding += row.funding_usd_m * ratio;
      current.projectIds.add(row.project_number);
      year.set(row.generalized_assistance_type, current);
      assistanceGroups.set(row.approval_year, year);
    });

    const assistanceByYear = Array.from(
      { length: filters.yearEnd - filters.yearStart + 1 },
      (_, index) => {
        const year = filters.yearStart + index;
        return {
          year,
          ...Object.fromEntries(
            ASSISTANCE_TYPES.map((name) => {
              const cell = assistanceGroups.get(year)?.get(name);
              return [
                name,
                isFundingMetric
                  ? cell?.funding ?? 0
                  : cell?.projectIds.size ?? 0,
              ];
            }),
          ),
        } as AssistanceYearRow;
      },
    );

    const sovereigntyGroups = new Map<number, SovereigntyYearRow>();
    filteredProjects.forEach((project) => {
      const current = sovereigntyGroups.get(project.approval_year) ?? {
        year: project.approval_year,
        Sovereign: 0,
        Nonsovereign: 0,
        projects: 0,
      };
      const projectType =
        project.project_type === 'Nonsovereign'
          ? 'Nonsovereign'
          : 'Sovereign';
      current[projectType] += isFundingMetric ? fundingForProject(project) : 1;
      current.projects += 1;
      sovereigntyGroups.set(project.approval_year, current);
    });

    const sovereigntyByYear = Array.from(
      { length: filters.yearEnd - filters.yearStart + 1 },
      (_, index) => {
        const year = filters.yearStart + index;
        return (
          sovereigntyGroups.get(year) ?? {
            year,
            Sovereign: 0,
            Nonsovereign: 0,
            projects: 0,
          }
        );
      },
    );

    const recipientGroups = new Map<
      string,
      { funding: number; projectIds: Set<string> }
    >();
    filteredRecipients.forEach((row) => {
      const current = recipientGroups.get(row.allocated_recipient) ?? {
        funding: 0,
        projectIds: new Set<string>(),
      };
      const project = projectById.get(row.project_number);
      const ratio =
        analysisMetric === 'identified' && project
          ? (dedicatedEmobilityFunding(project) ?? 0) /
            Math.max(project.funding_total_usd_m, 1e-9)
          : 1;
      current.funding += row.funding_usd_m * ratio;
      current.projectIds.add(row.project_number);
      recipientGroups.set(row.allocated_recipient, current);
    });

    const rankingMetric =
      analysisMetric === 'projects' ? 'projects' : 'funding';
    const recipients = [...recipientGroups.entries()]
      .map(([name, value]) => ({
        name,
        funding: value.funding,
        projects: value.projectIds.size,
        projectIds: value.projectIds,
      }))
      .sort((a, b) => b[rankingMetric] - a[rankingMetric]);

    return { sovereigntyByYear, assistanceByYear, recipients };
  };

  const mainSeries = buildSeries(metric);
  const identifiedSeries = buildSeries('identified');
  const sovereign = filteredProjects.filter(
    (project) => project.project_type === 'Sovereign',
  );
  const nonsovereign = filteredProjects.filter(
    (project) => project.project_type === 'Nonsovereign',
  );
  const identifiedForProject = (
    project: (typeof filteredProjects)[number],
  ) => dedicatedEmobilityFunding(project) ?? 0;
  const mainIsFunding = metric === 'associated';
  const mainPortfolioValue = mainIsFunding
    ? fmtMoney(sum(filteredProjects, (project) => project.funding_total_usd_m), true)
    : fmtNumber(filteredProjects.length);
  const mainSovereignValue = mainIsFunding
    ? fmtMoney(sum(sovereign, (project) => project.funding_total_usd_m), true)
    : fmtNumber(sovereign.length);
  const mainNonsovereignValue = mainIsFunding
    ? fmtMoney(
        sum(nonsovereign, (project) => project.funding_total_usd_m),
        true,
      )
    : fmtNumber(nonsovereign.length);
  const identifiedPortfolioValue = sum(
    filteredProjects,
    identifiedForProject,
  );
  const identifiedSovereignValue = sum(sovereign, identifiedForProject);
  const identifiedNonsovereignValue = sum(nonsovereign, identifiedForProject);

  return (
    <div className="page">
      <PageHeader
        title="Funding and geography"
        description="This page shows associated project funding, project coverage and identified e-mobility funding over time, by recipient, project type and form of assistance."
        action={
          <div className="segmented-control" role="group" aria-label="Portfolio metric">
            <button
              className={metric === 'associated' ? 'active' : ''}
              aria-pressed={metric === 'associated'}
              onClick={() => setMetric('associated')}
            >
              Associated funding
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

      <section className="funding-analysis-section">
        <div className="funding-section-heading">
          <h3>
            {metric === 'associated'
              ? 'Associated project funding'
              : 'Project coverage'}
          </h3>
          <p>
            {metric === 'associated'
              ? 'Full reported value of projects in the selected portfolio.'
              : 'Number of projects in the selected portfolio.'}
          </p>
        </div>

        <div className="kpi-grid kpi-grid-three">
          <KpiCard
            label={mainIsFunding ? 'Associated project funding' : 'Portfolio projects'}
            value={mainPortfolioValue}
          />
          <KpiCard
            label={mainIsFunding ? 'Sovereign associated funding' : 'Sovereign projects'}
            value={mainSovereignValue}
          />
          <KpiCard
            label={mainIsFunding ? 'Nonsovereign associated funding' : 'Nonsovereign projects'}
            value={mainNonsovereignValue}
          />
        </div>

        <FundingCharts
          metric={metric}
          series={mainSeries}
          setDataView={setDataView}
          filePrefix={`ato_${metric}`}
        />
      </section>

      <section className="funding-analysis-section identified-funding-section">
        <div className="funding-section-heading">
          <h3>Identified e-mobility funding</h3>
          <p>
            Amounts specifically attributable to e-mobility from available
            project information. The total is a minimum because unquantified
            components are excluded.
          </p>
        </div>

        <div className="kpi-grid kpi-grid-three">
          <KpiCard
            label="Identified e-mobility funding"
            value={`At least ${fmtMoney(identifiedPortfolioValue, true)}`}
          />
          <KpiCard
            label="Sovereign identified funding"
            value={`At least ${fmtMoney(identifiedSovereignValue, true)}`}
          />
          <KpiCard
            label="Nonsovereign identified funding"
            value={`At least ${fmtMoney(identifiedNonsovereignValue, true)}`}
          />
        </div>

        <FundingCharts
          metric="identified"
          series={identifiedSeries}
          setDataView={setDataView}
          filePrefix="ato_identified_emobility"
        />
      </section>

      {dataView && (
        <DataTableDrawer view={dataView} onClose={() => setDataView(null)} />
      )}
    </div>
  );
}
