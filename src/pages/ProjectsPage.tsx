import {
  ArrowDown,
  ArrowUp,
  ChevronsLeft,
  ChevronsRight,
  Download,
  ExternalLink,
  Search,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageHeader, Panel } from '../components/Panel';
import { usePortfolio } from '../context/PortfolioContext';
import type { Project } from '../types';
import {
  STATUS_COLORS,
  dedicatedEmobilityFunding,
  dedicatedFundingBasis,
  downloadPortfolioWorkbook,
  fmtMoney,
  humanize,
  projectYearBasis,
  shortSubtheme,
  splitTags,
} from '../utils';

type SortKey =
  | 'approval_year'
  | 'funding_total_usd_m'
  | 'dedicated_emobility_funding_usd_m'
  | 'project_title';
const PAGE_SIZE = 12;

export function ProjectsPage() {
  const {
    filteredProjects,
    filteredRecipients,
    filteredModalities,
    filteredKpis,
    setSelectedProject,
  } = usePortfolio();
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('approval_year');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [exporting, setExporting] = useState(false);
  const [query, setQuery] = useState('');

  const projects = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const matchingProjects = normalizedQuery
      ? filteredProjects.filter((project) =>
          [
            project.project_number,
            project.project_title,
            project.recipient,
            project.sector,
            project.project_type,
            project.status,
            project.manual_subthemes,
            project.manual_vehicle_modes,
          ].some((value) =>
            String(value ?? '').toLocaleLowerCase().includes(normalizedQuery),
          ),
        )
      : filteredProjects;
    const sorted = [...matchingProjects].sort((a, b) => {
      const aValue =
        sortKey === 'dedicated_emobility_funding_usd_m'
          ? dedicatedEmobilityFunding(a)
          : (a[sortKey] as number | string);
      const bValue =
        sortKey === 'dedicated_emobility_funding_usd_m'
          ? dedicatedEmobilityFunding(b)
          : (b[sortKey] as number | string);
      if (aValue === null || bValue === null) {
        if (aValue === bValue) return 0;
        return aValue === null ? 1 : -1;
      }
      const comparison =
        typeof aValue === 'number' && typeof bValue === 'number'
          ? aValue - bValue
          : String(aValue).localeCompare(String(bValue));
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [filteredProjects, query, sortDirection, sortKey]);

  const maxPage = Math.max(1, Math.ceil(projects.length / PAGE_SIZE));
  const activePage = Math.min(page, maxPage);
  const visible = projects.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);

  const changeSort = (key: SortKey) => {
    if (key === sortKey) setSortDirection((value) => (value === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDirection(key === 'project_title' ? 'asc' : 'desc');
    }
  };

  const SortIcon = sortDirection === 'asc' ? ArrowUp : ArrowDown;
  const ariaSort = (key: SortKey): 'ascending' | 'descending' | 'none' =>
    sortKey === key ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none';
  const sortValue = `${sortKey}:${sortDirection}`;
  const changeMobileSort = (value: string) => {
    const [key, direction] = value.split(':') as [
      SortKey,
      'asc' | 'desc',
    ];
    setSortKey(key);
    setSortDirection(direction);
    setPage(1);
  };

  return (
    <div className="page">
      <PageHeader
        title="Project explorer"
        action={
          <div className="project-page-actions">
            <label className="project-search">
              <span>Search projects</span>
              <div>
                <Search size={16} />
                <input
                  type="search"
                  value={query}
                  placeholder="Project number, title, recipient or sector"
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setPage(1);
                    }}
                    title="Clear project search"
                    aria-label="Clear project search"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </label>
            <button
              className="download-button"
              disabled={exporting}
              onClick={async () => {
                setExporting(true);
                try {
                  await downloadPortfolioWorkbook({
                    projects,
                    recipients: filteredRecipients,
                    modalities: filteredModalities,
                    kpis: filteredKpis,
                  });
                } finally {
                  setExporting(false);
                }
              }}
            >
              <Download size={15} />
              {exporting ? 'Preparing workbook' : 'Download workbook'}
            </button>
          </div>
        }
      />

      <Panel
        title={`${projects.length} project${projects.length === 1 ? '' : 's'}`}
        subtitle={query ? `Matching “${query.trim()}” in the current selection.` : 'Sortable records for the current selection.'}
        className="project-table-panel"
      >
        {visible.length ? (
          <>
            <label className="mobile-project-sort">
              <span>Sort projects</span>
              <select
                value={sortValue}
                onChange={(event) => changeMobileSort(event.target.value)}
              >
                <option value="approval_year:desc">Newest approval or expected year</option>
                <option value="approval_year:asc">Oldest approval or expected year</option>
                <option value="funding_total_usd_m:desc">Highest associated funding</option>
                <option value="funding_total_usd_m:asc">Lowest associated funding</option>
                <option value="dedicated_emobility_funding_usd_m:desc">Highest identified e-mobility funding</option>
                <option value="dedicated_emobility_funding_usd_m:asc">Lowest identified e-mobility funding</option>
                <option value="project_title:asc">Project title A–Z</option>
              </select>
            </label>
            <div className="project-table-wrap">
              <table className="project-table">
                <colgroup>
                  <col style={{ width: '23%' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '11%' }} />
                  <col style={{ width: '9%' }} />
                  <col style={{ width: '9%' }} />
                  <col style={{ width: '17%' }} />
                  <col style={{ width: '9%' }} />
                  <col style={{ width: '11%' }} />
                  <col style={{ width: '3%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th aria-sort={ariaSort('project_title')}><button onClick={() => changeSort('project_title')}>Project {sortKey === 'project_title' && <SortIcon size={12} />}</button></th>
                    <th aria-sort={ariaSort('approval_year')}><button onClick={() => changeSort('approval_year')}>Approval / expected year {sortKey === 'approval_year' && <SortIcon size={12} />}</button></th>
                    <th>Recipient</th>
                    <th>Status</th>
                    <th>Role</th>
                    <th>Leading subthemes</th>
                    <th aria-sort={ariaSort('funding_total_usd_m')}><button onClick={() => changeSort('funding_total_usd_m')}>Associated funding {sortKey === 'funding_total_usd_m' && <SortIcon size={12} />}</button></th>
                    <th aria-sort={ariaSort('dedicated_emobility_funding_usd_m')}><button onClick={() => changeSort('dedicated_emobility_funding_usd_m')}>Identified e-mobility funding {sortKey === 'dedicated_emobility_funding_usd_m' && <SortIcon size={12} />}</button></th>
                    <th aria-label="Open source" />
                  </tr>
                </thead>
                <tbody>
                  {visible.map((project) => (
                    <tr key={project.project_number} onClick={() => setSelectedProject(project)}>
                      <td data-label="Project">
                        <span>{project.project_number}</span>
                        <button
                          className="project-title-button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedProject(project);
                          }}
                        >
                          <strong>{project.project_title}</strong>
                        </button>
                        <small>{project.sector} · {project.project_type}</small>
                      </td>
                      <td data-label={projectYearBasis(project)}>{project.approval_year}</td>
                      <td data-label="Recipient">{project.recipient}</td>
                      <td data-label="Status"><span className="status-badge" style={{ '--status': STATUS_COLORS[project.status] } as React.CSSProperties}>{project.status}</span></td>
                      <td data-label="Role">{humanize(project.manual_attribution_class)}</td>
                      <td data-label="Leading subthemes">
                        <div className="table-tags">
                          {splitTags(project.manual_subthemes).slice(0, 2).map((tag) => <span key={tag}>{shortSubtheme(tag)}</span>)}
                          {splitTags(project.manual_subthemes).length > 2 && <b>+{splitTags(project.manual_subthemes).length - 2}</b>}
                        </div>
                      </td>
                      <td data-label="Associated funding"><strong className="money-cell">{fmtMoney(project.funding_total_usd_m, true)}</strong></td>
                      <td data-label="Identified e-mobility funding">
                        {dedicatedEmobilityFunding(project) === null ? (
                          <span className="funding-unavailable" title="No separately attributable dedicated amount">-</span>
                        ) : (
                          <strong className="money-cell" title={dedicatedFundingBasis(project)}>
                            {project.manual_attribution_class === 'quantified_minimum' && 'At least '}
                            {fmtMoney(dedicatedEmobilityFunding(project) ?? 0, true)}
                          </strong>
                        )}
                      </td>
                      <td data-label="Source">
                        <a
                          href={project.project_url}
                          target="_blank"
                          rel="noreferrer"
                          title="Open ADB project page"
                          aria-label={`Open ADB page for ${project.project_title}`}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <ExternalLink size={14} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-pagination">
              <span>Showing {(activePage - 1) * PAGE_SIZE + 1}–{Math.min(activePage * PAGE_SIZE, projects.length)} of {projects.length}</span>
              <div>
                <button onClick={() => setPage(1)} disabled={activePage === 1} title="First page" aria-label="First page"><ChevronsLeft size={15} /></button>
                {Array.from({ length: Math.min(5, maxPage) }, (_, index) => {
                  const start = Math.max(1, Math.min(activePage - 2, maxPage - 4));
                  const pageNumber = start + index;
                  return pageNumber <= maxPage ? <button key={pageNumber} className={activePage === pageNumber ? 'active' : ''} onClick={() => setPage(pageNumber)}>{pageNumber}</button> : null;
                })}
                <button onClick={() => setPage(maxPage)} disabled={activePage === maxPage} title="Last page" aria-label="Last page"><ChevronsRight size={15} /></button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-results">
            <strong>No projects match the current filters</strong>
            <span>Reset one or more portfolio filters to broaden the result.</span>
          </div>
        )}
      </Panel>
    </div>
  );
}
