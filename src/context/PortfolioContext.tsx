import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { loadPortfolioData } from '../data';
import type {
  Filters,
  KpiRecord,
  ModalityAllocation,
  PortfolioData,
  Project,
  RecipientAllocation,
  SubthemeRecord,
} from '../types';
import { splitTags } from '../utils';

const EMPTY_DATA: PortfolioData = {
  projects: [],
  kpis: [],
  recipients: [],
  modalities: [],
  subthemes: [],
  dimensions: [],
};

const DEFAULT_FILTERS: Filters = {
  mapProject: '',
  status: 'All',
  projectType: 'All',
  recipient: 'All',
  sector: 'All',
  subtheme: 'All',
  assistance: 'All',
  attribution: 'All',
  yearStart: 2007,
  yearEnd: 2028,
};

interface FilterOptions {
  statuses: string[];
  projectTypes: string[];
  recipients: string[];
  sectors: string[];
  subthemes: string[];
  assistance: string[];
  attributions: string[];
  years: number[];
}

interface PortfolioContextValue {
  data: PortfolioData;
  loading: boolean;
  error: string | null;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  resetFilters: () => void;
  options: FilterOptions;
  filteredProjects: Project[];
  filteredRecipients: RecipientAllocation[];
  filteredModalities: ModalityAllocation[];
  filteredKpis: KpiRecord[];
  filteredSubthemes: SubthemeRecord[];
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

const unique = (items: string[]) =>
  [...new Set(items.filter(Boolean))].sort((a, b) => a.localeCompare(b));

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PortfolioData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    loadPortfolioData()
      .then((loaded) => {
        setData(loaded);
        const years = loaded.projects.map((project) => project.approval_year);
        setFilters((current) => ({
          ...current,
          yearStart: Math.min(...years),
          yearEnd: Math.max(...years),
        }));
      })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : String(reason));
      })
      .finally(() => setLoading(false));
  }, []);

  const options = useMemo<FilterOptions>(() => {
    const years = [...new Set(data.projects.map((project) => project.approval_year))].sort(
      (a, b) => a - b,
    );
    return {
      statuses: unique(data.projects.map((project) => project.status)),
      projectTypes: unique(data.projects.map((project) => project.project_type)),
      recipients: unique(data.recipients.map((row) => row.allocated_recipient)),
      sectors: unique(data.projects.map((project) => project.sector)),
      subthemes: unique(
        data.projects.flatMap((project) => splitTags(project.manual_subthemes)),
      ),
      assistance: unique(
        data.modalities.map((row) => row.generalized_assistance_type),
      ),
      attributions: unique(
        data.projects.map((project) => project.manual_attribution_class),
      ),
      years,
    };
  }, [data]);

  const recipientProjects = useMemo(() => {
    if (filters.recipient === 'All') return null;
    return new Set(
      data.recipients
        .filter((row) => row.allocated_recipient === filters.recipient)
        .map((row) => row.project_number),
    );
  }, [data.recipients, filters.recipient]);

  const assistanceProjects = useMemo(() => {
    if (filters.assistance === 'All') return null;
    return new Set(
      data.modalities
        .filter(
          (row) => row.generalized_assistance_type === filters.assistance,
        )
        .map((row) => row.project_number),
    );
  }, [data.modalities, filters.assistance]);

  const filteredProjects = useMemo(() => {
    return data.projects
      .filter(
        (project) =>
          project.approval_year >= filters.yearStart &&
          project.approval_year <= filters.yearEnd,
      )
      .filter(
        (project) => filters.status === 'All' || project.status === filters.status,
      )
      .filter(
        (project) =>
          filters.projectType === 'All' ||
          project.project_type === filters.projectType,
      )
      .filter(
        (project) => filters.sector === 'All' || project.sector === filters.sector,
      )
      .filter(
        (project) =>
          filters.attribution === 'All' ||
          project.manual_attribution_class === filters.attribution,
      )
      .filter(
        (project) =>
          filters.subtheme === 'All' ||
          splitTags(project.manual_subthemes).includes(filters.subtheme),
      )
      .filter(
        (project) =>
          !recipientProjects || recipientProjects.has(project.project_number),
      )
      .filter(
        (project) =>
          !assistanceProjects || assistanceProjects.has(project.project_number),
      )
      .filter(
        (project) =>
          !filters.mapProject || project.project_number === filters.mapProject,
      )
      .sort(
        (a, b) =>
          b.approval_year - a.approval_year ||
          b.funding_total_usd_m - a.funding_total_usd_m,
      );
  }, [assistanceProjects, data.projects, filters, recipientProjects]);

  const filteredIds = useMemo(
    () => new Set(filteredProjects.map((project) => project.project_number)),
    [filteredProjects],
  );

  const value = useMemo<PortfolioContextValue>(
    () => ({
      data,
      loading,
      error,
      filters,
      setFilters,
      resetFilters: () =>
        setFilters({
          ...DEFAULT_FILTERS,
          yearStart: options.years[0] ?? 2007,
          yearEnd: options.years.at(-1) ?? 2028,
        }),
      options,
      filteredProjects,
      filteredRecipients: data.recipients.filter((row) =>
        filteredIds.has(row.project_number),
      ),
      filteredModalities: data.modalities.filter((row) =>
        filteredIds.has(row.project_number),
      ),
      filteredKpis: data.kpis.filter((row) =>
        filteredIds.has(row.project_number),
      ),
      filteredSubthemes: data.subthemes.filter((row) =>
        filteredIds.has(row.project_number),
      ),
      selectedProject,
      setSelectedProject,
    }),
    [
      data,
      error,
      filteredIds,
      filteredProjects,
      filters,
      loading,
      options,
      selectedProject,
    ],
  );

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used inside PortfolioProvider.');
  }
  return context;
}
