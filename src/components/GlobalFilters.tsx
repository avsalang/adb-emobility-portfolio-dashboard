import {
  ChevronDown,
  RotateCcw,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { fmtNumber, humanize, shortSubtheme } from '../utils';

function SelectControl({
  label,
  value,
  options,
  optionGroups,
  onChange,
  formatter = (item) => item,
}: {
  label: string;
  value: string;
  options: string[];
  optionGroups?: { label: string; options: string[] }[];
  onChange: (value: string) => void;
  formatter?: (value: string) => string;
}) {
  return (
    <label className="select-control">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="All">All</option>
        {optionGroups
          ? optionGroups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((option) => (
                  <option key={option} value={option}>
                    {formatter(option)}
                  </option>
                ))}
              </optgroup>
            ))
          : options.map((option) => (
              <option key={option} value={option}>
                {formatter(option)}
              </option>
            ))}
      </select>
      <ChevronDown size={14} />
    </label>
  );
}

export function GlobalFilters() {
  const {
    filters,
    setFilters,
    resetFilters,
    options,
    filteredProjects,
    data,
  } = usePortfolio();
  const update = <K extends keyof typeof filters>(
    key: K,
    value: (typeof filters)[K],
  ) => setFilters((current) => ({ ...current, [key]: value }));
  const mapProject = data.projects.find(
    (project) => project.project_number === filters.mapProject,
  );

  return (
    <section className="global-filters expanded">
      <div className="filter-primary-row">
        <div className="filter-title">
          <SlidersHorizontal size={18} />
          <div>
            <strong>Portfolio filters</strong>
            <span>
              {fmtNumber(filteredProjects.length)} of {fmtNumber(data.projects.length)} projects
            </span>
          </div>
        </div>
        <SelectControl
          label="Status"
          value={filters.status}
          options={options.statuses}
          onChange={(value) => update('status', value)}
        />
        <SelectControl
          label="Recipient"
          value={filters.recipient}
          options={options.recipients}
          optionGroups={[
            {
              label: 'Individual economies',
              options: options.recipients.filter(
                (recipient) => recipient !== 'Regional',
              ),
            },
            {
              label: 'Regional',
              options: options.recipients.filter(
                (recipient) => recipient === 'Regional',
              ),
            },
          ]}
          onChange={(value) => update('recipient', value)}
        />
        <button
          className="icon-button reset"
          onClick={resetFilters}
          title="Reset all filters"
          aria-label="Reset all filters"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      {mapProject && (
        <div className="active-filter-strip">
          <span>Map project</span>
          <strong>{mapProject.project_number}</strong>
          <em>{mapProject.project_title}</em>
          <button
            type="button"
            onClick={() => update('mapProject', '')}
            title="Clear map project filter"
            aria-label={`Clear map project filter for ${mapProject.project_number}`}
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div id="portfolio-secondary-filters" className="filter-secondary-row">
        <SelectControl
          label="Subtheme"
          value={filters.subtheme}
          options={options.subthemes}
          onChange={(value) => update('subtheme', value)}
          formatter={shortSubtheme}
        />
        <SelectControl
          label="Sector"
          value={filters.sector}
          options={options.sectors}
          onChange={(value) => update('sector', value)}
        />
        <SelectControl
          label="Project type"
          value={filters.projectType}
          options={options.projectTypes}
          onChange={(value) => update('projectType', value)}
        />
        <SelectControl
          label="Assistance"
          value={filters.assistance}
          options={options.assistance}
          onChange={(value) => update('assistance', value)}
          formatter={humanize}
        />
        <SelectControl
          label="E-mobility role"
          value={filters.attribution}
          options={options.attributions}
          onChange={(value) => update('attribution', value)}
          formatter={humanize}
        />
        <label className="range-control">
          <span>Approval / expected year</span>
          <div>
            <select
              value={filters.yearStart}
              onChange={(event) => update('yearStart', Number(event.target.value))}
              aria-label="Approval or expected year from"
            >
              {options.years
                .filter((year) => year <= filters.yearEnd)
                .map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
            </select>
            <i />
            <select
              value={filters.yearEnd}
              onChange={(event) => update('yearEnd', Number(event.target.value))}
              aria-label="Approval or expected year to"
            >
              {options.years
                .filter((year) => year >= filters.yearStart)
                .map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
            </select>
          </div>
        </label>
      </div>
    </section>
  );
}
