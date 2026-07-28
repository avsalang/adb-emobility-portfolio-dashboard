import {
  ArrowDown,
  ArrowUp,
  ChevronsLeft,
  ChevronsRight,
  Download,
  ExternalLink,
  SearchX,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageHeader, Panel } from '../components/Panel';
import { usePortfolio } from '../context/PortfolioContext';
import type { Project } from '../types';
import {
  STATUS_COLORS,
  downloadProjectsCsv,
  fmtMoney,
  humanize,
  shortSubtheme,
  splitTags,
} from '../utils';

type SortKey = 'approval_year' | 'funding_total_usd_m' | 'project_title';
const PAGE_SIZE = 12;

export function ProjectsPage() {
  const { filteredProjects, setSelectedProject } = usePortfolio();
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('approval_year');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const projects = useMemo(() => {
    const sorted = [...filteredProjects].sort((a, b) => {
      const aValue = a[sortKey] as number | string;
      const bValue = b[sortKey] as number | string;
      const comparison =
        typeof aValue === 'number' && typeof bValue === 'number'
          ? aValue - bValue
          : String(aValue).localeCompare(String(bValue));
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [filteredProjects, sortDirection, sortKey]);

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

  return (
    <div className="page">
      <PageHeader
        title="Project explorer"
        action={
          <button className="download-button" onClick={() => downloadProjectsCsv(projects)}>
            <Download size={15} />
            Download filtered data
          </button>
        }
      />

      <Panel
        title={`${projects.length} projects`}
        className="project-table-panel"
      >
        {visible.length ? (
          <>
            <div className="project-table-wrap">
              <table className="project-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th><button onClick={() => changeSort('approval_year')}>Year {sortKey === 'approval_year' && <SortIcon size={12} />}</button></th>
                    <th>Recipient</th>
                    <th>Status</th>
                    <th>Role</th>
                    <th>Leading subthemes</th>
                    <th><button onClick={() => changeSort('funding_total_usd_m')}>Funding {sortKey === 'funding_total_usd_m' && <SortIcon size={12} />}</button></th>
                    <th aria-label="Open source" />
                  </tr>
                </thead>
                <tbody>
                  {visible.map((project) => (
                    <tr key={project.project_number} onClick={() => setSelectedProject(project)}>
                      <td data-label="Project">
                        <span>{project.project_number}</span>
                        <strong>{project.project_title}</strong>
                        <small>{project.sector} · {project.project_type}</small>
                      </td>
                      <td data-label="Year">{project.approval_year}</td>
                      <td data-label="Recipient">{project.recipient}</td>
                      <td data-label="Status"><span className="status-badge" style={{ '--status': STATUS_COLORS[project.status] } as React.CSSProperties}>{project.status}</span></td>
                      <td data-label="Role">{humanize(project.manual_attribution_class)}</td>
                      <td data-label="Leading subthemes">
                        <div className="table-tags">
                          {splitTags(project.manual_subthemes).slice(0, 2).map((tag) => <span key={tag}>{shortSubtheme(tag)}</span>)}
                          {splitTags(project.manual_subthemes).length > 2 && <b>+{splitTags(project.manual_subthemes).length - 2}</b>}
                        </div>
                      </td>
                      <td data-label="Funding"><strong className="money-cell">{fmtMoney(project.funding_total_usd_m, true)}</strong></td>
                      <td data-label="Source">
                        <a href={project.project_url} target="_blank" rel="noreferrer" title="Open ADB project page" onClick={(event) => event.stopPropagation()}>
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
                <button onClick={() => setPage(1)} disabled={activePage === 1} title="First page"><ChevronsLeft size={15} /></button>
                {Array.from({ length: Math.min(5, maxPage) }, (_, index) => {
                  const start = Math.max(1, Math.min(activePage - 2, maxPage - 4));
                  const pageNumber = start + index;
                  return pageNumber <= maxPage ? <button key={pageNumber} className={activePage === pageNumber ? 'active' : ''} onClick={() => setPage(pageNumber)}>{pageNumber}</button> : null;
                })}
                <button onClick={() => setPage(maxPage)} disabled={activePage === maxPage} title="Last page"><ChevronsRight size={15} /></button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-results">
            <SearchX size={28} />
            <strong>No projects match the current filters</strong>
            <span>Reset one or more portfolio filters to broaden the result.</span>
          </div>
        )}
      </Panel>
    </div>
  );
}
