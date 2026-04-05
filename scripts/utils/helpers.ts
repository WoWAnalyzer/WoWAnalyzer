import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { DBCBuilds, DBCTable } from 'scripts/utils/dbc-types';
import { RaidbotsStaticDataFile } from 'scripts/utils/raidbots-types';

const BASE_DBC_URL = 'https://wago.tools';
const BASE_RAIDBOTS_STATIC_DATA_URL = 'https://www.raidbots.com/static/data';

const CACHE_DIR = path.resolve(process.cwd(), '.cache');

/**
 * Fetches data from a URL with local file-based caching.
 */
export async function fetchWithCache(
  url: string,
  options: { forceRefresh?: boolean } = {},
): Promise<string> {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  // Create a unique filename based on the URL
  const hash = crypto.createHash('md5').update(url).digest('hex');
  const cachePath = path.join(CACHE_DIR, `${hash}.cache`);

  // Check if cache exists and is valid
  if (!options.forceRefresh && fs.existsSync(cachePath)) {
    return fs.readFileSync(cachePath, 'utf-8');
  }

  // Fetch and update cache
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }

  const data = await response.text();
  fs.writeFileSync(cachePath, data, 'utf-8');
  return data;
}

/**
 * Requires NodeJS 18+ (or 17 with experimental flag)
 */
export async function readJsonFromUrl<T>(url: string, forceRefresh = false): Promise<T> {
  const data = await fetchWithCache(url, { forceRefresh });
  return JSON.parse(data);
}

export function csvToObject<T>(csvString: string, debug = false): T[] {
  // /\r?\n/ for better Windows support
  const lines = csvString.split(/\r?\n/).filter((line) => line.trim() !== '');
  if (lines.length < 2) return [];

  // Robustly split by comma, but ignore commas inside double quotes
  const splitCsvLine = (line: string) => {
    const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    return matches ? matches.map((val) => val.replace(/^"|"$/g, '').trim()) : [];
  };

  const headers = splitCsvLine(lines[0]);

  const result = lines.slice(1).map((line) => {
    const currentLine = splitCsvLine(line);
    const obj: any = {};

    headers.forEach((header, i) => {
      // Handle cases where a row might have fewer columns than the header
      obj[header] = currentLine[i] !== undefined ? currentLine[i] : null;
    });

    return obj as T;
  });

  debug &&
    fs.writeFileSync(
      `.${__dirname.replace(process.cwd(), '')}/generated.json`,
      JSON.stringify(result),
    );
  // JSON
  return result;
}

export function readCsvFromFile(file: string) {
  return fs.readFileSync(path.resolve(__dirname, file), { encoding: 'utf-8' });
}

export async function readCsvFromUrl(url: string, forceRefresh = false) {
  return fetchWithCache(url, { forceRefresh });
}

export function camalize(str: string) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
    if (Number(match) === 0) {
      return '';
    } // or if (/\s+/.test(match)) for white spaces
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

export function slugify(
  str: string,
  removeParenthesesContent = false,
  removeBracketsContent = false,
) {
  if (removeParenthesesContent) {
    // Remove all contents within a ()
    str = str.replace(/ *\([^)]*\) */g, '');
  }
  if (removeBracketsContent) {
    // Remove all contents within []
    str = str.replace(/ *\[[^)]*] */g, '');
  }

  str = str
    .replace(/([,':[\]()/+%&!])/g, '') // Remove ,':[]()/+%&! symbols
    .trim() // Remove any weird whitespaces that might remain
    .replace(/([ -])/g, '_'); // Transform - into _

  return str.toUpperCase();
}

export function getDbcCsvUrl(type: DBCTable, build: string) {
  return `${BASE_DBC_URL}/db2/${type}/csv?build=${build}`;
}

export async function getLatestDbcBuild(version: keyof DBCBuilds = 'wow') {
  const builds = await readJsonFromUrl<DBCBuilds>(`${BASE_DBC_URL}/api/builds/latest`);

  return builds[version].version;
}

export function getRaidbotsStaticDataUrl(
  dataFile: RaidbotsStaticDataFile,
  ptr: boolean = false,
  build?: string,
) {
  if (build) {
    return `${BASE_RAIDBOTS_STATIC_DATA_URL}/${build}/${dataFile}.json`;
  }

  return `${BASE_RAIDBOTS_STATIC_DATA_URL}/${ptr ? 'ptr' : 'live'}/${dataFile}.json`;
}
