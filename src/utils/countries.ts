/**
 * IOC country code -> [ISO 3166-1 alpha-2, display name].
 * Used to turn the 3-letter codes tennis data uses into flags and names.
 */
const IOC: Record<string, [string, string]> = {
  ALG: ['DZ', 'Algeria'], AND: ['AD', 'Andorra'], ARG: ['AR', 'Argentina'], ARM: ['AM', 'Armenia'],
  AUS: ['AU', 'Australia'], AUT: ['AT', 'Austria'], AZE: ['AZ', 'Azerbaijan'], BAH: ['BS', 'Bahamas'],
  BAR: ['BB', 'Barbados'], BEL: ['BE', 'Belgium'], BIH: ['BA', 'Bosnia and Herzegovina'], BLR: ['BY', 'Belarus'],
  BOL: ['BO', 'Bolivia'], BRA: ['BR', 'Brazil'], BUL: ['BG', 'Bulgaria'], CAN: ['CA', 'Canada'],
  CHI: ['CL', 'Chile'], CHN: ['CN', 'China'], COL: ['CO', 'Colombia'], CRC: ['CR', 'Costa Rica'],
  CRO: ['HR', 'Croatia'], CYP: ['CY', 'Cyprus'], CZE: ['CZ', 'Czechia'], DEN: ['DK', 'Denmark'],
  DOM: ['DO', 'Dominican Republic'], ECU: ['EC', 'Ecuador'], EGY: ['EG', 'Egypt'], ESA: ['SV', 'El Salvador'],
  ESP: ['ES', 'Spain'], EST: ['EE', 'Estonia'], FIN: ['FI', 'Finland'], FRA: ['FR', 'France'],
  GBR: ['GB', 'Great Britain'], GEO: ['GE', 'Georgia'], GER: ['DE', 'Germany'], GRE: ['GR', 'Greece'],
  GUA: ['GT', 'Guatemala'], HKG: ['HK', 'Hong Kong'], HUN: ['HU', 'Hungary'], INA: ['ID', 'Indonesia'],
  IND: ['IN', 'India'], IRI: ['IR', 'Iran'], IRL: ['IE', 'Ireland'], ISL: ['IS', 'Iceland'],
  ISR: ['IL', 'Israel'], ITA: ['IT', 'Italy'], JAM: ['JM', 'Jamaica'], JOR: ['JO', 'Jordan'],
  JPN: ['JP', 'Japan'], KAZ: ['KZ', 'Kazakhstan'], KEN: ['KE', 'Kenya'], KGZ: ['KG', 'Kyrgyzstan'],
  KOR: ['KR', 'South Korea'], KSA: ['SA', 'Saudi Arabia'], KUW: ['KW', 'Kuwait'], LAT: ['LV', 'Latvia'],
  LBN: ['LB', 'Lebanon'], LIE: ['LI', 'Liechtenstein'], LTU: ['LT', 'Lithuania'], LUX: ['LU', 'Luxembourg'],
  MAR: ['MA', 'Morocco'], MAS: ['MY', 'Malaysia'], MDA: ['MD', 'Moldova'], MEX: ['MX', 'Mexico'],
  MKD: ['MK', 'North Macedonia'], MLT: ['MT', 'Malta'], MNE: ['ME', 'Montenegro'], MON: ['MC', 'Monaco'],
  NED: ['NL', 'Netherlands'], NGR: ['NG', 'Nigeria'], NOR: ['NO', 'Norway'], NZL: ['NZ', 'New Zealand'],
  PAK: ['PK', 'Pakistan'], PAR: ['PY', 'Paraguay'], PER: ['PE', 'Peru'], PHI: ['PH', 'Philippines'],
  POL: ['PL', 'Poland'], POR: ['PT', 'Portugal'], PUR: ['PR', 'Puerto Rico'], QAT: ['QA', 'Qatar'],
  ROU: ['RO', 'Romania'], RSA: ['ZA', 'South Africa'], RUS: ['RU', 'Russia'], SGP: ['SG', 'Singapore'],
  SLO: ['SI', 'Slovenia'], SMR: ['SM', 'San Marino'], SRB: ['RS', 'Serbia'], SRI: ['LK', 'Sri Lanka'],
  SUI: ['CH', 'Switzerland'], SVK: ['SK', 'Slovakia'], SWE: ['SE', 'Sweden'], SYR: ['SY', 'Syria'],
  THA: ['TH', 'Thailand'], TPE: ['TW', 'Chinese Taipei'], TUN: ['TN', 'Tunisia'], TUR: ['TR', 'Türkiye'],
  UAE: ['AE', 'United Arab Emirates'], UKR: ['UA', 'Ukraine'], URU: ['UY', 'Uruguay'], USA: ['US', 'United States'],
  UZB: ['UZ', 'Uzbekistan'], VEN: ['VE', 'Venezuela'], VIE: ['VN', 'Vietnam'], ZIM: ['ZW', 'Zimbabwe'],
};

// Some feeds use ISO alpha-3 instead of IOC for a few countries.
const ALIASES: Record<string, string> = {
  DEU: 'GER', NLD: 'NED', CHE: 'SUI', PRT: 'POR', HRV: 'CRO', GRC: 'GRE', DNK: 'DEN', IDN: 'INA',
  BGR: 'BUL', CHL: 'CHI', PRY: 'PAR', ZAF: 'RSA', SAU: 'KSA', TWN: 'TPE', ARE: 'UAE', LVA: 'LAT',
  SVN: 'SLO', MCO: 'MON', PHL: 'PHI', MYS: 'MAS', IRN: 'IRI', URY: 'URU', VNM: 'VIE',
};

export interface CountryInfo {
  ioc: string;
  countryCode: string;
  countryName: string;
}

export function countryFromIoc(code: string | null | undefined): CountryInfo {
  if (!code) return { ioc: '—', countryCode: '', countryName: 'Unknown' };
  const upper = code.trim().toUpperCase();
  const ioc = ALIASES[upper] ?? upper;
  const hit = IOC[ioc];
  return hit ? { ioc, countryCode: hit[0], countryName: hit[1] } : { ioc, countryCode: '', countryName: ioc };
}
