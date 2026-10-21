import { readJson, writeJson } from '@/lib/storage';
import { slugify } from '@/utils/format';
import { md5 } from 'js-md5';

/**
 * Player photos from Wikimedia Commons.
 *
 * Commons only hosts freely licensed media (Creative Commons, public domain, etc.).
 * Most licences require crediting the author, so every photo links back to its
 * Commons page and the profile shows the author and licence (see getPhotoCredit).
 *
 Lookup, per batch of names (free, no key, CORS-enabled), via the Wikidata Query Service:
 *  1. Tennis players whose English label or alias is exactly the name.
 *  2. For names still missing, Wikidata's name search, which ignores accents and
 *     capitalisation ("Jakub Mensik" -> "Jakub Menšík").
 * Same-name matches (e.g. a father and son) prefer a current player with a photo.
 * Results, including "no photo found", are cached in localStorage for 30 days.
 */

export interface PlayerPhoto {
  /** Commons file name, e.g. "Jannik Sinner US Open 2025 (cropped).jpg" */
  file: string;
  /** Wikidata item id */
  wikidataId: string;
}

const SPARQL = 'https://query.wikidata.org/sparql';
const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const TENNIS_PLAYER = 'Q10833314';
const CACHE_PREFIX = 'deuces:photo:';
const HIT_TTL = 30 * 24 * 3600 * 1000;
const MISS_TTL = 7 * 24 * 3600 * 1000;

interface Cached {
  savedAt: number;
  photo: PlayerPhoto | null;
}

/**
 * Direct thumbnail URL on Wikimedia's image CDN. Commons stores files under
 * /a/ab/ folders taken from the MD5 of the file name, so we can build the URL
 * without an API call or redirect.
 */
export function photoUrl(file: string, width = 120): string {
  const name = file.replace(/ /g, '_');
  const hash = md5(name);
  const enc = encodeURIComponent(name);
  const ext = name.split('.').pop()?.toLowerCase();
  // Vector and TIFF originals are thumbnailed to raster formats.
  const thumb = ext === 'svg' ? `${width}px-${enc}.png` : ext === 'tif' || ext === 'tiff' ? `lossy-page1-${width}px-${enc}.jpg` : `${width}px-${enc}`;
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${hash[0]}/${hash.slice(0, 2)}/${enc}/${thumb}`;
}

/** Fallback image URL that lets Commons work out the thumbnail (one redirect). */
export function photoFallbackUrl(file: string, width = 120): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`;
}

/** Commons description page for a file (author, licence, full resolution). */
export function photoPage(file: string): string {
  return `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, '_'))}`;
}

const fileFromUri = (uri: string) => decodeURIComponent(uri.split('/Special:FilePath/')[1] ?? '');
const qidFromUri = (uri: string) => uri.split('/').pop() ?? '';

async function sparql(query: string, attempt = 1): Promise<Array<Record<string, { value: string }>>> {
  const res = await fetch(SPARQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/sparql-results+json' },
    body: new URLSearchParams({ query }),
  });
  // The public endpoint has occasional hiccups; retry once after a pause.
  if ((res.status === 429 || res.status >= 500) && attempt < 2) {
    await new Promise((r) => setTimeout(r, 1500));
    return sparql(query, attempt + 1);
  }
  if (!res.ok) throw new Error(`Wikidata query failed (${res.status})`);
  return (await res.json()).results.bindings;
}

interface Candidate {
  qid: string;
  file: string | null;
  born: number | null;
  tourId: boolean;
}

/** Prefer candidates with a photo, an ATP/WTA player id and the most recent birth year. */
function best(cands: Candidate[]): Candidate | undefined {
  return [...cands].sort(
    (a, b) =>
      Number(Boolean(b.file)) - Number(Boolean(a.file)) ||
      Number(b.tourId) - Number(a.tourId) ||
      (b.born ?? 0) - (a.born ?? 0),
  )[0];
}

const CANDIDATE_FIELDS = `OPTIONAL { ?item wdt:P18 ?image }
  OPTIONAL { ?item wdt:P569 ?born }
  OPTIONAL { ?item wdt:P536|wdt:P597 ?tourId }`;

function toCandidate(r: Record<string, { value: string }>): Candidate {
  return {
    qid: qidFromUri(r.item.value),
    file: r.image ? fileFromUri(r.image.value) : null,
    born: r.born ? Number(r.born.value.slice(0, 4)) : null,
    tourId: Boolean(r.tourId),
  };
}

/** Step 1: match names to tennis players by English label or alias. */
async function byLabel(names: string[]): Promise<Map<string, Candidate>> {
  const values = names.map((n) => `${JSON.stringify(n)}@en`).join(' ');
  const rows = await sparql(`SELECT ?name ?item ?image ?born ?tourId WHERE {
  VALUES ?name { ${values} }
  ?item rdfs:label|skos:altLabel ?name ; wdt:P106 wd:${TENNIS_PLAYER} .
  ${CANDIDATE_FIELDS}
}`);
  const grouped = new Map<string, Candidate[]>();
  rows.forEach((r) => grouped.set(r.name.value, [...(grouped.get(r.name.value) ?? []), toCandidate(r)]));
  const out = new Map<string, Candidate>();
  grouped.forEach((cands, name) => {
    const b = best(cands);
    if (b) out.set(name, b);
  });
  return out;
}

/**
 * Step 2: Wikidata's own name search (ignores accents and capitalisation, so
 * "Jakub Mensik" finds "Jakub Menšík"), restricted to tennis players.
 */
async function bySearch(names: string[]): Promise<Map<string, Candidate>> {
  const values = names.map((n) => JSON.stringify(n)).join(' ');
  const rows = await sparql(`SELECT ?name ?item ?image ?born ?tourId WHERE {
  VALUES ?name { ${values} }
  SERVICE wikibase:mwapi {
    bd:serviceParam wikibase:api "EntitySearch" ; wikibase:endpoint "www.wikidata.org" ;
                    mwapi:search ?name ; mwapi:language "en" ; mwapi:limit "5" .
    ?item wikibase:apiOutputItem mwapi:item .
  }
  ?item wdt:P106 wd:${TENNIS_PLAYER} .
  ${CANDIDATE_FIELDS}
}`);
  const grouped = new Map<string, Candidate[]>();
  rows.forEach((r) => grouped.set(r.name.value, [...(grouped.get(r.name.value) ?? []), toCandidate(r)]));
  const out = new Map<string, Candidate>();
  grouped.forEach((cands, name) => {
    const b = best(cands);
    if (b) out.set(name, b);
  });
  return out;
}

/** Look up photos for many players at once. Unknown players map to null. */
export async function getPlayerPhotos(names: string[]): Promise<Map<string, PlayerPhoto | null>> {
  const result = new Map<string, PlayerPhoto | null>();
  const todo: string[] = [];
  for (const name of new Set(names)) {
    const c = readJson<Cached | null>(CACHE_PREFIX + slugify(name), null);
    if (c && Date.now() - c.savedAt < (c.photo ? HIT_TTL : MISS_TTL)) result.set(name, c.photo);
    else todo.push(name);
  }
  if (todo.length === 0) return result;

  const found = new Map<string, Candidate>();
  // Names whose lookup hit an error: show initials for now, but don't cache the miss.
  const uncertain = new Set<string>();
  const run = async (batch: string[], lookup: (b: string[]) => Promise<Map<string, Candidate>>) => {
    try {
      (await lookup(batch)).forEach((c, n) => {
        if (c.file || !found.has(n)) found.set(n, c);
      });
    } catch {
      batch.forEach((n) => uncertain.add(n));
    }
  };

  for (let i = 0; i < todo.length; i += 100) await run(todo.slice(i, i + 100), byLabel);
  const missing = todo.filter((n) => !found.get(n)?.file);
  // The search service is slower, so keep these batches small.
  for (let i = 0; i < missing.length; i += 25) await run(missing.slice(i, i + 25), bySearch);

  for (const name of todo) {
    const c = found.get(name);
    const photo = c?.file ? { file: c.file, wikidataId: c.qid } : null;
    result.set(name, photo);
    if (photo || !uncertain.has(name)) writeJson(CACHE_PREFIX + slugify(name), { savedAt: Date.now(), photo } satisfies Cached);
  }
  return result;
}

export interface PhotoCredit {
  author: string | null;
  license: string | null;
  licenseUrl: string | null;
  pageUrl: string;
}

/** Author and licence for one Commons file (used for the profile photo credit). */
export async function getPhotoCredit(file: string): Promise<PhotoCredit> {
  const pageUrl = photoPage(file);
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    origin: '*',
    titles: `File:${file}`,
    prop: 'imageinfo',
    iiprop: 'extmetadata',
    iiextmetadatafilter: 'Artist|LicenseShortName|LicenseUrl',
  });
  const res = await fetch(`${COMMONS_API}?${params}`);
  if (!res.ok) throw new Error(`Commons lookup failed (${res.status})`);
  const meta = (await res.json()).query?.pages?.[0]?.imageinfo?.[0]?.extmetadata ?? {};
  // Artist is HTML (often a link to the author's user page); keep the text only.
  const text = (html?: string) => (html ? new DOMParser().parseFromString(html, 'text/html').body.textContent?.trim() || null : null);
  return {
    author: text(meta.Artist?.value),
    license: meta.LicenseShortName?.value ?? null,
    licenseUrl: meta.LicenseUrl?.value ?? null,
    pageUrl,
  };
}
