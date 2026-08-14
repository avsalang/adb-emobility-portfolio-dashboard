import type {
  KpiRecord,
  ModalityAllocation,
  Project,
  RecipientAllocation,
} from './types';

export const COLORS = {
  navy: '#0d2742',
  blue: '#1769aa',
  sky: '#4ea8de',
  teal: '#178f8f',
  green: '#2a9d8f',
  amber: '#e9a62d',
  coral: '#df6b55',
  plum: '#735a83',
  rose: '#b56576',
  slate: '#64748b',
};

export const SUBTHEME_COLORS: Record<string, string> = {
  vehicles_and_fleet_transition: '#1769aa',
  charging_swapping_and_power_system_integration: '#178f8f',
  depots_operations_and_maintenance: '#e9a62d',
  manufacturing_supply_chains_and_battery_circularity: '#735a83',
  finance_business_models_and_market_development: '#2a9d8f',
  policy_planning_and_institutional_capacity: '#df6b55',
  digital_mobility_and_fleet_systems: '#4b7aa6',
  integrated_and_enabling_transport_infrastructure: '#b56576',
};

export const STATUS_COLORS: Record<string, string> = {
  Active: '#178f8f',
  Approved: '#1769aa',
  Proposed: '#e9a62d',
  Closed: '#64748b',
};

export const ASSISTANCE_COLORS: Record<string, string> = {
  Loan: '#1769aa',
  Grant: '#2a9d8f',
  TA: '#e9a62d',
};

export function splitTags(value: string | undefined | null): string[] {
  return String(value ?? '')
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function humanize(value: string): string {
  const replacements: Record<string, string> = {
    TA: 'Technical assistance',
    partial_or_mixed: 'Partial or mixed',
    indirect_or_potential: 'Indirect or potential',
    quantified_minimum: 'Quantified minimum',
    dedicated: 'Dedicated',
    other: 'Other',
    finance_market: 'Finance and market development',
    policy_capacity: 'Policy and institutional capacity',
    fleet_deployment: 'Vehicle and fleet deployment',
    charging_energy_integration: 'Charging and energy integration',
    integrated_transport_infrastructure: 'Integrated transport infrastructure',
    digital_systems: 'Digital mobility systems',
    depots_operations: 'Depots and operations',
    manufacturing_battery: 'Manufacturing and batteries',
    service_coverage: 'Service coverage',
    knowledge_policy_or_capacity_output_only:
      'Policy, knowledge and capacity outputs',
    planned_or_financed_physical_output: 'Planned or financed physical outputs',
    delivered_or_operational_physical_output:
      'Delivered or operational physical outputs',
    finance_input_or_eligibility_only: 'Financing or eligibility only',
    no_distinct_or_only_potential_emobility_output:
      'No distinct or only potential e-mobility output',
    physical_output_in_progress: 'Physical outputs in progress',
    ev_public_transport_detailed_design_and_procurement_support:
      'EV public transport detailed design and procurement support',
  };
  if (replacements[value]) return replacements[value];

  const acronymReplacements: Record<string, string> = {
    adb: 'ADB',
    adf: 'ADF',
    ato: 'ATO',
    brt: 'BRT',
    bsrdcl: 'BSRDCL',
    carec: 'CAREC',
    cng: 'CNG',
    damri: 'DAMRI',
    dfi: 'DFI',
    ev: 'EV',
    gcf: 'GCF',
    gel: 'GEL',
    inr: 'INR',
    its: 'ITS',
    lez: 'LEZ',
    msme: 'MSME',
    nmt: 'NMT',
    ocr: 'OCR',
    sltb: 'SLTB',
    sme: 'SME',
    stem: 'STEM',
    ta: 'TA',
    thb: 'THB',
    ulez: 'ULEZ',
    usd: 'USD',
  };

  let label = value
    .replace(/_/g, ' ')
    .replace(/\be[\s-]?mobility\b/gi, 'e-mobility')
    .replace(/\be[\s-]?bus\b/gi, 'e-bus')
    .replace(/\be[\s-]?rickshaw\b/gi, 'e-rickshaw')
    .replace(/\be[\s-]?motorcycle\b/gi, 'e-motorcycle')
    .replace(/\btuktuk\b/gi, 'tuk-tuk')
    .replace(/\bplug in\b/gi, 'plug-in')
    .replace(/\blithium ion\b/gi, 'lithium-ion')
    .trim()
    .toLowerCase();

  label = label.replace(/\b[a-z]+\b/g, (word) => acronymReplacements[word] ?? word);
  return label.replace(/^[a-z]/, (character) => character.toUpperCase());
}

export function shortSubtheme(value: string): string {
  const labels: Record<string, string> = {
    vehicles_and_fleet_transition: 'Vehicles & fleet transition',
    charging_swapping_and_power_system_integration: 'Charging & power integration',
    depots_operations_and_maintenance: 'Depots, operations & maintenance',
    manufacturing_supply_chains_and_battery_circularity:
      'Manufacturing & battery circularity',
    finance_business_models_and_market_development: 'Finance & market development',
    policy_planning_and_institutional_capacity: 'Policy & institutional capacity',
    digital_mobility_and_fleet_systems: 'Digital mobility & fleet systems',
    integrated_and_enabling_transport_infrastructure:
      'Integrated & enabling infrastructure',
  };
  return labels[value] ?? humanize(value);
}

export function formatVehicleMode(value: string): string {
  const labels: Record<string, string> = {
    electric_vehicle_unspecified: 'Electric vehicles',
    plug_in_electric_vehicle_unspecified: 'Plug-in electric vehicles',
    hybrid_electric_vehicle_unspecified: 'Hybrid electric vehicles',
    electric_mobility_unspecified: 'General e-mobility',
    e_mobility_unspecified: 'General e-mobility',
    electric_public_transport_unspecified: 'Electric public transport',
    electric_public_transport_vehicle_unspecified:
      'Electric public transport vehicles',
    electric_vehicle_based_public_transport_unspecified:
      'Electric public transport',
    electric_bus_unspecified: 'Electric buses',
    electric_commercial_vehicle_unspecified: 'Electric commercial vehicles',
    electric_distribution_vehicle_unspecified: 'Electric distribution vehicles',
    electric_last_mile_vehicle_unspecified: 'Electric last-mile vehicles',
    electric_training_vehicle_unspecified: 'Electric training vehicles',
    new_energy_bus_technology_mix_unspecified: 'New-energy bus technology mix',
    electric_vehicle_unspecified_as_pipeline_option:
      'Electric vehicles as a pipeline option',
    electric_vehicle_unspecified_existing_and_growing_national_fleet:
      'Electric vehicles in the national fleet',
    electric_vehicle_unspecified_as_distribution_grid_load:
      'Electric vehicles as distribution-grid load',
    electric_mobility_unspecified_as_potential_country_extension:
      'General e-mobility as a potential country extension',
    e_mobility_unspecified_as_fund_pipeline: 'General e-mobility fund pipeline',
    electric_vehicle_unspecified_for_charging_network:
      'Electric vehicles supported by the charging network',
    low_carbon_fleet_unspecified: 'Low-carbon fleets',
    small_commercial_vehicle_with_ev_share_unspecified:
      'Small commercial vehicles with an EV component',
  };

  return labels[value] ?? humanize(value).replace(/\bunspecified\b/i, 'not further specified');
}

export function fmtMoney(value: number, compact = false): string {
  if (compact) {
    if (value >= 1000) return `$${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}B`;
    return `$${value.toFixed(value >= 100 ? 0 : 1)}M`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 100 ? 0 : 1,
  }).format(value * 1_000_000);
}

export function fmtNumber(value: number, maximumFractionDigits = 0): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits }).format(value);
}

export function formatKpiValue(
  value: number,
  unit: string,
  qualifier = '',
): string {
  const number = fmtNumber(value, Number.isInteger(value) ? 0 : 3);
  const unitFormats: Record<string, string> = {
    usd_million: `$${number}M`,
    gel_million: `GEL ${number} million`,
    thb_billion: `THB ${number} billion`,
    inr_billion: `INR ${number} billion`,
    percent: `${number}%`,
    percent_complete: `${number}% complete`,
    kilometers: `${number} km`,
    kilowatts: `${number} kW`,
    megawatts: `${number} MW`,
    megawatt_hours: `${number} MWh`,
    gigawatt_hours_capacity: `${number} GWh`,
    megavolt_amperes: `${number} MVA`,
    million_passengers_per_year: `${number} million passengers/year`,
    passengers_per_day: `${number} passengers/day`,
    million_vehicles: `${number} million vehicles`,
    person_months: `${number} person-months`,
    not_applicable: number,
  };
  const valueWithUnit =
    unitFormats[unit] ??
    `${number} ${humanize(unit).replace(/^[A-Z]/, (character) => character.toLowerCase())}`;
  const qualifierLabels: Record<string, string> = {
    up_to: 'Up to',
    approximately: 'Approximately',
    at_least: 'At least',
    inferred: 'Estimated',
  };
  const qualifierLabel = qualifierLabels[qualifier];

  return qualifierLabel ? `${qualifierLabel} ${valueWithUnit}` : valueWithUnit;
}

export function fmtPercent(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value);
}

export function sum<T>(rows: T[], getter: (row: T) => number): number {
  return rows.reduce((total, row) => total + getter(row), 0);
}

export function groupCount<T>(rows: T[], getter: (row: T) => string) {
  const result = new Map<string, number>();
  rows.forEach((row) => {
    const key = getter(row) || 'Not specified';
    result.set(key, (result.get(key) ?? 0) + 1);
  });
  return [...result.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export type EmobilityRole = 'Principal' | 'Partial' | 'Indirect';

export function emobilityRole(
  project: Pick<Project, 'manual_attribution_class'>,
): EmobilityRole {
  if (
    project.manual_attribution_class === 'dedicated' ||
    project.manual_attribution_class === 'other'
  ) {
    return 'Principal';
  }
  if (project.manual_attribution_class === 'indirect_or_potential') {
    return 'Indirect';
  }
  return 'Partial';
}

export function dedicatedEmobilityFunding(project: Project): number | null {
  if (project.manual_attribution_class === 'dedicated') {
    return project.funding_total_usd_m;
  }
  if (
    project.manual_attribution_class === 'quantified_minimum' &&
    project.manual_funding_attribution ===
      'minimum_20_percent_or_usd20_million'
  ) {
    return 20;
  }
  return null;
}

export function projectYearBasis(project: Project): string {
  return project.status === 'Proposed' ? 'Expected approval year' : 'Approval year';
}

export function dedicatedFundingBasis(project: Project): string {
  if (project.manual_attribution_class === 'dedicated') {
    return 'Full project value';
  }
  if (dedicatedEmobilityFunding(project) !== null) {
    return 'Quantified minimum';
  }
  return 'Not separately quantified';
}

function fitWorksheetColumns(
  worksheet: { ['!cols']?: { wch?: number }[]; ['!autofilter']?: { ref: string } },
  rows: Record<string, unknown>[],
) {
  const columnName = (index: number) => {
    let name = '';
    for (let value = index + 1; value > 0; value = Math.floor((value - 1) / 26)) {
      name = String.fromCharCode(65 + ((value - 1) % 26)) + name;
    }
    return name;
  };
  const headers = Object.keys(rows[0] ?? {});
  worksheet['!cols'] = headers.map((header) => ({
    wch: Math.min(
      45,
      Math.max(
        12,
        header.length + 2,
        ...rows.slice(0, 250).map((row) => String(row[header] ?? '').length + 2),
      ),
    ),
  }));
  if (headers.length && rows.length) {
    const lastColumn = columnName(headers.length - 1);
    worksheet['!autofilter'] = { ref: `A1:${lastColumn}${rows.length + 1}` };
  }
}

export async function downloadPortfolioWorkbook({
  projects,
  recipients,
  modalities,
  kpis,
}: {
  projects: Project[];
  recipients: RecipientAllocation[];
  modalities: ModalityAllocation[];
  kpis: KpiRecord[];
}) {
  const XLSX = await import('xlsx');
  const projectIds = new Set(projects.map((project) => project.project_number));
  const projectRows = projects.map((project) => ({
    project_number: project.project_number,
    project_title: project.project_title,
    project_url: project.project_url,
    approval_or_expected_year: project.approval_year,
    year_basis: projectYearBasis(project),
    status: project.status,
    recipient: project.recipient,
    sector: project.sector,
    project_type: project.project_type,
    modality: project.modality,
    mode_assistance: project.mode_assistance,
    associated_funding_usd_m: project.funding_total_usd_m,
    identified_emobility_funding_usd_m:
      dedicatedEmobilityFunding(project),
    identified_emobility_funding_basis: dedicatedFundingBasis(project),
    emobility_role: emobilityRole(project),
    subthemes: project.manual_subthemes,
    value_chain_stages: project.manual_value_chain_stages,
    vehicle_modes: project.manual_vehicle_modes,
    activity_location: project.manual_emobility_activity_location,
    implementation_scale: project.manual_implementation_scale,
    cross_cutting_focus: project.manual_cross_cutting_focus,
  }));
  const recipientRows = recipients
    .filter((row) => projectIds.has(row.project_number))
    .map((row) => ({ ...row }));
  const modalityRows = modalities
    .filter((row) => projectIds.has(row.project_number))
    .map((row) => ({ ...row }));
  const kpiRows = kpis
    .filter((row) => projectIds.has(row.project_number))
    .map((row) => ({ ...row }));

  const workbook = XLSX.utils.book_new();
  [
    ['Projects', projectRows],
    ['Recipient Funding', recipientRows],
    ['Modality Funding', modalityRows],
    ['KPIs', kpiRows],
  ].forEach(([name, rows]) => {
    const typedRows = rows as Record<string, unknown>[];
    const worksheet = XLSX.utils.json_to_sheet(typedRows);
    fitWorksheetColumns(worksheet, typedRows);
    XLSX.utils.book_append_sheet(workbook, worksheet, name as string);
  });
  XLSX.writeFile(workbook, 'ato_adb_emobility_portfolio_filtered.xlsx', {
    compression: true,
  });
}
