import type { Project } from './types';

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
  };
  if (replacements[value]) return replacements[value];
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
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

export function projectSearchText(project: Project): string {
  return [
    project.project_number,
    project.project_title,
    project.recipient,
    project.sector,
    project.manual_vehicle_modes,
    project.manual_subthemes,
    project.manual_emobility_activity_location,
  ]
    .join(' ')
    .toLowerCase();
}

export function downloadProjectsCsv(projects: Project[]) {
  const headers = [
    'project_number',
    'project_title',
    'approval_year',
    'status',
    'recipient',
    'sector',
    'project_type',
    'modality',
    'funding_total_usd_m',
    'manual_attribution_class',
    'manual_subthemes',
    'manual_value_chain_stages',
    'manual_vehicle_modes',
    'manual_emobility_activity_location',
    'project_url',
  ];
  const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const csv = [
    headers.join(','),
    ...projects.map((project) =>
      headers.map((header) => escape(project[header])).join(','),
    ),
  ].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'ato_adb_emobility_projects_filtered.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}
