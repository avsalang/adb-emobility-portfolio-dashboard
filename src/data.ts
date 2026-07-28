import type {
  DimensionRecord,
  KpiRecord,
  ModalityAllocation,
  PortfolioData,
  Project,
  RawPortfolioPayload,
  RawValue,
  RecipientAllocation,
  SubthemeRecord,
} from './types';

function rowObjects<T>(headers: string[], rows: RawValue[][]): T[] {
  return rows.map((row) =>
    Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])),
  ) as T[];
}

const numberValue = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const nullableNumber = (value: unknown) => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const booleanValue = (value: unknown) =>
  value === true || value === 1 || value === '1' || value === 'true';

function normalizeProject(project: Project): Project {
  return {
    ...project,
    approval_year: numberValue(project.approval_year),
    funding_total: numberValue(project.funding_total),
    funding_total_usd_m: numberValue(project.funding_total_usd_m),
    manual_output_kpi_record_count: numberValue(project.manual_output_kpi_record_count),
    manual_output_quantified_record_count: numberValue(
      project.manual_output_quantified_record_count,
    ),
  };
}

function normalizeKpi(record: KpiRecord): KpiRecord {
  const normalized = {
    ...record,
    approval_year: numberValue(record.approval_year),
    value_numeric: nullableNumber(record.value_numeric),
    is_quantified: booleanValue(record.is_quantified),
    is_safe_to_aggregate: booleanValue(record.is_safe_to_aggregate),
  };

  if (
    normalized.project_number === '50010-002' &&
    normalized.indicator === 'traction_substations'
  ) {
    return {
      ...normalized,
      value_numeric: 33,
      value_qualifier: 'exact',
      measurement_basis: 'actual',
      delivery_status: 'completed_and_operational',
      source_output_evidence:
        'The 2025 environmental monitoring report records 33 traction-type box substations: 22 corridor substations and 11 field-station substations.',
      review_notes:
        'Corrected from the earlier 36-substation safeguards/design figure to the latest reported completed scope.',
    };
  }

  return normalized;
}

export async function loadPortfolioData(): Promise<PortfolioData> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/portfolio.json`);
  if (!response.ok) {
    throw new Error(`Could not load portfolio data (${response.status}).`);
  }
  const payload = (await response.json()) as RawPortfolioPayload;

  return {
    projects: rowObjects<Project>(payload.project_headers, payload.project_rows).map(
      normalizeProject,
    ),
    kpis: rowObjects<KpiRecord>(payload.kpi_headers, payload.kpi_rows).map(
      normalizeKpi,
    ),
    recipients: rowObjects<RecipientAllocation>(
      payload.recipient_headers,
      payload.recipient_rows,
    ).map((row) => ({
      ...row,
      approval_year: numberValue(row.approval_year),
      funding_usd_m: numberValue(row.funding_usd_m),
      share_of_project_funding: numberValue(row.share_of_project_funding),
    })),
    modalities: rowObjects<ModalityAllocation>(
      payload.modality_headers,
      payload.modality_rows,
    ).map((row) => ({
      ...row,
      approval_year: numberValue(row.approval_year),
      funding_usd_m: numberValue(row.funding_usd_m),
      share_of_project_funding: numberValue(row.share_of_project_funding),
    })),
    subthemes: rowObjects<SubthemeRecord>(
      payload.subtheme_headers,
      payload.subtheme_rows,
    ),
    dimensions: rowObjects<DimensionRecord>(
      payload.dimension_headers,
      payload.dimension_rows,
    ),
  };
}
