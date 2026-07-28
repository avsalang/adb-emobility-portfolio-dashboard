import { useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import type { Project } from '../types';
import {
  formatVehicleMode,
  formatKpiValue,
  fmtMoney,
  humanize,
  shortSubtheme,
  splitTags,
} from '../utils';

export function ProjectDrawer({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const { data } = usePortfolio();
  const kpis = useMemo(
    () =>
      data.kpis.filter(
        (row) =>
          row.project_number === project.project_number &&
          row.kpi_family !== 'no_distinct_emobility_output' &&
          !row.indicator.startsWith('no_'),
      ),
    [data.kpis, project.project_number],
  );
  const recipientRows = data.recipients.filter(
    (row) => row.project_number === project.project_number,
  );
  const modalityRows = data.modalities.filter(
    (row) => row.project_number === project.project_number,
  );

  return (
    <div className="drawer-backdrop" onMouseDown={onClose}>
      <aside className="project-drawer" onMouseDown={(event) => event.stopPropagation()}>
        <div className="drawer-top">
          <div>
            <span>{project.project_number}</span>
            <strong>{project.status}</strong>
          </div>
          <button className="drawer-close" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="drawer-content">
          <h2>{project.project_title}</h2>
          <div className="project-meta-grid">
            <div><span>Approval year</span><strong>{project.approval_year}</strong></div>
            <div><span>Associated funding</span><strong>{fmtMoney(project.funding_total_usd_m, true)}</strong></div>
            <div><span>Sector</span><strong>{project.sector}</strong></div>
            <div><span>Project type</span><strong>{project.project_type}</strong></div>
          </div>

          <section className="drawer-section">
            <span className="section-label">E-mobility role</span>
            <div className="role-callout">
              <strong>{humanize(project.manual_attribution_class)}</strong>
            </div>
          </section>

          <section className="drawer-section">
            <span className="section-label">Subthemes</span>
            <div className="tag-list">
              {splitTags(project.manual_subthemes).map((subtheme) => (
                <span key={subtheme}>
                  {shortSubtheme(subtheme)}
                </span>
              ))}
            </div>
          </section>

          <section className="drawer-section">
            <span className="section-label">Activity and technology</span>
            <dl className="drawer-list">
              <div>
                <dt>Activity location</dt>
                <dd>{project.manual_emobility_activity_location || project.recipient}</dd>
              </div>
              <div>
                <dt>Vehicle or mode</dt>
                <dd>{splitTags(project.manual_vehicle_modes).map(formatVehicleMode).join(' · ') || 'Not specified'}</dd>
              </div>
              <div>
                <dt>Value-chain stage</dt>
                <dd>{splitTags(project.manual_value_chain_stages).map(humanize).join(' · ') || 'Not specified'}</dd>
              </div>
            </dl>
          </section>

          <section className="drawer-section">
            <span className="section-label">Funding allocation</span>
            <div className="allocation-list">
              {modalityRows.map((row) => (
                <div key={`${row.project_number}-${row.modality}`}>
                  <span>{humanize(row.generalized_assistance_type)} · {row.modality}</span>
                  <strong>{fmtMoney(row.funding_usd_m, true)}</strong>
                </div>
              ))}
              {recipientRows.length > 1 && (
                <p>
                  Recipient allocation: {recipientRows
                    .map((row) => `${row.allocated_recipient} ${fmtMoney(row.funding_usd_m, true)}`)
                    .join(' · ')}
                </p>
              )}
            </div>
          </section>

          <section className="drawer-section">
            <span className="section-label">Reported outputs and actions</span>
            {kpis.length ? (
              <div className="drawer-kpis">
                {kpis.slice(0, 10).map((kpi) => (
                  <article key={kpi.kpi_id}>
                    <div>
                      <span>{humanize(kpi.kpi_family)}</span>
                      <strong>{humanize(kpi.indicator)}</strong>
                    </div>
                    {kpi.value_numeric !== null && (
                      <b>
                        {formatKpiValue(
                          kpi.value_numeric,
                          kpi.unit,
                          kpi.value_qualifier,
                        )}
                      </b>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <p className="empty-copy">No distinct structured output was reported.</p>
            )}
          </section>

          <a className="primary-link" href={project.project_url} target="_blank" rel="noreferrer">
            Open ADB project page
          </a>
        </div>
      </aside>
    </div>
  );
}
