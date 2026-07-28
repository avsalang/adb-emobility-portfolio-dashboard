export type RawValue = string | number | boolean | null;

export interface RawPortfolioPayload {
  [key: string]: unknown;
  project_headers: string[];
  project_rows: RawValue[][];
  kpi_headers: string[];
  kpi_rows: RawValue[][];
  subtheme_headers: string[];
  subtheme_rows: RawValue[][];
  dimension_headers: string[];
  dimension_rows: RawValue[][];
  recipient_headers: string[];
  recipient_rows: RawValue[][];
  modality_headers: string[];
  modality_rows: RawValue[][];
}

export interface Project {
  project_number: string;
  project_title: string;
  project_url: string;
  approval_year: number;
  project_stage: string;
  status: string;
  recipient: string;
  region: string;
  sector: string;
  project_type: string;
  modality: string;
  mode_assistance: string;
  funding_currency: string;
  funding_total: number;
  funding_total_usd_m: number;
  funding_basis: string;
  funding_note: string;
  analysis_confidence: string;
  manual_attribution_class: string;
  manual_taxonomy_confidence: string;
  manual_subthemes: string;
  manual_value_chain_stages: string;
  manual_vehicle_modes: string;
  manual_support_action_types: string;
  manual_geographic_context: string;
  manual_emobility_activity_location: string;
  manual_cross_cutting_focus: string;
  manual_implementation_scale: string;
  manual_emobility_role: string;
  manual_funding_attribution: string;
  manual_output_kpi_record_count: number;
  manual_output_quantified_record_count: number;
  manual_output_primary_profile: string;
  [key: string]: RawValue | undefined;
}

export interface KpiRecord {
  kpi_id: string;
  project_number: string;
  project_title: string;
  project_url: string;
  approval_year: number;
  recipient: string;
  sector: string;
  project_type: string;
  modality: string;
  project_status: string;
  results_level: string;
  kpi_family: string;
  indicator: string;
  analysis_subcategory: string;
  status_group: string;
  aggregation_bucket: string;
  vehicle_or_mode: string;
  value_numeric: number | null;
  unit: string;
  value_qualifier: string;
  measurement_basis: string;
  delivery_status: string;
  emobility_attribution: string;
  is_quantified: boolean;
  is_safe_to_aggregate: boolean;
  taxonomy_confidence: string;
  source_output_evidence: string;
  review_notes: string;
}

export interface RecipientAllocation {
  project_number: string;
  project_title: string;
  approval_year: number;
  recipient_original: string;
  allocated_recipient: string;
  recipient_type: string;
  funding_usd_m: number;
  share_of_project_funding: number;
  allocation_method: string;
  allocation_confidence: string;
  status: string;
  project_url: string;
}

export interface ModalityAllocation {
  project_number: string;
  project_title: string;
  approval_year: number;
  recipient: string;
  status: string;
  modality: string;
  generalized_assistance_type: string;
  funding_usd_m: number;
  share_of_project_funding: number;
  split_method: string;
  split_confidence: string;
  amount_basis: string;
  project_url: string;
}

export interface SubthemeRecord {
  project_number: string;
  project_title: string;
  project_url: string;
  subtheme: string;
  emobility_role: string;
  funding_attribution: string;
  attribution_class: string;
  confidence: string;
  evidence_summary: string;
}

export interface DimensionRecord {
  project_number: string;
  project_title: string;
  project_url: string;
  dimension_type: string;
  dimension_value: string;
  emobility_role: string;
  confidence: string;
}

export interface PortfolioData {
  projects: Project[];
  kpis: KpiRecord[];
  recipients: RecipientAllocation[];
  modalities: ModalityAllocation[];
  subthemes: SubthemeRecord[];
  dimensions: DimensionRecord[];
}

export interface Filters {
  search: string;
  status: string;
  recipient: string;
  sector: string;
  subtheme: string;
  assistance: string;
  attribution: string;
  yearStart: number;
  yearEnd: number;
}
