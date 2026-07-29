import {
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
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

const SECTOR_COLORS: Record<string, string> = {
  Transport: '#1769aa',
  Energy: '#178f8f',
  Finance: '#e9a62d',
  'Water and other urban infrastructure and services': '#735a83',
  'Industry and trade': '#df6b55',
  Education: '#4b7aa6',
};

const VALUE_CHAIN_STAGES = [
  { key: 'preparation', label: 'Research and preparation' },
  { key: 'production', label: 'Production and supply' },
  { key: 'vehicle', label: 'Vehicle acquisition' },
  { key: 'infrastructure', label: 'Infrastructure deployment' },
  { key: 'operations', label: 'Operations and maintenance' },
  { key: 'circularity', label: 'End-of-life and circularity' },
] as const;

const CROSS_CUTTING_TOPICS = [
  {
    label: 'Climate mitigation',
    pattern:
      /climate_mitigation|decarbon|emission|low_carbon|net_zero|zero_emission|greenhouse|environmentally_sustainable/,
    color: '#1769aa',
  },
  {
    label: 'Air quality and health',
    pattern: /air_quality|pollution|public_health|health|noise/,
    color: '#178f8f',
  },
  {
    label: 'Gender and social inclusion',
    pattern:
      /gender|women|inclus|accessib|equity|disability|indigenous|universal_access/,
    color: '#735a83',
  },
  {
    label: 'Institutional capacity',
    pattern: /institution|capacity|governance|coordination/,
    color: '#4b7aa6',
  },
  {
    label: 'Private sector development',
    pattern:
      /private_sector|private_capital|public_private|competitive_market|market_creation|local_industry|ev_industry/,
    color: '#df6b55',
  },
  {
    label: 'Climate resilience',
    pattern: /resilien|adaptation|small_island/,
    color: '#2a9d8f',
  },
  {
    label: 'Safety',
    pattern: /road_safety|passenger_safety|battery_safety|safe_transport/,
    color: '#e9a62d',
  },
  {
    label: 'Energy efficiency',
    pattern: /energy_efficiency/,
    color: '#178f8f',
  },
  {
    label: 'Renewable and clean energy',
    pattern:
      /renewable_energy|clean_energy|energy_transition|energy_security|smart_energy|grid_reliability|energy_storage/,
    color: '#2a9d8f',
  },
  {
    label: 'Inclusive finance',
    pattern:
      /financial_inclusion|msme|sme|access_to_finance|consumer_finance|inclusive_finance|green_finance|climate_finance|municipal_finance|market_financing|capital_market/,
    color: '#735a83',
  },
  {
    label: 'Connectivity and modal shift',
    pattern:
      /connectivity|modal_shift|mode_shift|active_mobility|walkability|multimodal|congestion|last_mile|mobility_and_access/,
    color: '#1769aa',
  },
  {
    label: 'Affordability and livelihoods',
    pattern: /affordab|poverty|low_income|livelihood|employment|jobs/,
    color: '#df6b55',
  },
  {
    label: 'Technology and innovation',
    pattern: /technology|innovation|digital_transformation|human_centered_design/,
    color: '#4b7aa6',
  },
  {
    label: 'Public transport access',
    pattern:
      /public_transport_access|public_transport_quality|inclusive_public_transport|sustainable_public_transport|public_transport_modernization|public_transport_scaling/,
    color: '#e9a62d',
  },
  {
    label: 'Regional cooperation',
    pattern:
      /regional_cooperation|regional_market|regional_knowledge|knowledge_sharing/,
    color: '#178f8f',
  },
] as const;

interface DistributionRow {
  name: string;
  value: number;
  color: string;
}

interface PieTooltipPayload {
  payload: DistributionRow;
}

function FilledPieTooltip({
  active,
  payload,
  denominator,
  formatter = (value) => value,
}: {
  active?: boolean;
  payload?: PieTooltipPayload[];
  denominator: number;
  formatter?: (value: string) => string;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div
      className="distribution-tooltip"
      style={{ background: row.color, color: '#ffffff' }}
    >
      <span>{formatter(row.name)}</span>
      <strong>
        {fmtNumber(row.value)} project{row.value === 1 ? '' : 's'} ·{' '}
        {fmtPercent(row.value / Math.max(denominator, 1))}
      </strong>
    </div>
  );
}

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
            width: `${Math.min(
              (row.value / Math.max(denominator, 1)) * 100,
              100,
            )}%`,
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
          <button
            type="button"
            key={row.name}
            onClick={() => onSelect(row.name)}
          >
            {rowContent(row)}
          </button>
        ) : (
          <div key={row.name}>{rowContent(row)}</div>
        ),
      )}
    </div>
  );
}

function DotPlot({
  rows,
  denominator,
}: {
  rows: { name: string; value: number }[];
  denominator: number;
}) {
  return (
    <div
      className="mode-dot-plot"
      role="img"
      aria-label={`Project coverage by vehicle and transport mode. ${rows
        .map((row) => `${row.name}: ${row.value} projects`)
        .join('; ')}.`}
    >
      {rows.map((row) => {
        const percentage = Math.min(
          (row.value / Math.max(denominator, 1)) * 100,
          100,
        );
        return (
          <div key={row.name}>
            <span>{row.name}</span>
            <strong>{fmtNumber(row.value)}</strong>
            <small>{fmtPercent(row.value / Math.max(denominator, 1))}</small>
            <i aria-hidden="true">
              <em style={{ width: `${percentage}%` }} />
              <b style={{ left: `${percentage}%` }} />
            </i>
          </div>
        );
      })}
    </div>
  );
}

function SectorDonut({
  rows,
  denominator,
  onSelect,
}: {
  rows: DistributionRow[];
  denominator: number;
  onSelect: (sector: string) => void;
}) {
  return (
    <div className="distribution-pie sector-distribution">
      <div className="distribution-pie-chart">
        <div
          className="distribution-pie-graphic"
          role="img"
          aria-label={`${denominator} projects by primary ADB sector. ${rows
            .map((row) => `${row.name}: ${row.value}`)
            .join('; ')}.`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={rows}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={88}
                paddingAngle={2}
                isAnimationActive={false}
              >
                {rows.map((row) => (
                  <Cell key={row.name} fill={row.color} />
                ))}
              </Pie>
              <Tooltip
                content={<FilledPieTooltip denominator={denominator} />}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="distribution-pie-center">
            <strong>{fmtNumber(denominator)}</strong>
            <span>projects</span>
          </div>
        </div>
      </div>
      <div className="distribution-legend">
        {rows.map((row) => (
          <button
            type="button"
            key={row.name}
            onClick={() => onSelect(row.name)}
          >
            <i style={{ background: row.color }} />
            <span>{row.name}</span>
            <strong>{fmtNumber(row.value)}</strong>
            <small>{fmtPercent(row.value / Math.max(denominator, 1))}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function modeGroup(value: string): string {
  if (/trolley|bus/.test(value)) return 'Electric and low-carbon buses';
  if (/two_wheeler|motorcycle|scooter/.test(value)) return 'Two-wheelers';
  if (/three_wheeler|rickshaw|tuktuk|microtransit/.test(value)) {
    return 'Three-wheelers and microtransit';
  }
  if (/ferry|boat|water_transport/.test(value)) {
    return 'Electric water transport';
  }
  if (/rail|metro|ropeway|cable/.test(value)) {
    return 'Rail, metro and cable transit';
  }
  if (/commercial|delivery|distribution|four_wheeler|car|light_vehicle/.test(value)) {
    return 'Cars and commercial vehicles';
  }
  if (/unspecified|mobility/.test(value)) return 'General e-mobility scope';
  return 'Other and enabling modes';
}

function canonicalValueChainStages(tags: string[]) {
  const stages = new Set<string>();
  tags.forEach((tag) => {
    if (/research|prepar|planning|readiness|design|strategy|pipeline|pilot_support/.test(tag)) {
      stages.add('preparation');
    }
    if (/production|supply|equipment/.test(tag)) stages.add('production');
    if (
      /acquisition|fleet|vehicle_pilot|vehicle_deployment|planned_vehicle|asset_acquisition|vehicle_distribution|leasing|demonstration/.test(
        tag,
      )
    ) {
      stages.add('vehicle');
    }
    if (/infrastructure|system_deployment/.test(tag)) {
      stages.add('infrastructure');
    }
    if (/operation|maintenance/.test(tag)) stages.add('operations');
    if (/end_of_life|recycling|second_life|refurbishment|life_extension/.test(tag)) {
      stages.add('circularity');
    }
  });
  return stages;
}

function isValueChainEnabler(tag: string) {
  return /market|financ|policy|institution|capacity|skills|workforce|implementation_support/.test(
    tag,
  );
}

function ValueChainBand({
  stages,
  enablerCount,
  denominator,
}: {
  stages: { key: string; label: string; value: number }[];
  enablerCount: number;
  denominator: number;
}) {
  const maximum = Math.max(...stages.map((stage) => stage.value), 1);
  return (
    <div className="value-chain-profile">
      <div className="value-chain-band-scroll">
        <div className="value-chain-band">
          {stages.map((stage, index) => {
            const strength = 0.14 + (stage.value / maximum) * 0.86;
            const lightText = strength > 0.56;
            return (
              <div
                key={stage.key}
                role="img"
                aria-label={`${stage.label}: ${stage.value} projects, ${fmtPercent(
                  stage.value / Math.max(denominator, 1),
                )}`}
                style={{
                  background: `rgba(23, 105, 170, ${strength})`,
                  color: lightText ? '#ffffff' : '#0d2742',
                }}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{stage.label}</strong>
                <p>
                  <b>{fmtNumber(stage.value)}</b>
                  <small>
                    projects ·{' '}
                    {fmtPercent(stage.value / Math.max(denominator, 1))}
                  </small>
                </p>
              </div>
            );
          })}
        </div>
      </div>
      <div className="value-chain-enabler">
        <span>Market and institutional enablers</span>
        <strong>{fmtNumber(enablerCount)} projects</strong>
        <small>{fmtPercent(enablerCount / Math.max(denominator, 1))}</small>
      </div>
    </div>
  );
}

function PriorityCloud({
  topics,
}: {
  topics: { label: string; value: number; color: string }[];
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hover, setHover] = useState<{
    x: number;
    y: number;
    label: string;
    value: number;
  } | null>(null);
  const maximum = Math.max(...topics.map((topic) => topic.value), 1);
  const minimum = Math.min(...topics.map((topic) => topic.value), maximum);

  const showTooltip = (
    event: ReactPointerEvent<HTMLElement>,
    topic: { label: string; value: number },
  ) => {
    const bounds = containerRef.current?.getBoundingClientRect();
    if (!bounds) return;
    setHover({
      x: Math.min(event.clientX - bounds.left + 12, bounds.width - 230),
      y: Math.min(event.clientY - bounds.top + 12, bounds.height - 104),
      label: topic.label,
      value: topic.value,
    });
  };

  return (
    <div
      ref={containerRef}
      className="priority-cloud"
      onPointerLeave={() => setHover(null)}
    >
      <div
        className="priority-cloud-words"
        role="list"
        aria-label={`Cross-cutting priority cloud. ${topics
          .map((topic) => `${topic.label}: ${topic.value} projects`)
          .join('; ')}.`}
      >
        {topics.map((topic) => {
          const normalized =
            maximum === minimum
              ? 1
              : (topic.value - minimum) / (maximum - minimum);
          const sizeLevel = Math.round(Math.sqrt(normalized) * 4);
          const fontWeight = 500 + Math.round(normalized * 200);
          return (
            <span
              key={topic.label}
              className={`priority-cloud-level-${sizeLevel}`}
              style={{
                color: topic.color,
                fontWeight,
              }}
              role="listitem"
              tabIndex={0}
              aria-label={`${topic.label}: ${topic.value} projects`}
              title={`${topic.label}: ${topic.value} projects`}
              onPointerEnter={(event) => showTooltip(event, topic)}
              onPointerMove={(event) => showTooltip(event, topic)}
            >
              {topic.label}
            </span>
          );
        })}
      </div>

      {hover && (
        <div
          className="matrix-tooltip priority-cloud-tooltip"
          style={{ left: hover.x, top: hover.y }}
        >
          <span>{hover.label}</span>
          <strong>
            {fmtNumber(hover.value)} project{hover.value === 1 ? '' : 's'}
          </strong>
        </div>
      )}
    </div>
  );
}

export function PortfolioProfilePage() {
  const { filteredProjects, filteredSubthemes, setFilters } = usePortfolio();

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

  const attribution = useMemo<DistributionRow[]>(
    () =>
      groupCount(
        filteredProjects,
        (project) => project.manual_attribution_class,
      ).map((row) => ({
        ...row,
        color: ATTRIBUTION_COLORS[row.name] ?? COLORS.slate,
      })),
    [filteredProjects],
  );

  const sectors = useMemo<DistributionRow[]>(
    () =>
      groupCount(filteredProjects, (project) => project.sector).map(
        (row, index) => ({
          ...row,
          color:
            SECTOR_COLORS[row.name] ??
            [COLORS.blue, COLORS.teal, COLORS.amber, COLORS.plum][index % 4],
        }),
      ),
    [filteredProjects],
  );

  const valueChain = useMemo(() => {
    const counts = new Map<string, Set<string>>(
      VALUE_CHAIN_STAGES.map((stage) => [stage.key, new Set<string>()]),
    );
    const enablers = new Set<string>();
    filteredProjects.forEach((project) => {
      const tags = splitTags(project.manual_value_chain_stages);
      canonicalValueChainStages(tags).forEach((stage) => {
        counts.get(stage)?.add(project.project_number);
      });
      if (tags.some(isValueChainEnabler)) {
        enablers.add(project.project_number);
      }
    });
    return {
      stages: VALUE_CHAIN_STAGES.map((stage) => ({
        ...stage,
        value: counts.get(stage.key)?.size ?? 0,
      })),
      enablerCount: enablers.size,
    };
  }, [filteredProjects]);

  const modes = useMemo(() => {
    const projectGroups = new Map<string, Set<string>>();
    filteredProjects.forEach((project) => {
      const groups = new Set(
        splitTags(project.manual_vehicle_modes).map(modeGroup),
      );
      groups.forEach((group) => {
        if (!projectGroups.has(group)) projectGroups.set(group, new Set());
        projectGroups.get(group)?.add(project.project_number);
      });
    });
    return [...projectGroups.entries()]
      .map(([name, projects]) => ({ name, value: projects.size }))
      .sort((a, b) => b.value - a.value);
  }, [filteredProjects]);

  const crossCuttingTopics = useMemo(
    () =>
      CROSS_CUTTING_TOPICS.map((topic) => ({
        label: topic.label,
        color: topic.color,
        value: filteredProjects.filter((project) =>
          splitTags(project.manual_cross_cutting_focus).some((tag) =>
            topic.pattern.test(tag),
          ),
        ).length,
      }))
        .filter((topic) => topic.value > 0)
        .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label)),
    [filteredProjects],
  );

  return (
    <div className="page">
      <PageHeader title="Technology profile" />

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
                    {attribution.map((row) => (
                      <Cell key={row.name} fill={row.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={
                      <FilledPieTooltip
                        denominator={filteredProjects.length}
                        formatter={humanize}
                      />
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-center">
                <strong>{filteredProjects.length}</strong>
                <span>projects</span>
              </div>
            </div>
            <div className="legend-rows">
              {attribution.map((row) => (
                <button
                  type="button"
                  key={row.name}
                  onClick={() =>
                    setFilters((current) => ({
                      ...current,
                      attribution: row.name,
                    }))
                  }
                >
                  <i style={{ background: row.color }} />
                  <span>{humanize(row.name)}</span>
                  <strong>{row.value}</strong>
                  <small>
                    {fmtPercent(
                      row.value / Math.max(filteredProjects.length, 1),
                    )}
                  </small>
                </button>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      <div className="two-column-grid profile-distribution-grid">
        <Panel
          title="Vehicle and transport modes"
          subtitle="Unique project coverage by grouped mode; projects may span groups."
        >
          <DotPlot rows={modes} denominator={filteredProjects.length} />
        </Panel>

        <Panel
          title="Sector distribution"
          subtitle="Projects by primary ADB sector."
        >
          <SectorDonut
            rows={sectors}
            denominator={filteredProjects.length}
            onSelect={(sector) =>
              setFilters((current) => ({ ...current, sector }))
            }
          />
        </Panel>
      </div>

      <Panel
        className="value-chain-panel"
        title="Value-chain stages"
        subtitle="Project coverage across the e-mobility value chain."
      >
        <ValueChainBand
          stages={valueChain.stages}
          enablerCount={valueChain.enablerCount}
          denominator={filteredProjects.length}
        />
      </Panel>

      <Panel
        className="priority-cloud-panel"
        title="Cross-cutting priorities"
        subtitle="Recurring priorities across the portfolio."
      >
        <PriorityCloud topics={crossCuttingTopics} />
      </Panel>
    </div>
  );
}
