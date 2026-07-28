import {
  ChevronDown,
  Filter,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { fmtNumber, humanize, shortSubtheme } from '../utils';

function SelectControl({
  label,
  value,
  options,
  onChange,
  formatter = (item) => item,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  formatter?: (value: string) => string;
}) {
  return (
    <label className="select-control">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="All">All</option>
        {options.map((option) => (
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
  const [expanded, setExpanded] = useState(false);
  const update = <K extends keyof typeof filters>(
    key: K,
    value: (typeof filters)[K],
  ) => setFilters((current) => ({ ...current, [key]: value }));
  const activeFilterCount = [
    filters.search.trim() !== '',
    filters.status !== 'All',
    filters.recipient !== 'All',
    filters.sector !== 'All',
    filters.subtheme !== 'All',
    filters.assistance !== 'All',
    filters.attribution !== 'All',
    filters.yearStart !== options.years[0] ||
      filters.yearEnd !== options.years.at(-1),
  ].filter(Boolean).length;

  return (
    <section className={`global-filters ${expanded ? 'expanded' : ''}`}>
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
        <label className="search-control">
          <Search size={15} />
          <input
            value={filters.search}
            onChange={(event) => update('search', event.target.value)}
            placeholder="Search projects"
            aria-label="Search projects"
          />
        </label>
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
          onChange={(value) => update('recipient', value)}
        />
        <button
          className={`filter-more ${expanded ? 'active' : ''}`}
          onClick={() => setExpanded((value) => !value)}
          title={expanded ? 'Hide additional filters' : 'Show additional filters'}
          aria-expanded={expanded}
          aria-controls="portfolio-secondary-filters"
        >
          <Filter size={15} />
          More
          {activeFilterCount > 0 && <b>{activeFilterCount}</b>}
        </button>
        <button
          className="icon-button reset"
          onClick={resetFilters}
          title="Reset all filters"
          aria-label="Reset all filters"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      {expanded && (
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
            <span>Approval year</span>
            <div>
              <select
                value={filters.yearStart}
                onChange={(event) => update('yearStart', Number(event.target.value))}
                aria-label="Approval year from"
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
                aria-label="Approval year to"
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
      )}
    </section>
  );
}
