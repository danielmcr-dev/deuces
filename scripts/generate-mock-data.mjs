/**
 * Generates the mock JSON data used by Deuces while no real API is connected.
 *
 *   npm run generate:mocks
 *
 * Output:
 *   src/mocks/players.json        top 100 ATP + top 100 WTA player bios (incl. injury status)
 *   src/mocks/rankings-atp.json   ATP singles ranking (rank, previous rank, points)
 *   src/mocks/rankings-wta.json   WTA singles ranking
 *   src/mocks/news.json           ~20 news items
 *   src/mocks/tournaments.json    2026 season calendar with past champions
 *   public/images/news/*.svg      artwork for news items (no external image hosts needed)
 *
 * Everything is deterministic (seeded RNG) so the output is stable between runs.
 * Names are real professionals, but rankings, points, injuries and news are SAMPLE DATA.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mocksDir = path.join(root, 'src', 'mocks');
const newsImgDir = path.join(root, 'public', 'images', 'news');
fs.mkdirSync(mocksDir, { recursive: true });
fs.mkdirSync(newsImgDir, { recursive: true });

// ---------------------------------------------------------------- helpers
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261018);
const between = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const slug = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (dateStr, n) => {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return iso(d);
};
const write = (file, data) => {
  fs.writeFileSync(path.join(mocksDir, file), JSON.stringify(data, null, 2) + '\n');
  console.log('wrote', file);
};

// IOC code -> [ISO 3166 alpha-2, country name]
const COUNTRIES = {
  ARG: ['AR', 'Argentina'], AUS: ['AU', 'Australia'], AUT: ['AT', 'Austria'], BEL: ['BE', 'Belgium'],
  BLR: ['BY', 'Belarus'], BRA: ['BR', 'Brazil'], BUL: ['BG', 'Bulgaria'], CAN: ['CA', 'Canada'],
  CHI: ['CL', 'Chile'], CHN: ['CN', 'China'], COL: ['CO', 'Colombia'], CRO: ['HR', 'Croatia'],
  CZE: ['CZ', 'Czechia'], DEN: ['DK', 'Denmark'], ESP: ['ES', 'Spain'], FRA: ['FR', 'France'],
  GBR: ['GB', 'Great Britain'], GER: ['DE', 'Germany'], GRE: ['GR', 'Greece'], HUN: ['HU', 'Hungary'],
  ITA: ['IT', 'Italy'], JPN: ['JP', 'Japan'], KAZ: ['KZ', 'Kazakhstan'], LAT: ['LV', 'Latvia'],
  MEX: ['MX', 'Mexico'], MON: ['MC', 'Monaco'], NED: ['NL', 'Netherlands'], NOR: ['NO', 'Norway'],
  NZL: ['NZ', 'New Zealand'], PHI: ['PH', 'Philippines'], POL: ['PL', 'Poland'], POR: ['PT', 'Portugal'],
  ROU: ['RO', 'Romania'], RUS: ['RU', 'Russia'], SRB: ['RS', 'Serbia'], SLO: ['SI', 'Slovenia'],
  SUI: ['CH', 'Switzerland'], SVK: ['SK', 'Slovakia'], SWE: ['SE', 'Sweden'], UKR: ['UA', 'Ukraine'],
  USA: ['US', 'United States'], QAT: ['QA', 'Qatar'], UAE: ['AE', 'United Arab Emirates'],
  KOR: ['KR', 'South Korea'], MAR: ['MA', 'Morocco'], SAU: ['SA', 'Saudi Arabia'], EGY: ['EG', 'Egypt'],
};

// ---------------------------------------------------------------- players
// [name, IOC, optional bio override: birthDate, heightCm, plays, backhand]
const ATP = [
  ['Jannik Sinner', 'ITA', '2001-08-16', 191, 'Right', 'Two-handed'],
  ['Carlos Alcaraz', 'ESP', '2003-05-05', 183, 'Right', 'Two-handed'],
  ['Alexander Zverev', 'GER', '1997-04-20', 198, 'Right', 'Two-handed'],
  ['Novak Djokovic', 'SRB', '1987-05-22', 188, 'Right', 'Two-handed'],
  ['Taylor Fritz', 'USA', '1997-10-28', 196, 'Right', 'Two-handed'],
  ['Jack Draper', 'GBR', '2001-12-22', 193, 'Left', 'Two-handed'],
  ['Lorenzo Musetti', 'ITA', '2002-03-03', 185, 'Right', 'One-handed'],
  ['Alex de Minaur', 'AUS', '1999-02-17', 183, 'Right', 'Two-handed'],
  ['Ben Shelton', 'USA', '2002-10-09', 193, 'Left', 'Two-handed'],
  ['Felix Auger-Aliassime', 'CAN', '2000-08-08', 193, 'Right', 'Two-handed'],
  ['Holger Rune', 'DEN', '2003-04-11', 188, 'Right', 'Two-handed'],
  ['Daniil Medvedev', 'RUS', '1996-02-11', 198, 'Right', 'Two-handed'],
  ['Joao Fonseca', 'BRA', '2006-08-21', 183, 'Right', 'Two-handed'],
  ['Jakub Mensik', 'CZE', '2005-09-01', 193, 'Right', 'Two-handed'],
  ['Andrey Rublev', 'RUS', '1997-10-20', 188, 'Right', 'Two-handed'],
  ['Casper Ruud', 'NOR', '1998-12-22', 183, 'Right', 'Two-handed'],
  ['Tommy Paul', 'USA', '1997-05-17', 185, 'Right', 'Two-handed'],
  ['Karen Khachanov', 'RUS', '1996-05-21', 198, 'Right', 'Two-handed'],
  ['Stefanos Tsitsipas', 'GRE', '1998-08-12', 193, 'Right', 'One-handed'],
  ['Jiri Lehecka', 'CZE', '2001-11-08', 185, 'Right', 'Two-handed'],
  ['Francisco Cerundolo', 'ARG', '1998-08-13', 186, 'Right', 'Two-handed'],
  ['Alejandro Davidovich Fokina', 'ESP', '1999-06-05', 183, 'Right', 'Two-handed'],
  ['Ugo Humbert', 'FRA', '1998-06-26', 188, 'Left', 'Two-handed'],
  ['Frances Tiafoe', 'USA', '1998-01-20', 188, 'Right', 'Two-handed'],
  ['Alexander Bublik', 'KAZ', '1997-06-17', 196, 'Right', 'Two-handed'],
  ['Tomas Machac', 'CZE', '2000-10-13', 183, 'Right', 'Two-handed'],
  ['Hubert Hurkacz', 'POL', '1997-02-11', 196, 'Right', 'Two-handed'],
  ['Flavio Cobolli', 'ITA', '2002-05-06', 183, 'Right', 'Two-handed'],
  ['Learner Tien', 'USA', '2005-12-02', 180, 'Left', 'Two-handed'],
  ['Grigor Dimitrov', 'BUL', '1991-05-16', 191, 'Right', 'One-handed'],
  ['Arthur Fils', 'FRA', '2004-06-12', 185, 'Right', 'Two-handed'],
  ['Alex Michelsen', 'USA', '2004-08-25', 193, 'Right', 'Two-handed'],
  ['Valentin Vacherot', 'MON', '1998-11-16', 193, 'Right', 'Two-handed'],
  ['Luciano Darderi', 'ITA', '2002-02-14', 183, 'Right', 'Two-handed'],
  ['Tallon Griekspoor', 'NED', '1996-07-02', 188, 'Right', 'Two-handed'],
  ['Brandon Nakashima', 'USA', '2001-08-03', 188, 'Right', 'Two-handed'],
  ['Denis Shapovalov', 'CAN', '1999-04-15', 185, 'Left', 'One-handed'],
  ['Giovanni Mpetshi Perricard', 'FRA', '2003-07-08', 203, 'Right', 'One-handed'],
  ['Sebastian Korda', 'USA', '2000-07-05', 196, 'Right', 'Two-handed'],
  ['Alexei Popyrin', 'AUS', '1999-08-05', 196, 'Right', 'Two-handed'],
  ['Arthur Rinderknech', 'FRA', '1995-07-23', 196, 'Right', 'Two-handed'],
  ['Matteo Berrettini', 'ITA', '1996-04-12', 196, 'Right', 'Two-handed'],
  ['Alejandro Tabilo', 'CHI', '1997-06-02', 188, 'Left', 'Two-handed'],
  ['Jaume Munar', 'ESP', '1997-05-05', 183, 'Right', 'Two-handed'],
  ['Cameron Norrie', 'GBR', '1995-08-23', 188, 'Left', 'Two-handed'],
  ['Tomas Martin Etcheverry', 'ARG', '1999-07-18', 196, 'Right', 'Two-handed'],
  ['Mariano Navone', 'ARG'],
  ['Sebastian Baez', 'ARG', '2000-12-28', 170, 'Right', 'Two-handed'],
  ['Gael Monfils', 'FRA', '1986-09-01', 193, 'Right', 'Two-handed'],
  ['Miomir Kecmanovic', 'SRB'],
  ['Marcos Giron', 'USA'],
  ['Jenson Brooksby', 'USA'],
  ['Reilly Opelka', 'USA', '1997-08-28', 211, 'Right', 'Two-handed'],
  ['Francisco Comesana', 'ARG'],
  ['Zizou Bergs', 'BEL'],
  ['Jan-Lennard Struff', 'GER'],
  ['Rinky Hijikata', 'AUS'],
  ['Yoshihito Nishioka', 'JPN', '1995-09-27', 170, 'Left', 'Two-handed'],
  ['Marton Fucsovics', 'HUN'],
  ['Quentin Halys', 'FRA'],
  ['Corentin Moutet', 'FRA', '1999-04-19', 175, 'Left', 'Two-handed'],
  ['Benjamin Bonzi', 'FRA'],
  ['Gabriel Diallo', 'CAN', '2001-09-24', 203, 'Right', 'Two-handed'],
  ['Daniel Altmaier', 'GER'],
  ['Lorenzo Sonego', 'ITA'],
  ['Matteo Arnaldi', 'ITA'],
  ['Pedro Martinez', 'ESP'],
  ['Fabian Marozsan', 'HUN'],
  ['Shang Juncheng', 'CHN', '2005-02-02', 180, 'Left', 'Two-handed'],
  ['Zhang Zhizhen', 'CHN'],
  ['Pablo Carreno Busta', 'ESP'],
  ['Roberto Bautista Agut', 'ESP'],
  ['Adrian Mannarino', 'FRA', '1988-06-29', 183, 'Left', 'Two-handed'],
  ['Sebastian Ofner', 'AUT'],
  ['Hamad Medjedovic', 'SRB'],
  ['Alexandre Muller', 'FRA'],
  ['Vit Kopriva', 'CZE'],
  ['Nuno Borges', 'POR'],
  ['Jordan Thompson', 'AUS'],
  ['Thanasi Kokkinakis', 'AUS'],
  ['Aleksandar Vukic', 'AUS'],
  ['Adam Walton', 'AUS'],
  ['Ethan Quinn', 'USA'],
  ['Nishesh Basavareddy', 'USA'],
  ['Dino Prizmic', 'CRO'],
  ['Jacob Fearnley', 'GBR'],
  ['Shintaro Mochizuki', 'JPN'],
  ['Roberto Carballes Baena', 'ESP'],
  ['Aleksandar Kovacevic', 'USA'],
  ['Emilio Nava', 'USA'],
  ['Juan Manuel Cerundolo', 'ARG'],
  ['Camilo Ugo Carabelli', 'ARG'],
  ['Valentin Royer', 'FRA'],
  ['Hugo Gaston', 'FRA', '2000-09-26', 173, 'Left', 'Two-handed'],
  ['Terence Atmane', 'FRA'],
  ['Martin Landaluce', 'ESP'],
  ['Kamil Majchrzak', 'POL'],
  ['Mattia Bellucci', 'ITA', '2001-06-01', 178, 'Left', 'Two-handed'],
  ['Stan Wawrinka', 'SUI', '1985-03-28', 183, 'Right', 'One-handed'],
  ['Laslo Djere', 'SRB'],
];

const WTA = [
  ['Aryna Sabalenka', 'BLR', '1998-05-05', 182, 'Right', 'Two-handed'],
  ['Iga Swiatek', 'POL', '2001-05-31', 176, 'Right', 'Two-handed'],
  ['Coco Gauff', 'USA', '2004-03-13', 175, 'Right', 'Two-handed'],
  ['Amanda Anisimova', 'USA', '2001-08-31', 180, 'Right', 'Two-handed'],
  ['Jessica Pegula', 'USA', '1994-02-24', 170, 'Right', 'Two-handed'],
  ['Elena Rybakina', 'KAZ', '1999-06-17', 184, 'Right', 'Two-handed'],
  ['Mirra Andreeva', 'RUS', '2007-04-29', 171, 'Right', 'Two-handed'],
  ['Madison Keys', 'USA', '1995-02-17', 178, 'Right', 'Two-handed'],
  ['Jasmine Paolini', 'ITA', '1996-01-04', 163, 'Right', 'Two-handed'],
  ['Emma Navarro', 'USA', '2001-05-18', 170, 'Right', 'Two-handed'],
  ['Victoria Mboko', 'CAN', '2006-08-26', 178, 'Right', 'Two-handed'],
  ['Karolina Muchova', 'CZE', '1996-08-21', 180, 'Right', 'Two-handed'],
  ['Ekaterina Alexandrova', 'RUS', '1994-11-15', 178, 'Right', 'Two-handed'],
  ['Elina Svitolina', 'UKR', '1994-09-12', 174, 'Right', 'Two-handed'],
  ['Belinda Bencic', 'SUI', '1997-03-10', 175, 'Right', 'Two-handed'],
  ['Linda Noskova', 'CZE', '2004-11-17', 178, 'Right', 'Two-handed'],
  ['Clara Tauson', 'DEN', '2002-12-21', 180, 'Right', 'Two-handed'],
  ['Diana Shnaider', 'RUS', '2004-04-02', 175, 'Left', 'Two-handed'],
  ['Jelena Ostapenko', 'LAT', '1997-06-08', 177, 'Right', 'Two-handed'],
  ['Zheng Qinwen', 'CHN', '2002-10-08', 178, 'Right', 'Two-handed'],
  ['Liudmila Samsonova', 'RUS', '1998-11-11', 182, 'Right', 'Two-handed'],
  ['Leylah Fernandez', 'CAN', '2002-09-06', 168, 'Left', 'Two-handed'],
  ['Naomi Osaka', 'JPN', '1997-10-16', 180, 'Right', 'Two-handed'],
  ['Marta Kostyuk', 'UKR', '2002-06-28', 175, 'Right', 'Two-handed'],
  ['Barbora Krejcikova', 'CZE', '1995-12-18', 178, 'Right', 'Two-handed'],
  ['Paula Badosa', 'ESP', '1997-11-15', 180, 'Right', 'Two-handed'],
  ['Emma Raducanu', 'GBR', '2002-11-13', 175, 'Right', 'Two-handed'],
  ['Elise Mertens', 'BEL', '1995-11-17', 178, 'Right', 'Two-handed'],
  ['Veronika Kudermetova', 'RUS'],
  ['Marketa Vondrousova', 'CZE', '1999-06-28', 172, 'Left', 'Two-handed'],
  ['McCartney Kessler', 'USA'],
  ['Iva Jovic', 'USA'],
  ['Sofia Kenin', 'USA'],
  ['Danielle Collins', 'USA'],
  ['Dayana Yastremska', 'UKR'],
  ['Beatriz Haddad Maia', 'BRA', '1996-05-30', 185, 'Left', 'Two-handed'],
  ['Marie Bouzkova', 'CZE'],
  ['Magda Linette', 'POL'],
  ['Anna Kalinskaya', 'RUS'],
  ['Daria Kasatkina', 'AUS'],
  ['Magdalena Frech', 'POL'],
  ['Maria Sakkari', 'GRE'],
  ['Katerina Siniakova', 'CZE'],
  ['Sorana Cirstea', 'ROU'],
  ['Lois Boisson', 'FRA'],
  ['Alexandra Eala', 'PHI', '2005-05-23', 173, 'Left', 'Two-handed'],
  ['Ashlyn Krueger', 'USA'],
  ['Peyton Stearns', 'USA'],
  ['Maya Joint', 'AUS'],
  ['Wang Xinyu', 'CHN'],
  ['Cristina Bucsa', 'ESP'],
  ['Anastasia Potapova', 'RUS'],
  ['Kamilla Rakhimova', 'RUS'],
  ['Anastasia Pavlyuchenkova', 'RUS'],
  ['Victoria Azarenka', 'BLR', '1989-07-31', 180, 'Right', 'Two-handed'],
  ['Yulia Putintseva', 'KAZ'],
  ['Ajla Tomljanovic', 'AUS'],
  ['Alycia Parks', 'USA'],
  ['Renata Zarazua', 'MEX'],
  ['Lucia Bronzetti', 'ITA'],
  ['Elisabetta Cocciaretto', 'ITA'],
  ['Rebecca Sramkova', 'SVK'],
  ['Elena-Gabriela Ruse', 'ROU'],
  ['Sonay Kartal', 'GBR'],
  ['Katie Boulter', 'GBR'],
  ['Julia Grabher', 'AUT'],
  ['Panna Udvardy', 'HUN'],
  ['Lulu Sun', 'NZL', '2001-04-14', 170, 'Left', 'Two-handed'],
  ['Moyuka Uchijima', 'JPN'],
  ['Yuliia Starodubtseva', 'UKR'],
  ['Polina Kudermetova', 'RUS'],
  ['Tatjana Maria', 'GER'],
  ['Laura Siegemund', 'GER'],
  ['Eva Lys', 'GER'],
  ['Dalma Galfi', 'HUN'],
  ['Varvara Gracheva', 'FRA'],
  ['Diane Parry', 'FRA'],
  ['Elsa Jacquemot', 'FRA'],
  ['Antonia Ruzic', 'CRO'],
  ['Donna Vekic', 'CRO'],
  ['Anna Bondar', 'HUN'],
  ['Karolina Pliskova', 'CZE'],
  ['Tereza Valentova', 'CZE'],
  ['Suzan Lamens', 'NED'],
  ['Kristina Mladenovic', 'FRA'],
  ['Tamara Zidansek', 'SLO'],
  ['Sara Errani', 'ITA'],
  ['Hailey Baptiste', 'USA'],
  ['Ann Li', 'USA'],
  ['Taylor Townsend', 'USA', '1996-04-16', 170, 'Left', 'Two-handed'],
  ['Caty McNally', 'USA'],
  ['Bernarda Pera', 'USA', '1994-12-03', 183, 'Left', 'Two-handed'],
  ['Shelby Rogers', 'USA'],
  ['Katie Volynets', 'USA'],
  ['Jaqueline Cristian', 'ROU'],
  ['Anhelina Kalinina', 'UKR'],
  ['Viktoriya Tomova', 'BUL'],
  ['Camila Osorio', 'COL'],
  ['Mayar Sherif', 'EGY'],
  ['Arantxa Rus', 'NED', '1990-12-13', 178, 'Left', 'Two-handed'],
];

if (ATP.length !== 100 || WTA.length !== 100) {
  throw new Error(`Need 100 players per tour (ATP ${ATP.length}, WTA ${WTA.length})`);
}

function splitName(name) {
  // Chinese players are listed family name first.
  const familyFirst = ['Zheng', 'Wang', 'Shang', 'Zhang'];
  const parts = name.split(' ');
  if (familyFirst.includes(parts[0])) return { firstName: parts.slice(1).join(' '), lastName: parts[0] };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

// Mock injuries. Dates are relative to the mid-October 2026 data snapshot.
const INJURIES = {
  'Jack Draper': ['Injured', 'Left arm (bone bruise)', '2026-08-28', null],
  'Holger Rune': ['Returning', 'Achilles tendon rupture (recovered)', '2026-03-10', '2026-10-26'],
  'Matteo Berrettini': ['Injured', 'Abdominal strain', '2026-09-30', '2026-11-02'],
  'Sebastian Korda': ['Injured', 'Shin stress reaction', '2026-08-12', '2027-01-05'],
  'Hubert Hurkacz': ['Returning', 'Knee surgery rehabilitation', '2026-06-20', '2026-10-19'],
  'Grigor Dimitrov': ['Injured', 'Pectoral muscle tear', '2026-09-22', null],
  'Arthur Fils': ['Returning', 'Lower back stress fracture', '2026-05-30', '2026-10-27'],
  'Nishesh Basavareddy': ['Injured', 'Wrist sprain', '2026-10-05', '2026-11-15'],
  'Thanasi Kokkinakis': ['Injured', 'Pectoral surgery', '2026-07-14', '2027-01-12'],
  'Nuno Borges': ['Injured', 'Ankle sprain', '2026-10-09', '2026-10-30'],
  'Paula Badosa': ['Injured', 'Lower back (stress injury)', '2026-09-08', null],
  'Zheng Qinwen': ['Returning', 'Elbow surgery rehabilitation', '2026-07-02', '2026-10-19'],
  'Marketa Vondrousova': ['Injured', 'Shoulder inflammation', '2026-09-15', '2026-11-30'],
  'Emma Raducanu': ['Injured', 'Foot (plantar fascia)', '2026-10-02', '2026-10-28'],
  'Danielle Collins': ['Injured', 'Abdominal strain', '2026-08-30', null],
  'Maria Sakkari': ['Returning', 'Shoulder', '2026-08-01', '2026-10-25'],
  'Naomi Osaka': ['Injured', 'Abdominal strain', '2026-10-07', '2026-11-04'],
  'Victoria Azarenka': ['Injured', 'Shoulder', '2026-09-12', null],
  'Ajla Tomljanovic': ['Returning', 'Back surgery rehabilitation', '2026-04-18', '2026-10-26'],
  'Barbora Krejcikova': ['Injured', 'Thigh strain', '2026-10-01', '2026-11-08'],
};

function buildTour(list, tour) {
  const players = [];
  const rankings = [];
  // Points: hand-tuned top 10, then a power-law tail (#10 ≈ 3500, #100 ≈ 600).
  const TOP10 = tour === 'ATP'
    ? [11250, 9840, 6930, 5810, 4925, 4510, 4180, 3960, 3745, 3550]
    : [10870, 8395, 7290, 6280, 5583, 5230, 4810, 4320, 4035, 3720];
  list.forEach(([name, ioc, birthDate, heightCm, plays, backhand], i) => {
    const rank = i + 1;
    const [countryCode, countryName] = COUNTRIES[ioc];
    const { firstName, lastName } = splitName(name);
    const id = slug(name);
    const points = rank <= 10 ? TOP10[i] : Math.round((600 * Math.pow(100 / rank, 0.77)) / 5) * 5 + between(0, 4) * 5;
    // Last week's points: small swings for most players, big ones for a few.
    const swing = rand() < 0.12 ? (rand() - 0.5) * 0.5 : (rand() - 0.5) * 0.08;
    const previousPoints = rank === 1 ? points : Math.round(points * (1 - swing));
    const genBirthYear = between(1994, 2005);
    const bio = {
      birthDate: birthDate ?? `${genBirthYear}-${String(between(1, 12)).padStart(2, '0')}-${String(between(1, 28)).padStart(2, '0')}`,
      heightCm: heightCm ?? (tour === 'ATP' ? between(175, 198) : between(165, 183)),
      plays: plays ?? (rand() < 0.14 ? 'Left' : 'Right'),
      backhand: backhand ?? (rand() < (tour === 'ATP' ? 0.12 : 0.03) ? 'One-handed' : 'Two-handed'),
    };
    const birthYear = Number(bio.birthDate.slice(0, 4));
    const careerHighRank = Math.max(1, rank - (rank <= 3 ? 0 : between(0, Math.min(rank - 1, Math.round(rank * 0.6)))));
    const highYear = Math.min(2026, Math.max(birthYear + 19, between(2016, 2026)));
    const titlesThisSeason =
      rank <= 2 ? between(5, 8) : rank <= 10 ? between(1, 4) : rank <= 30 ? between(0, 2) : rand() < 0.15 ? 1 : 0;
    const age = 2026 - birthYear;
    const careerTitles = titlesThisSeason + Math.max(0, Math.round((age - 18) * (rank <= 5 ? 3.5 : rank <= 20 ? 1 : 0.3) * rand()));

    const inj = INJURIES[name];
    players.push({
      id,
      tour,
      name,
      firstName,
      lastName,
      ioc,
      countryCode,
      countryName,
      ...bio,
      turnedPro: Math.max(birthYear + 16, Math.min(2025, birthYear + between(16, 19))),
      careerHighRank,
      careerHighDate: rank === careerHighRank ? '2026-10-12' : `${highYear}-${String(between(1, 12)).padStart(2, '0')}-${String(between(1, 28)).padStart(2, '0')}`,
      titlesThisSeason,
      careerTitles: rank === 4 && tour === 'ATP' ? 101 : careerTitles,
      status: inj ? inj[0] : 'Active',
      injury: inj ? { description: inj[1], dateReported: inj[2], expectedReturn: inj[3] } : null,
    });
    rankings.push({ rank, previousPoints, playerId: id, points });
  });

  // Previous rank = position when ordered by last week's points.
  const byPrev = [...rankings].sort((a, b) => b.previousPoints - a.previousPoints);
  byPrev.forEach((e, i) => (e.previousRank = i + 1));
  return {
    players,
    rankings: rankings.map(({ rank, previousRank, playerId, points }) => ({ rank, previousRank, playerId, points })),
  };
}

const atp = buildTour(ATP, 'ATP');
const wta = buildTour(WTA, 'WTA');
write('players.json', [...atp.players, ...wta.players]);
write('rankings-atp.json', { tour: 'ATP', rankingDate: '2026-10-12', entries: atp.rankings });
write('rankings-wta.json', { tour: 'WTA', rankingDate: '2026-10-12', entries: wta.rankings });

// ---------------------------------------------------------------- tournaments
// Real singles champions for Grand Slams, 1000s and the Finals (2016–2025).
// null = event not held that year.
const H = {
  ao: {
    ATP: ['Novak Djokovic', 'Roger Federer', 'Roger Federer', 'Novak Djokovic', 'Novak Djokovic', 'Novak Djokovic', 'Rafael Nadal', 'Novak Djokovic', 'Jannik Sinner', 'Jannik Sinner'],
    WTA: ['Angelique Kerber', 'Serena Williams', 'Caroline Wozniacki', 'Naomi Osaka', 'Sofia Kenin', 'Naomi Osaka', 'Ashleigh Barty', 'Aryna Sabalenka', 'Aryna Sabalenka', 'Madison Keys'],
  },
  rg: {
    ATP: ['Novak Djokovic', 'Rafael Nadal', 'Rafael Nadal', 'Rafael Nadal', 'Rafael Nadal', 'Novak Djokovic', 'Rafael Nadal', 'Novak Djokovic', 'Carlos Alcaraz', 'Carlos Alcaraz'],
    WTA: ['Garbiñe Muguruza', 'Jelena Ostapenko', 'Simona Halep', 'Ashleigh Barty', 'Iga Swiatek', 'Barbora Krejcikova', 'Iga Swiatek', 'Iga Swiatek', 'Iga Swiatek', 'Coco Gauff'],
  },
  wim: {
    ATP: ['Andy Murray', 'Roger Federer', 'Novak Djokovic', 'Novak Djokovic', null, 'Novak Djokovic', 'Novak Djokovic', 'Carlos Alcaraz', 'Carlos Alcaraz', 'Jannik Sinner'],
    WTA: ['Serena Williams', 'Garbiñe Muguruza', 'Angelique Kerber', 'Simona Halep', null, 'Ashleigh Barty', 'Elena Rybakina', 'Marketa Vondrousova', 'Barbora Krejcikova', 'Iga Swiatek'],
  },
  uso: {
    ATP: ['Stan Wawrinka', 'Rafael Nadal', 'Novak Djokovic', 'Rafael Nadal', 'Dominic Thiem', 'Daniil Medvedev', 'Carlos Alcaraz', 'Novak Djokovic', 'Jannik Sinner', 'Carlos Alcaraz'],
    WTA: ['Angelique Kerber', 'Sloane Stephens', 'Naomi Osaka', 'Bianca Andreescu', 'Naomi Osaka', 'Emma Raducanu', 'Iga Swiatek', 'Coco Gauff', 'Aryna Sabalenka', 'Aryna Sabalenka'],
  },
  iw: {
    ATP: ['Novak Djokovic', 'Roger Federer', 'Juan Martin del Potro', 'Dominic Thiem', null, 'Cameron Norrie', 'Taylor Fritz', 'Carlos Alcaraz', 'Carlos Alcaraz', 'Jack Draper'],
    WTA: ['Victoria Azarenka', 'Elena Vesnina', 'Naomi Osaka', 'Bianca Andreescu', null, 'Paula Badosa', 'Iga Swiatek', 'Elena Rybakina', 'Iga Swiatek', 'Mirra Andreeva'],
  },
  miami: {
    ATP: ['Novak Djokovic', 'Roger Federer', 'John Isner', 'Roger Federer', null, 'Hubert Hurkacz', 'Carlos Alcaraz', 'Daniil Medvedev', 'Jannik Sinner', 'Jakub Mensik'],
    WTA: ['Victoria Azarenka', 'Johanna Konta', 'Sloane Stephens', 'Ashleigh Barty', null, 'Ashleigh Barty', 'Iga Swiatek', 'Petra Kvitova', 'Danielle Collins', 'Aryna Sabalenka'],
  },
  mc: {
    ATP: ['Rafael Nadal', 'Rafael Nadal', 'Rafael Nadal', 'Fabio Fognini', null, 'Stefanos Tsitsipas', 'Stefanos Tsitsipas', 'Andrey Rublev', 'Stefanos Tsitsipas', 'Carlos Alcaraz'],
  },
  madrid: {
    ATP: ['Novak Djokovic', 'Rafael Nadal', 'Alexander Zverev', 'Novak Djokovic', null, 'Alexander Zverev', 'Carlos Alcaraz', 'Carlos Alcaraz', 'Andrey Rublev', 'Casper Ruud'],
    WTA: ['Simona Halep', 'Simona Halep', 'Petra Kvitova', 'Kiki Bertens', null, 'Aryna Sabalenka', 'Ons Jabeur', 'Aryna Sabalenka', 'Iga Swiatek', 'Aryna Sabalenka'],
  },
  rome: {
    ATP: ['Andy Murray', 'Alexander Zverev', 'Rafael Nadal', 'Rafael Nadal', 'Novak Djokovic', 'Rafael Nadal', 'Novak Djokovic', 'Daniil Medvedev', 'Alexander Zverev', 'Carlos Alcaraz'],
    WTA: ['Serena Williams', 'Elina Svitolina', 'Elina Svitolina', 'Karolina Pliskova', 'Simona Halep', 'Iga Swiatek', 'Iga Swiatek', 'Elena Rybakina', 'Iga Swiatek', 'Jasmine Paolini'],
  },
  canada: {
    ATP: ['Novak Djokovic', 'Alexander Zverev', 'Rafael Nadal', 'Rafael Nadal', null, 'Daniil Medvedev', 'Pablo Carreno Busta', 'Jannik Sinner', 'Alexei Popyrin', 'Ben Shelton'],
    WTA: ['Simona Halep', 'Elina Svitolina', 'Simona Halep', 'Bianca Andreescu', null, 'Camila Giorgi', 'Simona Halep', 'Jessica Pegula', 'Jessica Pegula', 'Victoria Mboko'],
  },
  cincy: {
    ATP: ['Marin Cilic', 'Grigor Dimitrov', 'Novak Djokovic', 'Daniil Medvedev', 'Novak Djokovic', 'Alexander Zverev', 'Borna Coric', 'Novak Djokovic', 'Jannik Sinner', 'Carlos Alcaraz'],
    WTA: ['Karolina Pliskova', 'Garbiñe Muguruza', 'Kiki Bertens', 'Madison Keys', 'Victoria Azarenka', 'Ashleigh Barty', 'Caroline Garcia', 'Coco Gauff', 'Aryna Sabalenka', 'Iga Swiatek'],
  },
  shanghai: {
    ATP: ['Andy Murray', 'Roger Federer', 'Novak Djokovic', 'Daniil Medvedev', null, null, null, 'Hubert Hurkacz', 'Jannik Sinner', 'Valentin Vacherot'],
  },
  paris: {
    ATP: ['Andy Murray', 'Jack Sock', 'Karen Khachanov', 'Novak Djokovic', 'Daniil Medvedev', 'Novak Djokovic', 'Holger Rune', 'Novak Djokovic', 'Alexander Zverev', 'Jannik Sinner'],
  },
  beijing: {
    ATP: ['Andy Murray', 'Rafael Nadal', 'Nikoloz Basilashvili', 'Dominic Thiem', null, null, null, 'Jannik Sinner', 'Carlos Alcaraz', 'Jannik Sinner'],
    WTA: ['Agnieszka Radwanska', 'Caroline Garcia', 'Caroline Wozniacki', 'Naomi Osaka', null, null, null, 'Iga Swiatek', 'Coco Gauff', 'Amanda Anisimova'],
  },
  wuhan: {
    WTA: ['Petra Kvitova', 'Caroline Garcia', 'Aryna Sabalenka', 'Aryna Sabalenka', null, null, null, null, 'Aryna Sabalenka', 'Coco Gauff'],
  },
  atpFinals: {
    ATP: ['Andy Murray', 'Grigor Dimitrov', 'Alexander Zverev', 'Stefanos Tsitsipas', 'Daniil Medvedev', 'Alexander Zverev', 'Novak Djokovic', 'Novak Djokovic', 'Jannik Sinner', 'Jannik Sinner'],
  },
  wtaFinals: {
    WTA: ['Dominika Cibulkova', 'Caroline Wozniacki', 'Elina Svitolina', 'Ashleigh Barty', null, 'Garbiñe Muguruza', 'Caroline Garcia', 'Iga Swiatek', 'Coco Gauff', 'Elena Rybakina'],
  },
};

// Era-appropriate pools used to fill SAMPLE champion histories for 250/500 events.
const POOLS = {
  ATP: {
    early: ['Dominic Thiem', 'Kei Nishikori', 'David Goffin', 'Roberto Bautista Agut', 'Gael Monfils', 'Nick Kyrgios', 'Milos Raonic', 'Richard Gasquet', 'Lucas Pouille', 'Diego Schwartzman', 'Pablo Carreno Busta', 'Alexander Zverev', 'Marin Cilic', 'Grigor Dimitrov', 'Jo-Wilfried Tsonga', 'Fabio Fognini'],
    mid: ['Andrey Rublev', 'Casper Ruud', 'Felix Auger-Aliassime', 'Taylor Fritz', 'Cameron Norrie', 'Hubert Hurkacz', 'Daniil Medvedev', 'Stefanos Tsitsipas', 'Karen Khachanov', 'Lorenzo Sonego', 'Alex de Minaur', 'Holger Rune', 'Sebastian Korda'],
    late: ['Jannik Sinner', 'Carlos Alcaraz', 'Alex de Minaur', 'Taylor Fritz', 'Tommy Paul', 'Ugo Humbert', 'Jack Draper', 'Arthur Fils', 'Jiri Lehecka', 'Alexander Bublik', 'Joao Fonseca', 'Lorenzo Musetti', 'Ben Shelton', 'Holger Rune', 'Tomas Machac', 'Flavio Cobolli'],
  },
  WTA: {
    early: ['Karolina Pliskova', 'Elina Svitolina', 'Petra Kvitova', 'Caroline Wozniacki', 'Julia Goerges', 'Kiki Bertens', 'Daria Kasatkina', 'Madison Keys', 'Elise Mertens', 'Anett Kontaveit', 'Belinda Bencic', 'Aryna Sabalenka', 'Johanna Konta', 'Garbiñe Muguruza'],
    mid: ['Ons Jabeur', 'Anett Kontaveit', 'Paula Badosa', 'Jessica Pegula', 'Daria Kasatkina', 'Barbora Krejcikova', 'Veronika Kudermetova', 'Liudmila Samsonova', 'Beatriz Haddad Maia', 'Elena Rybakina', 'Belinda Bencic', 'Coco Gauff'],
    late: ['Jessica Pegula', 'Elena Rybakina', 'Jasmine Paolini', 'Mirra Andreeva', 'Diana Shnaider', 'Emma Navarro', 'Ekaterina Alexandrova', 'Clara Tauson', 'Linda Noskova', 'Amanda Anisimova', 'Karolina Muchova', 'McCartney Kessler', 'Marta Kostyuk', 'Leylah Fernandez'],
  },
};
const YEARS = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

function sampleChampions(tour, cancelled2020) {
  return YEARS.map((year) => {
    if (year === 2020 && cancelled2020) return null;
    const era = year <= 2019 ? 'early' : year <= 2022 ? 'mid' : 'late';
    return pick(POOLS[tour][era]);
  });
}

// [id, name, city, IOC, venue, tours, tier, surface, indoor, start, end, historyKey?]
// tours: 'ATP' | 'WTA' | 'BOTH'
const CAL = [
  ['brisbane', 'Brisbane International', 'Brisbane', 'AUS', 'Queensland Tennis Centre', 'BOTH', '250', 'Hard', false, '2026-01-04', '2026-01-11', null, { WTA: '500' }],
  ['hong-kong', 'Bank of China Hong Kong Tennis Open', 'Hong Kong', 'CHN', 'Victoria Park', 'ATP', '250', 'Hard', false, '2026-01-05', '2026-01-11'],
  ['auckland-wta', 'ASB Classic (WTA)', 'Auckland', 'NZL', 'ASB Tennis Centre', 'WTA', '250', 'Hard', false, '2026-01-05', '2026-01-11'],
  ['adelaide', 'Adelaide International', 'Adelaide', 'AUS', 'Memorial Drive', 'BOTH', '250', 'Hard', false, '2026-01-11', '2026-01-17', null, { WTA: '500' }],
  ['auckland-atp', 'ASB Classic (ATP)', 'Auckland', 'NZL', 'ASB Tennis Centre', 'ATP', '250', 'Hard', false, '2026-01-12', '2026-01-17'],
  ['hobart', 'Hobart International', 'Hobart', 'AUS', 'Domain Tennis Centre', 'WTA', '250', 'Hard', false, '2026-01-12', '2026-01-17'],
  ['australian-open', 'Australian Open', 'Melbourne', 'AUS', 'Melbourne Park', 'BOTH', 'Grand Slam', 'Hard', false, '2026-01-18', '2026-02-01', 'ao'],
  ['montpellier', 'Open Occitanie', 'Montpellier', 'FRA', 'Sud de France Arena', 'ATP', '250', 'Hard', true, '2026-02-02', '2026-02-08'],
  ['abu-dhabi', 'Mubadala Abu Dhabi Open', 'Abu Dhabi', 'UAE', 'Zayed Sports City', 'WTA', '500', 'Hard', false, '2026-02-02', '2026-02-08'],
  ['doha-wta', 'Qatar TotalEnergies Open', 'Doha', 'QAT', 'Khalifa International Tennis Complex', 'WTA', '1000', 'Hard', false, '2026-02-08', '2026-02-14'],
  ['rotterdam', 'ABN AMRO Open', 'Rotterdam', 'NED', 'Ahoy', 'ATP', '500', 'Hard', true, '2026-02-09', '2026-02-15'],
  ['dallas', 'Dallas Open', 'Dallas', 'USA', 'Ford Center at The Star', 'ATP', '500', 'Hard', true, '2026-02-09', '2026-02-15'],
  ['buenos-aires', 'IEB+ Argentina Open', 'Buenos Aires', 'ARG', 'Buenos Aires Lawn Tennis Club', 'ATP', '250', 'Clay', false, '2026-02-09', '2026-02-15'],
  ['dubai-wta', 'Dubai Duty Free Tennis Championships (WTA)', 'Dubai', 'UAE', 'Dubai Duty Free Tennis Stadium', 'WTA', '1000', 'Hard', false, '2026-02-15', '2026-02-21'],
  ['doha-atp', 'Qatar ExxonMobil Open', 'Doha', 'QAT', 'Khalifa International Tennis Complex', 'ATP', '500', 'Hard', false, '2026-02-16', '2026-02-21'],
  ['rio', 'Rio Open', 'Rio de Janeiro', 'BRA', 'Jockey Club Brasileiro', 'ATP', '500', 'Clay', false, '2026-02-16', '2026-02-22'],
  ['delray-beach', 'Delray Beach Open', 'Delray Beach', 'USA', 'Delray Beach Tennis Center', 'ATP', '250', 'Hard', false, '2026-02-16', '2026-02-22'],
  ['dubai-atp', 'Dubai Duty Free Tennis Championships (ATP)', 'Dubai', 'UAE', 'Dubai Duty Free Tennis Stadium', 'ATP', '500', 'Hard', false, '2026-02-23', '2026-02-28'],
  ['acapulco', 'Abierto Mexicano Telcel', 'Acapulco', 'MEX', 'Arena GNP Seguros', 'ATP', '500', 'Hard', false, '2026-02-23', '2026-02-28'],
  ['santiago', 'Chile Open', 'Santiago', 'CHI', 'Club San Carlos de Apoquindo', 'ATP', '250', 'Clay', false, '2026-02-23', '2026-03-01'],
  ['merida', 'Merida Open Akron', 'Merida', 'MEX', 'Yucatan Country Club', 'WTA', '500', 'Hard', false, '2026-02-23', '2026-03-01'],
  ['indian-wells', 'BNP Paribas Open', 'Indian Wells', 'USA', 'Indian Wells Tennis Garden', 'BOTH', '1000', 'Hard', false, '2026-03-04', '2026-03-15', 'iw'],
  ['miami', 'Miami Open', 'Miami', 'USA', 'Hard Rock Stadium', 'BOTH', '1000', 'Hard', false, '2026-03-17', '2026-03-29', 'miami'],
  ['houston', "U.S. Men's Clay Court Championship", 'Houston', 'USA', 'River Oaks Country Club', 'ATP', '250', 'Clay', false, '2026-03-30', '2026-04-05'],
  ['marrakech', 'Grand Prix Hassan II', 'Marrakech', 'MAR', 'Royal Tennis Club', 'ATP', '250', 'Clay', false, '2026-03-30', '2026-04-05'],
  ['charleston', 'Credit One Charleston Open', 'Charleston', 'USA', 'Credit One Stadium', 'WTA', '500', 'Clay', false, '2026-03-30', '2026-04-05'],
  ['monte-carlo', 'Rolex Monte-Carlo Masters', 'Monte Carlo', 'MON', 'Monte-Carlo Country Club', 'ATP', '1000', 'Clay', false, '2026-04-05', '2026-04-12', 'mc'],
  ['barcelona', 'Barcelona Open Banc Sabadell', 'Barcelona', 'ESP', 'Real Club de Tenis Barcelona', 'ATP', '500', 'Clay', false, '2026-04-13', '2026-04-19'],
  ['munich', 'BMW Open', 'Munich', 'GER', 'MTTC Iphitos', 'ATP', '500', 'Clay', false, '2026-04-13', '2026-04-19'],
  ['stuttgart-wta', 'Porsche Tennis Grand Prix', 'Stuttgart', 'GER', 'Porsche Arena', 'WTA', '500', 'Clay', true, '2026-04-13', '2026-04-19'],
  ['madrid', 'Mutua Madrid Open', 'Madrid', 'ESP', 'Caja Mágica', 'BOTH', '1000', 'Clay', false, '2026-04-22', '2026-05-03', 'madrid'],
  ['rome', "Internazionali BNL d'Italia", 'Rome', 'ITA', 'Foro Italico', 'BOTH', '1000', 'Clay', false, '2026-05-06', '2026-05-17', 'rome'],
  ['hamburg', 'Bitpanda Hamburg Open', 'Hamburg', 'GER', 'Rothenbaum', 'ATP', '500', 'Clay', false, '2026-05-17', '2026-05-23'],
  ['geneva', 'Gonet Geneva Open', 'Geneva', 'SUI', 'Tennis Club de Genève', 'ATP', '250', 'Clay', false, '2026-05-17', '2026-05-23'],
  ['strasbourg', 'Internationaux de Strasbourg', 'Strasbourg', 'FRA', 'Tennis Club de Strasbourg', 'WTA', '500', 'Clay', false, '2026-05-17', '2026-05-23'],
  ['roland-garros', 'Roland Garros', 'Paris', 'FRA', 'Stade Roland Garros', 'BOTH', 'Grand Slam', 'Clay', false, '2026-05-24', '2026-06-07', 'rg'],
  ['stuttgart-atp', 'Boss Open', 'Stuttgart', 'GER', 'Tennisclub Weissenhof', 'ATP', '250', 'Grass', false, '2026-06-08', '2026-06-14'],
  ['s-hertogenbosch', 'Libéma Open', "'s-Hertogenbosch", 'NED', 'Autotron', 'BOTH', '250', 'Grass', false, '2026-06-08', '2026-06-14'],
  ['queens-wta', 'HSBC Championships (WTA)', 'London', 'GBR', "Queen's Club", 'WTA', '500', 'Grass', false, '2026-06-08', '2026-06-14'],
  ['halle', 'Terra Wortmann Open', 'Halle', 'GER', 'OWL Arena', 'ATP', '500', 'Grass', false, '2026-06-15', '2026-06-21'],
  ['queens-atp', 'HSBC Championships (ATP)', 'London', 'GBR', "Queen's Club", 'ATP', '500', 'Grass', false, '2026-06-15', '2026-06-21'],
  ['berlin', 'Berlin Tennis Open', 'Berlin', 'GER', 'Steffi Graf Stadium', 'WTA', '500', 'Grass', false, '2026-06-15', '2026-06-21'],
  ['mallorca', 'Mallorca Championships', 'Mallorca', 'ESP', 'Santa Ponsa Tennis Club', 'ATP', '250', 'Grass', false, '2026-06-21', '2026-06-27'],
  ['eastbourne', 'Lexus Eastbourne Open', 'Eastbourne', 'GBR', 'Devonshire Park', 'BOTH', '250', 'Grass', false, '2026-06-21', '2026-06-27', null, { WTA: '500' }],
  ['bad-homburg', 'Bad Homburg Open', 'Bad Homburg', 'GER', 'TC Bad Homburg', 'WTA', '500', 'Grass', false, '2026-06-21', '2026-06-27'],
  ['wimbledon', 'Wimbledon', 'London', 'GBR', 'All England Club', 'BOTH', 'Grand Slam', 'Grass', false, '2026-06-29', '2026-07-12', 'wim'],
  ['bastad', 'Nordea Open', 'Båstad', 'SWE', 'Båstad Tennis Stadium', 'BOTH', '250', 'Clay', false, '2026-07-13', '2026-07-19'],
  ['gstaad', 'EFG Swiss Open Gstaad', 'Gstaad', 'SUI', 'Roy Emerson Arena', 'ATP', '250', 'Clay', false, '2026-07-13', '2026-07-19'],
  ['newport', 'Infosys Hall of Fame Open', 'Newport', 'USA', 'International Tennis Hall of Fame', 'ATP', '250', 'Grass', false, '2026-07-13', '2026-07-19'],
  ['umag', 'Plava Laguna Croatia Open', 'Umag', 'CRO', 'Stadion Stella Maris', 'ATP', '250', 'Clay', false, '2026-07-20', '2026-07-26'],
  ['kitzbuhel', 'Generali Open', 'Kitzbühel', 'AUT', 'Tennis Stadium Kitzbühel', 'ATP', '250', 'Clay', false, '2026-07-20', '2026-07-26'],
  ['prague', 'Livesport Prague Open', 'Prague', 'CZE', 'TK Sparta Prague', 'WTA', '250', 'Hard', false, '2026-07-20', '2026-07-26'],
  ['washington', 'Mubadala Citi DC Open', 'Washington', 'USA', 'Rock Creek Park Tennis Center', 'BOTH', '500', 'Hard', false, '2026-07-27', '2026-08-02'],
  ['canada', 'National Bank Open', 'Montreal / Toronto', 'CAN', 'IGA Stadium / Sobeys Stadium', 'BOTH', '1000', 'Hard', false, '2026-08-02', '2026-08-13', 'canada'],
  ['cincinnati', 'Cincinnati Open', 'Cincinnati', 'USA', 'Lindner Family Tennis Center', 'BOTH', '1000', 'Hard', false, '2026-08-13', '2026-08-24', 'cincy'],
  ['winston-salem', 'Winston-Salem Open', 'Winston-Salem', 'USA', 'Wake Forest Tennis Complex', 'ATP', '250', 'Hard', false, '2026-08-23', '2026-08-29'],
  ['monterrey', 'Abierto GNP Seguros', 'Monterrey', 'MEX', 'Club Sonoma', 'WTA', '500', 'Hard', false, '2026-08-23', '2026-08-29'],
  ['us-open', 'US Open', 'New York', 'USA', 'USTA Billie Jean King National Tennis Center', 'BOTH', 'Grand Slam', 'Hard', false, '2026-08-31', '2026-09-13', 'uso'],
  ['chengdu', 'Chengdu Open', 'Chengdu', 'CHN', 'Sichuan International Tennis Center', 'ATP', '250', 'Hard', false, '2026-09-16', '2026-09-22'],
  ['hangzhou', 'Hangzhou Open', 'Hangzhou', 'CHN', 'Hangzhou Olympic Tennis Center', 'ATP', '250', 'Hard', false, '2026-09-16', '2026-09-22'],
  ['seoul', 'Korea Open', 'Seoul', 'KOR', 'Olympic Park Tennis Center', 'WTA', '500', 'Hard', false, '2026-09-14', '2026-09-20'],
  ['guadalajara', 'Guadalajara Open', 'Guadalajara', 'MEX', 'Panamerican Tennis Center', 'WTA', '500', 'Hard', false, '2026-09-14', '2026-09-20'],
  ['tokyo-atp', 'Kinoshita Group Japan Open', 'Tokyo', 'JPN', 'Ariake Coliseum', 'ATP', '500', 'Hard', false, '2026-09-23', '2026-09-29'],
  ['beijing', 'China Open', 'Beijing', 'CHN', 'National Tennis Center', 'BOTH', '500', 'Hard', false, '2026-09-23', '2026-10-04', 'beijing', { WTA: '1000' }],
  ['shanghai', 'Rolex Shanghai Masters', 'Shanghai', 'CHN', 'Qizhong Forest Sports City Arena', 'ATP', '1000', 'Hard', false, '2026-10-01', '2026-10-12', 'shanghai'],
  ['wuhan', 'Wuhan Open', 'Wuhan', 'CHN', 'Optics Valley International Tennis Center', 'WTA', '1000', 'Hard', false, '2026-10-05', '2026-10-11', 'wuhan'],
  ['ningbo', 'Ningbo Open', 'Ningbo', 'CHN', 'Ningbo Yinzhou Tennis Center', 'WTA', '500', 'Hard', false, '2026-10-12', '2026-10-18'],
  ['almaty', 'Almaty Open', 'Almaty', 'KAZ', 'Almaty Arena', 'ATP', '250', 'Hard', true, '2026-10-12', '2026-10-18'],
  ['antwerp', 'European Open', 'Antwerp', 'BEL', 'Lotto Arena', 'ATP', '250', 'Hard', true, '2026-10-12', '2026-10-18'],
  ['stockholm', 'BNP Paribas Nordic Open', 'Stockholm', 'SWE', 'Kungliga Tennishallen', 'ATP', '250', 'Hard', true, '2026-10-12', '2026-10-18'],
  ['basel', 'Swiss Indoors Basel', 'Basel', 'SUI', 'St. Jakobshalle', 'ATP', '500', 'Hard', true, '2026-10-19', '2026-10-25'],
  ['vienna', 'Erste Bank Open', 'Vienna', 'AUT', 'Wiener Stadthalle', 'ATP', '500', 'Hard', true, '2026-10-19', '2026-10-25'],
  ['tokyo-wta', 'Toray Pan Pacific Open', 'Tokyo', 'JPN', 'Ariake Coliseum', 'WTA', '500', 'Hard', false, '2026-10-19', '2026-10-25'],
  ['guangzhou', 'Guangzhou Open', 'Guangzhou', 'CHN', 'Guangdong Olympic Tennis Centre', 'WTA', '250', 'Hard', false, '2026-10-19', '2026-10-25'],
  ['paris', 'Rolex Paris Masters', 'Paris', 'FRA', 'Paris La Défense Arena', 'ATP', '1000', 'Hard', true, '2026-10-26', '2026-11-01', 'paris'],
  ['hong-kong-wta', 'Prudential Hong Kong Tennis Open', 'Hong Kong', 'CHN', 'Victoria Park', 'WTA', '250', 'Hard', false, '2026-10-26', '2026-11-01'],
  ['wta-finals', 'WTA Finals', 'Riyadh', 'SAU', 'King Saud University Indoor Arena', 'WTA', 'Finals', 'Hard', true, '2026-11-01', '2026-11-08', 'wtaFinals'],
  ['athens', 'Hellenic Championship', 'Athens', 'GRE', 'OAKA Arena', 'ATP', '250', 'Hard', true, '2026-11-01', '2026-11-07'],
  ['metz', 'Moselle Open', 'Metz', 'FRA', 'Les Arènes de Metz', 'ATP', '250', 'Hard', true, '2026-11-01', '2026-11-07'],
  ['atp-finals', 'Nitto ATP Finals', 'Turin', 'ITA', 'Inalpi Arena', 'ATP', 'Finals', 'Hard', true, '2026-11-08', '2026-11-15', 'atpFinals'],
];

const PRIZE = { 'Grand Slam': 65000000, Finals: 15500000, '1000': 9000000, '500': 2700000, '250': 700000 };
const DRAW = { 'Grand Slam': 128, Finals: 8, '1000': 96, '500': 32, '250': 28 };

const tournaments = CAL.map(([id, name, city, ioc, venue, tours, tier, surface, indoor, startDate, endDate, historyKey, tierOverride]) => {
  const tourList = tours === 'BOTH' ? ['ATP', 'WTA'] : [tours];
  const [countryCode, countryName] = COUNTRIES[ioc];
  const history = historyKey ? H[historyKey] : null;
  const realHistory = Boolean(history);
  const perTour = {};
  for (const t of tourList) {
    perTour[t] = history?.[t] ?? sampleChampions(t, true);
  }
  const champions = YEARS.map((year, i) => {
    const row = { year };
    for (const t of tourList) row[t.toLowerCase()] = perTour[t][i];
    return row;
  }).reverse();
  const tiers = {};
  for (const t of tourList) tiers[t] = tierOverride?.[t] ?? tier;
  return {
    id,
    name,
    city,
    countryCode,
    countryName,
    venue,
    tours: tourList,
    tier,
    tiersByTour: tiers,
    surface,
    indoor,
    startDate,
    endDate,
    drawSize: DRAW[tier],
    prizeMoneyUsd: PRIZE[tier] * (tourList.length > 1 && tier !== 'Grand Slam' ? 1.8 : 1),
    champions,
    championsAreSample: !realHistory,
  };
});
// Sanity: end >= start
for (const t of tournaments) if (t.endDate < t.startDate) throw new Error('bad dates ' + t.id);
write('tournaments.json', tournaments);

// ---------------------------------------------------------------- news
const NEWS = [
  ['Sinner powers past Alcaraz to win Shanghai title', 'Jannik Sinner produced a near-flawless serving display to beat Carlos Alcaraz in straight sets and lift the Shanghai Masters trophy, tightening the race for year-end No. 1.', 'ATP Tour', 'https://www.atptour.com/en/news', 'ATP', true, ['jannik-sinner', 'carlos-alcaraz'], '2026-10-12T15:20:00Z', 'Hard'],
  ['Sabalenka seals year-end No. 1 for third straight season', 'A quarter-final run in Wuhan was enough for Aryna Sabalenka to lock up the WTA year-end top spot, joining an elite group to finish three consecutive seasons on top.', 'WTA', 'https://www.wtatennis.com/news', 'WTA', true, ['aryna-sabalenka'], '2026-10-10T09:00:00Z', 'Hard'],
  ['Gauff rallies from a set down to win Wuhan title', 'Coco Gauff saved two championship points before overpowering Iga Swiatek in a two-and-a-half-hour final to claim her second Wuhan trophy.', 'Tennis.com', 'https://www.tennis.com/news/', 'WTA', true, ['coco-gauff', 'iga-swiatek'], '2026-10-11T13:45:00Z', 'Hard'],
  ['Draper withdraws from indoor swing with arm injury', 'British No. 1 Jack Draper has pulled out of Vienna and Paris as he continues to manage a bone bruise in his left arm, putting his ATP Finals hopes in doubt.', 'BBC Sport', 'https://www.bbc.co.uk/sport/tennis', 'ATP', true, ['jack-draper'], '2026-10-14T08:10:00Z', 'Hard'],
  ['Fonseca wins first indoor title in Stockholm', 'Brazilian teenager Joao Fonseca continued his rapid rise with a commanding victory in the Stockholm final, his third tour-level title of the season.', 'ATP Tour', 'https://www.atptour.com/en/news', 'ATP', false, ['joao-fonseca'], '2026-10-18T16:30:00Z', 'Hard'],
  ['Race to Turin: five players chasing the last three spots', 'With Basel, Vienna and Paris still to come, the battle for the final places at the Nitto ATP Finals has never been tighter. We break down every scenario.', 'ESPN', 'https://www.espn.com/tennis/', 'ATP', false, ['lorenzo-musetti', 'felix-auger-aliassime', 'ben-shelton', 'alex-de-minaur'], '2026-10-16T11:00:00Z', 'Hard'],
  ['Mboko breaks into the top 10 after Ningbo semi-final', 'Canadian Victoria Mboko has become the youngest woman in the top 10 after reaching the last four in Ningbo, capping a breakout season.', 'WTA', 'https://www.wtatennis.com/news', 'WTA', false, ['victoria-mboko'], '2026-10-17T10:15:00Z', 'Hard'],
  ['Djokovic confirms Paris Masters return', 'Novak Djokovic will play the Rolex Paris Masters for the first time in three years as he targets a record-extending eighth ATP Finals title.', 'The Guardian', 'https://www.theguardian.com/sport/tennis', 'ATP', false, ['novak-djokovic'], '2026-10-15T18:40:00Z', 'Hard'],
  ['Zheng Qinwen set for comeback in Tokyo', 'Olympic champion Zheng Qinwen has accepted a wildcard into the Pan Pacific Open, her first event since elbow surgery in the summer.', 'Tennis.com', 'https://www.tennis.com/news/', 'WTA', false, ['zheng-qinwen'], '2026-10-16T07:30:00Z', 'Hard'],
  ['Anisimova and Pegula lead US charge into WTA Finals', 'For the first time since 2002, four American women are on course to qualify for the season-ending championships in Riyadh.', 'ESPN', 'https://www.espn.com/tennis/', 'WTA', false, ['amanda-anisimova', 'jessica-pegula', 'coco-gauff', 'madison-keys'], '2026-10-13T14:00:00Z', 'Hard'],
  ['Rune targets Paris for return from Achilles injury', 'Holger Rune says he is "90 per cent" ready after seven months out, with the Dane planning to test his Achilles at the final Masters 1000 of the year.', 'BBC Sport', 'https://www.bbc.co.uk/sport/tennis', 'ATP', false, ['holger-rune'], '2026-10-14T12:20:00Z', 'Hard'],
  ['Inside the numbers: how Alcaraz rebuilt his second serve', 'A deep dive into the tactical tweaks behind Carlos Alcaraz’s improved hold percentage in 2026 — and why it matters on the quick indoor courts ahead.', 'The Athletic', 'https://www.nytimes.com/athletic/tennis/', 'ATP', false, ['carlos-alcaraz'], '2026-10-09T09:30:00Z', 'Clay'],
  ['Osaka out of Tokyo with abdominal strain', 'Naomi Osaka has withdrawn from her home event in Tokyo after scans revealed a grade-one abdominal strain sustained during practice in Ningbo.', 'Reuters', 'https://www.reuters.com/sports/tennis/', 'WTA', false, ['naomi-osaka'], '2026-10-17T05:50:00Z', 'Hard'],
  ['Mensik and Lehecka power Czech resurgence', 'With two men inside the top 20 for the first time in over a decade, Czech tennis is enjoying a golden generation on both tours.', 'Tennis.com', 'https://www.tennis.com/news/', 'ATP', false, ['jakub-mensik', 'jiri-lehecka'], '2026-10-08T15:00:00Z', 'Hard'],
  ['Swiatek splits with coach ahead of 2027 season', 'Iga Swiatek has announced she will part ways with her coaching team at the end of the season, saying she needs "a new voice" for the next chapter.', 'Reuters', 'https://www.reuters.com/sports/tennis/', 'WTA', false, ['iga-swiatek'], '2026-10-12T19:25:00Z', 'Clay'],
  ['Basel draw: Sinner headlines stacked field', 'Jannik Sinner is the top seed at the Swiss Indoors, with Taylor Fritz, Ben Shelton and home favourite Stan Wawrinka also in the draw.', 'ATP Tour', 'https://www.atptour.com/en/news', 'ATP', false, ['jannik-sinner', 'taylor-fritz', 'ben-shelton', 'stan-wawrinka'], '2026-10-18T10:00:00Z', 'Hard'],
  ['Andreeva: "I want to win a Slam next year"', 'Mirra Andreeva opens up on her goals for 2027, her new fitness programme and learning to manage expectations at 19.', 'WTA', 'https://www.wtatennis.com/news', 'WTA', false, ['mirra-andreeva'], '2026-10-07T08:45:00Z', 'Grass'],
  ['Tour confirms new calendar changes for 2027', 'The ATP and WTA have jointly announced a revised schedule for 2027, including a longer off-season and fewer mandatory events for top players.', 'The Guardian', 'https://www.theguardian.com/sport/tennis', 'Both', false, [], '2026-10-15T09:10:00Z', 'Clay'],
  ['Shelton’s serve speed record falls in Almaty', 'Giovanni Mpetshi Perricard thundered down a 247 km/h first serve in Almaty, the fastest recorded on tour this season.', 'ESPN', 'https://www.espn.com/tennis/', 'ATP', false, ['giovanni-mpetshi-perricard', 'ben-shelton'], '2026-10-15T13:35:00Z', 'Hard'],
  ['Paolini and Errani qualify for Riyadh doubles', 'The Italian pair booked their place at the WTA Finals for a third straight year after a title run in Beijing.', 'WTA', 'https://www.wtatennis.com/news', 'WTA', false, ['jasmine-paolini', 'sara-errani'], '2026-10-06T16:00:00Z', 'Hard'],
  ['Fritz and Paul commit to United Cup', 'Team USA will be led by Taylor Fritz and Tommy Paul as they look to reclaim the mixed-team title in Australia this January.', 'Tennis.com', 'https://www.tennis.com/news/', 'Both', false, ['taylor-fritz', 'tommy-paul', 'coco-gauff'], '2026-10-11T07:00:00Z', 'Hard'],
];

const SURFACE_COLORS = { Hard: ['#1d4ed8', '#3b82f6'], Clay: ['#c2410c', '#f97316'], Grass: ['#15803d', '#22c55e'] };
const news = NEWS.map(([title, summary, source, url, tour, topStory, playerIds, publishedAt, surface], i) => {
  const id = `n${String(i + 1).padStart(3, '0')}`;
  const [c1, c2] = SURFACE_COLORS[surface];
  const ballX = between(560, 720);
  const ballY = between(60, 140);
  // Simple court-and-ball artwork so the app has images without hot-linking.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" role="img" aria-label="${surface} court illustration">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
  <radialGradient id="b" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#eaff7a"/><stop offset="1" stop-color="#b8d92a"/></radialGradient></defs>
  <rect width="800" height="450" fill="url(#g)"/>
  <g fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="5" transform="translate(400 260) scale(1 .45) rotate(${between(-12, 12)}) translate(-400 -260)">
    <rect x="120" y="60" width="560" height="400"/><line x1="120" y1="260" x2="680" y2="260"/>
    <line x1="190" y1="60" x2="190" y2="460"/><line x1="610" y1="60" x2="610" y2="460"/>
    <line x1="190" y1="160" x2="610" y2="160"/><line x1="190" y1="360" x2="610" y2="360"/><line x1="400" y1="160" x2="400" y2="360"/>
  </g>
  <circle cx="${ballX}" cy="${ballY}" r="38" fill="url(#b)"/>
  <path d="M${ballX - 30} ${ballY - 22} q 26 22 0 44 M${ballX + 30} ${ballY - 22} q -26 22 0 44" stroke="#fff" stroke-width="4" fill="none"/>
</svg>
`;
  fs.writeFileSync(path.join(newsImgDir, `${id}.svg`), svg);
  return { id, title, summary, source, url, imageUrl: `/images/news/${id}.svg`, publishedAt, tour, topStory, playerIds };
});
write('news.json', news);
console.log('done');
