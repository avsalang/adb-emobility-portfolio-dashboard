import type { Project } from '../types';

export type LocationPrecision = 'site' | 'city' | 'subnational' | 'country';

interface Place {
  label: string;
  coordinates: [number, number];
  precision: Exclude<LocationPrecision, 'country'>;
}

export interface ProjectMapLocation {
  id: string;
  projectNumber: string;
  projectTitle: string;
  projectUrl: string;
  approvalYear: number;
  recipient: string;
  funding: number;
  reportedLocation: string;
  locationName: string;
  coordinates: [number, number];
  precision: LocationPrecision;
}

export const LOCATION_PRECISION_LABELS: Record<LocationPrecision, string> = {
  site: 'Site or corridor',
  city: 'City or metropolitan area',
  subnational: 'State or province',
  country: 'Economy-level fallback',
};

const COUNTRY_COORDINATES: Record<string, [number, number]> = {
  Armenia: [44.5, 40.1],
  Azerbaijan: [47.6, 40.1],
  Bangladesh: [90.4, 23.7],
  Bhutan: [90.4, 27.5],
  Cambodia: [104.9, 12.6],
  "China, People's Republic of": [104.2, 35.9],
  Fiji: [178.1, -17.8],
  Georgia: [43.4, 42.3],
  India: [78.9, 22.8],
  Indonesia: [117.5, -2.2],
  Kazakhstan: [67.0, 48.0],
  Kiribati: [-157.4, 1.9],
  'Kyrgyz Republic': [74.6, 41.2],
  "Lao People's Democratic Republic": [102.6, 19.9],
  Malaysia: [102.0, 4.2],
  Maldives: [73.2, 3.2],
  Mongolia: [103.8, 46.9],
  Myanmar: [96.0, 21.9],
  Nepal: [84.1, 28.4],
  Pakistan: [69.3, 30.4],
  Palau: [134.6, 7.5],
  'Papua New Guinea': [145.0, -6.3],
  Philippines: [122.5, 12.7],
  'Sri Lanka': [80.7, 7.9],
  Tajikistan: [71.0, 38.9],
  Thailand: [101.0, 15.9],
  'Timor-Leste': [125.7, -8.9],
  Tonga: [-175.2, -21.2],
  Türkiye: [35.2, 39.0],
  Uzbekistan: [64.6, 41.4],
  'Viet Nam': [108.3, 15.9],
};

const PLACES: Record<string, Place> = {
  aizawl: {
    label: 'Aizawl, Mizoram, India',
    coordinates: [92.7176, 23.7271],
    precision: 'city',
  },
  almaty: {
    label: 'Almaty, Kazakhstan',
    coordinates: [76.8829, 43.238],
    precision: 'city',
  },
  andhra_pradesh: {
    label: 'Andhra Pradesh, India',
    coordinates: [79.74, 15.9129],
    precision: 'subnational',
  },
  assam: {
    label: 'Assam, India',
    coordinates: [92.9376, 26.2006],
    precision: 'subnational',
  },
  baku_azadliq: {
    label: 'Azadliq Avenue corridor, Baku, Azerbaijan',
    coordinates: [49.8397, 40.4255],
    precision: 'site',
  },
  bangkok: {
    label: 'Bangkok, Thailand',
    coordinates: [100.5018, 13.7563],
    precision: 'city',
  },
  bekasi: {
    label: 'Bekasi, West Java, Indonesia',
    coordinates: [106.9831, -6.2734],
    precision: 'city',
  },
  betio: {
    label: 'Betio, South Tarawa, Kiribati',
    coordinates: [172.9211, 1.357],
    precision: 'site',
  },
  bhubaneswar: {
    label: 'Bhubaneswar, Odisha, India',
    coordinates: [85.8245, 20.2961],
    precision: 'city',
  },
  bihar: {
    label: 'Bihar, India',
    coordinates: [85.3131, 25.0961],
    precision: 'subnational',
  },
  bikenibeu: {
    label: 'Bikenibeu, South Tarawa, Kiribati',
    coordinates: [173.1245, 1.3673],
    precision: 'site',
  },
  bishkek: {
    label: 'Bishkek, Kyrgyz Republic',
    coordinates: [74.5698, 42.8746],
    precision: 'city',
  },
  bishnumati: {
    label: 'Bishnumati River corridor, Kathmandu Valley, Nepal',
    coordinates: [85.3098, 27.7172],
    precision: 'site',
  },
  bokhtar: {
    label: 'Bokhtar, Tajikistan',
    coordinates: [68.7803, 37.8364],
    precision: 'city',
  },
  bonriki: {
    label: 'Bonriki, South Tarawa, Kiribati',
    coordinates: [173.1482, 1.3816],
    precision: 'site',
  },
  cat_hai: {
    label: 'VinFast complex, Cat Hai, Viet Nam',
    coordinates: [106.787, 20.802],
    precision: 'site',
  },
  cuttack: {
    label: 'Cuttack, Odisha, India',
    coordinates: [85.8793, 20.4625],
    precision: 'city',
  },
  dangara: {
    label: 'Dangara, Tajikistan',
    coordinates: [69.339, 38.0958],
    precision: 'city',
  },
  davao: {
    label: 'Davao City, Philippines',
    coordinates: [125.6088, 7.0647],
    precision: 'city',
  },
  delhi: {
    label: 'Delhi, India',
    coordinates: [77.209, 28.6139],
    precision: 'subnational',
  },
  dushanbe: {
    label: 'Dushanbe, Tajikistan',
    coordinates: [68.787, 38.5598],
    precision: 'city',
  },
  gambir: {
    label: 'Gambir, Jakarta, Indonesia',
    coordinates: [106.8301, -6.1767],
    precision: 'site',
  },
  guian: {
    label: "Gui'an New District, Guizhou, People's Republic of China",
    coordinates: [106.463, 26.385],
    precision: 'city',
  },
  gujarat: {
    label: 'Gujarat, India',
    coordinates: [71.1924, 22.2587],
    precision: 'subnational',
  },
  ha_noi: {
    label: 'Ha Noi, Viet Nam',
    coordinates: [105.8342, 21.0278],
    precision: 'city',
  },
  haldwani: {
    label: 'Haldwani, Uttarakhand, India',
    coordinates: [79.5197, 29.2183],
    precision: 'city',
  },
  haryana: {
    label: 'Haryana, India',
    coordinates: [76.0856, 29.0588],
    precision: 'subnational',
  },
  ho_chi_minh_city: {
    label: 'Ho Chi Minh City, Viet Nam',
    coordinates: [106.6297, 10.8231],
    precision: 'city',
  },
  hyderabad_sindh: {
    label: 'Hyderabad, Sindh, Pakistan',
    coordinates: [68.3578, 25.396],
    precision: 'city',
  },
  imphal: {
    label: 'Imphal, Manipur, India',
    coordinates: [93.9386, 24.8108],
    precision: 'city',
  },
  jagadhri: {
    label: 'Jagadhri, Haryana, India',
    coordinates: [77.3019, 30.168],
    precision: 'site',
  },
  jakarta: {
    label: 'Jakarta, Indonesia',
    coordinates: [106.8229, -6.1944],
    precision: 'city',
  },
  java: {
    label: 'Western and central Java, Indonesia',
    coordinates: [110.0, -7.25],
    precision: 'subnational',
  },
  jiangsu: {
    label: "Jiangsu Province, People's Republic of China",
    coordinates: [119.455, 32.9711],
    precision: 'subnational',
  },
  jinan: {
    label: "Jinan, Shandong Province, People's Republic of China",
    coordinates: [117.1201, 36.6518],
    precision: 'city',
  },
  karnataka: {
    label: 'Karnataka, India',
    coordinates: [75.7139, 15.3173],
    precision: 'subnational',
  },
  karachi: {
    label: 'Karachi, Sindh, Pakistan',
    coordinates: [67.0011, 24.8607],
    precision: 'city',
  },
  karakol: {
    label: 'Karakol, Kyrgyz Republic',
    coordinates: [78.3956, 42.4782],
    precision: 'city',
  },
  kathmandu: {
    label: 'Kathmandu Valley, Nepal',
    coordinates: [85.3222, 27.7103],
    precision: 'city',
  },
  khiva: {
    label: 'Khiva, Uzbekistan',
    coordinates: [60.3603, 41.3775],
    precision: 'city',
  },
  kutaisi: {
    label: 'Kutaisi, Georgia',
    coordinates: [42.7044, 42.2679],
    precision: 'city',
  },
  lahore: {
    label: 'Lahore utility service area, Pakistan',
    coordinates: [74.3587, 31.5204],
    precision: 'city',
  },
  larkana: {
    label: 'Larkana, Sindh, Pakistan',
    coordinates: [68.2147, 27.559],
    precision: 'city',
  },
  lumbini: {
    label: 'Lumbini, Nepal',
    coordinates: [83.2766, 27.4844],
    precision: 'city',
  },
  madhya_pradesh: {
    label: 'Madhya Pradesh, India',
    coordinates: [78.6569, 22.9734],
    precision: 'subnational',
  },
  maharashtra: {
    label: 'Maharashtra, India',
    coordinates: [75.7139, 19.7515],
    precision: 'subnational',
  },
  mandaluyong: {
    label: 'Mandaluyong City, Metro Manila, Philippines',
    coordinates: [121.0543, 14.5794],
    precision: 'city',
  },
  metro_manila: {
    label: 'Metro Manila, Philippines',
    coordinates: [120.9842, 14.5995],
    precision: 'city',
  },
  multan: {
    label: 'Multan utility service area, Pakistan',
    coordinates: [71.5249, 30.1575],
    precision: 'city',
  },
  nonthaburi: {
    label: 'Nonthaburi, Thailand',
    coordinates: [100.5217, 13.8621],
    precision: 'city',
  },
  odisha: {
    label: 'Odisha, India',
    coordinates: [85.0985, 20.9517],
    precision: 'subnational',
  },
  panchkula: {
    label: 'Panchkula, Haryana, India',
    coordinates: [76.8606, 30.6942],
    precision: 'site',
  },
  panipat: {
    label: 'Panipat, Haryana, India',
    coordinates: [76.9635, 29.3909],
    precision: 'site',
  },
  peshawar: {
    label: 'Peshawar, Pakistan',
    coordinates: [71.5189, 34.0083],
    precision: 'city',
  },
  pokhara: {
    label: 'Pokhara Valley, Nepal',
    coordinates: [83.9856, 28.2096],
    precision: 'city',
  },
  rajasthan: {
    label: 'Rajasthan, India',
    coordinates: [74.2179, 27.0238],
    precision: 'subnational',
  },
  rangjung: {
    label: 'Rangjung, Bhutan',
    coordinates: [91.1763, 27.383],
    precision: 'site',
  },
  rawamangun: {
    label: 'Rawamangun, Jakarta, Indonesia',
    coordinates: [106.8867, -6.196],
    precision: 'site',
  },
  samthang: {
    label: 'Samthang, Bhutan',
    coordinates: [90.507, 27.193],
    precision: 'site',
  },
  siem_reap: {
    label: 'Siem Reap, Cambodia',
    coordinates: [103.8552, 13.3633],
    precision: 'city',
  },
  sukkur: {
    label: 'Sukkur, Sindh, Pakistan',
    coordinates: [68.8574, 27.7244],
    precision: 'city',
  },
  tamil_nadu: {
    label: 'Tamil Nadu, India',
    coordinates: [78.6569, 11.1271],
    precision: 'subnational',
  },
  telangana: {
    label: 'Telangana, India',
    coordinates: [79.0193, 18.1124],
    precision: 'subnational',
  },
  thimphu: {
    label: 'Thimphu, Bhutan',
    coordinates: [89.639, 27.4728],
    precision: 'city',
  },
  ulaanbaatar: {
    label: 'Ulaanbaatar, Mongolia',
    coordinates: [106.9155, 47.9221],
    precision: 'city',
  },
  uttar_pradesh: {
    label: 'Uttar Pradesh, India',
    coordinates: [80.9462, 26.8467],
    precision: 'subnational',
  },
  uttarakhand: {
    label: 'Uttarakhand, India',
    coordinates: [79.0193, 30.0668],
    precision: 'subnational',
  },
  vientiane: {
    label: "Vientiane, Lao People's Democratic Republic",
    coordinates: [102.6331, 17.9757],
    precision: 'city',
  },
  yerevan: {
    label: 'Yerevan, Armenia',
    coordinates: [44.5152, 40.1872],
    precision: 'city',
  },
};

const PROJECT_PLACES: Record<string, string[]> = {
  '39256-024': ['ulaanbaatar'],
  '39399-013': ['lumbini'],
  '40080-024': ['ha_noi'],
  '41074-012': ['mandaluyong'],
  '43207-012': ['metro_manila'],
  '44058-013': ['kathmandu'],
  '45041-002': ['vientiane'],
  '45296-006': ['davao'],
  '45296-007': ['davao'],
  '48289-002': ['peshawar'],
  '48356-001': ['aizawl'],
  '49450-030': ['betio', 'bikenibeu', 'bonriki'],
  '50010-001': ['jinan'],
  '50010-002': ['jinan'],
  '50296-002': ['thimphu', 'samthang', 'rangjung'],
  '51366-001': ['guian'],
  '53437-001': ['bangkok', 'nonthaburi'],
  '54123-001': ['bishkek'],
  '54128-001': ['siem_reap'],
  '54286-001': ['dangara', 'bokhtar'],
  '54356-001': ['java'],
  '54456-001': ['bekasi', 'gambir', 'rawamangun'],
  '55288-001': [
    'andhra_pradesh',
    'delhi',
    'haryana',
    'karnataka',
    'madhya_pradesh',
    'maharashtra',
    'rajasthan',
    'tamil_nadu',
    'telangana',
    'uttar_pradesh',
    'uttarakhand',
  ],
  '55327-001': ['cat_hai'],
  '55361-001': ['imphal'],
  '56111-001': ['almaty', 'bishkek'],
  '56236-001': ['metro_manila'],
  '56304-001': ['haldwani'],
  '56323-001': ['ha_noi', 'ho_chi_minh_city'],
  '57015-001': ['bangkok', 'jiangsu'],
  '57037-002': ['karakol'],
  '57087-001': ['bangkok'],
  '58092-001': ['metro_manila'],
  '58098-001': ['panchkula', 'jagadhri', 'panipat'],
  '58099-001': ['bhubaneswar', 'cuttack'],
  '58104-001': ['maharashtra', 'assam'],
  '58105-001': ['gujarat', 'haryana', 'maharashtra'],
  '58113-001': ['bihar'],
  '58182-001': ['jakarta'],
  '58217-001': ['kathmandu', 'pokhara'],
  '58270-001': ['dushanbe'],
  '58270-002': ['dushanbe'],
  '58329-001': [
    'yerevan',
    'kutaisi',
    'jakarta',
    'almaty',
    'bishkek',
    'kathmandu',
    'lumbini',
    'pokhara',
    'khiva',
  ],
  '58414-001': ['baku_azadliq'],
  '58474-001': ['yerevan'],
  '58477-001': ['jakarta'],
  '58541-001': ['lahore', 'multan', 'sukkur'],
  '59163-001': ['bishnumati'],
  '60332-001': ['hyderabad_sindh', 'larkana', 'sukkur', 'karachi'],
};

const PROJECT_COUNTRY_FOCUS: Record<string, string[]> = {
  '50370-001': ['Kyrgyz Republic', 'Indonesia', 'Bangladesh', 'Malaysia'],
  '53246-001': [
    'Cambodia',
    'Indonesia',
    'Philippines',
    'Thailand',
    'Viet Nam',
  ],
  '55119-001': ['Philippines'],
  '55140-001': ['Indonesia'],
  '57190-001': ['Nepal'],
  '58399-001': ['Indonesia', 'Philippines', 'Thailand', 'Viet Nam'],
  '58501-001': ['Cambodia', 'Fiji', 'Pakistan', 'Thailand', 'Viet Nam'],
  '59147-003': ['Azerbaijan', 'Thailand'],
  '59382-001': ['Indonesia', 'Philippines'],
};

const UNMAPPABLE_PROJECTS = new Set([
  '44102-012',
  '44233-012',
  '49413-001',
  '58155-001',
  '59376-001',
]);

function countryLocations(countries: string[]) {
  return countries.flatMap((country) => {
    const coordinates = COUNTRY_COORDINATES[country];
    if (!coordinates) return [];
    return [
      {
        label: country,
        coordinates,
        precision: 'country' as const,
      },
    ];
  });
}

export function buildProjectMapLocations(projects: Project[]) {
  return projects.flatMap<ProjectMapLocation>((project) => {
    if (UNMAPPABLE_PROJECTS.has(project.project_number)) return [];

    const explicitPlaces = PROJECT_PLACES[project.project_number]
      ?.map((placeKey) => PLACES[placeKey])
      .filter(Boolean);
    const focusedCountries = PROJECT_COUNTRY_FOCUS[project.project_number];
    const recipientCountries = project.recipient
      .split(';')
      .map((country) => country.trim())
      .filter((country) => country && country !== 'Regional');
    const locations =
      explicitPlaces?.length
        ? explicitPlaces
        : countryLocations(
            focusedCountries?.length ? focusedCountries : recipientCountries,
          );

    return locations.map((location, index) => ({
      id: `${project.project_number}-${index + 1}`,
      projectNumber: project.project_number,
      projectTitle: project.project_title,
      projectUrl: project.project_url,
      approvalYear: project.approval_year,
      recipient: project.recipient,
      funding: project.funding_total_usd_m,
      reportedLocation: project.manual_emobility_activity_location,
      locationName: location.label,
      coordinates: location.coordinates,
      precision: location.precision,
    }));
  });
}
