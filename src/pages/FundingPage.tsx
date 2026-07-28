import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ComposedChart,
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
  fmtPercent,
  sum,
} from '../utils';

type Metric = 'funding' | 'projects';

export function FundingPage() {
  const {
    filteredProjects,
    filteredRecipients,
    filteredModalities,
    setFilters,
  } = usePortfolio();
  const [metric, setMetric] = useState<Metric>('funding');

  const funding = sum(filteredProjects, (project) => project.funding_total_usd_m);
  const sovereign = filteredProjects.filter((project) => project.project_type === 'Sovereign');
  const nonsovereign = filteredProjects.filter((project) => project.project_type === 'Nonsovereign');

  const modalityByYear = useMemo(() => {
    const grouped = new Map<number, Record<string, number>>();
    filteredModalities.forEach((row) => {
      const current = grouped.get(row.approval_year) ?? {
        year: row.approval_year,
        Loan: 0,
        Grant: 0,
        TA: 0,
      };
      current[row.generalized_assistance_type] =
        (current[row.generalized_assistance_type] ?? 0) +
        (metric === 'funding' ? row.funding_usd_m : 1);
      grouped.set(row.approval_year, current);
    });
    return [...grouped.values()].sort((a, b) => Number(a.year) - Number(b.year));
  }, [filteredModalities, metric]);

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
    return [...grouped.values()].sort((a, b) => a.year - b.year);
  }, [filteredProjects, metric]);

  const recipients = useMemo(() => {
    const grouped = new Map<string, { funding: number; projects: Set<string> }>();
    filteredRecipients.forEach((row) => {
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
      .sort((a, b) => b[metric] - a[metric]);
  }, [filteredRecipients, metric]);

  const topFiveShare =
    sum(recipients.slice(0, 5), (row) => row.funding) /
    Math.max(sum(recipients, (row) => row.funding), 1);

  return (
    <div className="page">
      <PageHeader
        title="Funding and geography"
        action={
          <div className="segmented-control">
            <button className={metric === 'funding' ? 'active' : ''} onClick={() => setMetric('funding')}>Funding</button>
            <button className={metric === 'projects' ? 'active' : ''} onClick={() => setMetric('projects')}>Projects</button>
          </div>
        }
      />

      <div className="kpi-grid">
        <KpiCard label="Portfolio envelope" value={fmtMoney(funding, true)} />
        <KpiCard label="Sovereign operations" value={fmtMoney(sum(sovereign, (p) => p.funding_total_usd_m), true)} />
        <KpiCard label="Nonsovereign operations" value={fmtMoney(sum(nonsovereign, (p) => p.funding_total_usd_m), true)} />
        <KpiCard label="Top-five concentration" value={fmtPercent(topFiveShare)} />
      </div>

      <div className="two-column-grid funding-charts">
        <Panel
          title="Sovereign and nonsovereign trajectory"
          subtitle="Funding or project counts by approval year."
        >
          <div className="chart-xl">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={sovereigntyByYear} margin={{ top: 12, right: 8, bottom: 0, left: 0 }}>
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
                <Bar dataKey="Sovereign" stackId="a" fill={COLORS.blue} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Nonsovereign" stackId="a" fill={COLORS.teal} radius={[3, 3, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel
          title="Assistance mix over time"
          subtitle="Grant, loan and technical assistance by approval year."
        >
          <div className="chart-xl">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modalityByYear} margin={{ top: 12, right: 8, bottom: 0, left: 0 }}>
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
                {['Loan', 'Grant', 'TA'].map((name) => (
                  <Bar key={name} dataKey={name} stackId="a" fill={ASSISTANCE_COLORS[name]} />
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
              <button key={recipient.name} onClick={() => setFilters((current) => ({ ...current, recipient: recipient.name }))}>
                <b>{index + 1}</b>
                <span>{recipient.name}</span>
                <i><em style={{ width: `${(value / max) * 100}%` }} /></i>
                <strong>{metric === 'funding' ? fmtMoney(value, true) : fmtNumber(value)}</strong>
              </button>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
