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
import { PageHeader, Panel } from '../components/Panel';
import { usePortfolio } from '../context/PortfolioContext';
import {
  ASSISTANCE_COLORS,
  COLORS,
  fmtMoney,
  fmtNumber,
  sum,
} from '../utils';

type Metric = 'funding' | 'projects';

const ASSISTANCE_TYPES = ['Loan', 'Grant', 'TA'] as const;

export function FundingPage() {
  const {
    filteredProjects,
    filteredRecipients,
    filteredModalities,
    filters,
  } = usePortfolio();
  const [metric, setMetric] = useState<Metric>('funding');

  const funding = sum(filteredProjects, (project) => project.funding_total_usd_m);
  const sovereign = filteredProjects.filter((project) => project.project_type === 'Sovereign');
  const nonsovereign = filteredProjects.filter((project) => project.project_type === 'Nonsovereign');

  const assistanceByYear = useMemo(() => {
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
      current.funding += row.funding_usd_m;
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
                metric === 'funding'
                  ? cell?.funding ?? 0
                  : cell?.projectIds.size ?? 0,
              ];
            }),
          ),
        };
      },
    );
  }, [filteredModalities, filters.yearEnd, filters.yearStart, metric]);

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
        metric === 'funding' ? project.funding_total_usd_m : 1;
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
  }, [filteredProjects, filters.yearEnd, filters.yearStart, metric]);

  const recipients = useMemo(() => {
    const grouped = new Map<string, { funding: number; projectIds: Set<string> }>();
    filteredRecipients.forEach((row) => {
      const current = grouped.get(row.allocated_recipient) ?? {
        funding: 0,
        projectIds: new Set<string>(),
      };
      current.funding += row.funding_usd_m;
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
      .sort((a, b) => b[metric] - a[metric]);
  }, [filteredRecipients, metric]);

  const portfolioValue =
    metric === 'funding' ? fmtMoney(funding, true) : fmtNumber(filteredProjects.length);
  const sovereignValue =
    metric === 'funding'
      ? fmtMoney(sum(sovereign, (project) => project.funding_total_usd_m), true)
      : fmtNumber(sovereign.length);
  const nonsovereignValue =
    metric === 'funding'
      ? fmtMoney(sum(nonsovereign, (project) => project.funding_total_usd_m), true)
      : fmtNumber(nonsovereign.length);

  return (
    <div className="page">
      <PageHeader
        title="Funding and geography"
        action={
          <div className="segmented-control" role="group" aria-label="Portfolio metric">
            <button
              className={metric === 'funding' ? 'active' : ''}
              aria-pressed={metric === 'funding'}
              onClick={() => setMetric('funding')}
            >
              Funding
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
          label={metric === 'funding' ? 'Portfolio envelope' : 'Portfolio projects'}
          value={portfolioValue}
        />
        <KpiCard
          label={metric === 'funding' ? 'Sovereign operations' : 'Sovereign projects'}
          value={sovereignValue}
        />
        <KpiCard
          label={metric === 'funding' ? 'Nonsovereign operations' : 'Nonsovereign projects'}
          value={nonsovereignValue}
        />
      </div>

      <div className="two-column-grid funding-charts">
        <Panel
          title="Sovereign and nonsovereign trajectory"
          subtitle={
            metric === 'funding'
              ? 'Associated funding by recorded approval year.'
              : 'Projects by recorded approval year.'
          }
        >
          <div className="chart-xl">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sovereigntyByYear} margin={{ top: 12, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="#e8eef4" vertical={false} />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 16 }} />
                <YAxis tickFormatter={(value) => metric === 'funding' ? `$${value >= 1000 ? `${(value / 1000).toFixed(1)}B` : `${value}M`}` : value} axisLine={false} tickLine={false} tick={{ fontSize: 16 }} width={58} />
                <Tooltip
                  formatter={(value, name) => [
                    metric === 'funding'
                      ? fmtMoney(Number(value), true)
                      : `${fmtNumber(Number(value))} projects`,
                    String(name),
                  ]}
                  labelFormatter={(year) => `Approval year ${year}`}
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
            metric === 'funding'
              ? 'Funding by assistance type and recorded approval year.'
              : 'Project assignments by assistance type; projects may span types.'
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
                    metric === 'funding'
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
                    metric === 'funding'
                      ? fmtMoney(Number(value), true)
                      : `${fmtNumber(Number(value))} project${
                          Number(value) === 1 ? '' : 's'
                        }`,
                    String(name),
                  ]}
                  labelFormatter={(year) => `Approval year ${year}`}
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
        subtitle="Recipients ranked by funding or project count."
      >
        <div className="recipient-bars">
          {recipients.slice(0, 15).map((recipient, index) => {
            const value = recipient[metric];
            const max = recipients[0]?.[metric] || 1;
            return (
              <div key={recipient.name}>
                <b>{index + 1}</b>
                <span>{recipient.name}</span>
                <i><em style={{ width: `${(value / max) * 100}%` }} /></i>
                <strong>{metric === 'funding' ? fmtMoney(value, true) : fmtNumber(value)}</strong>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
