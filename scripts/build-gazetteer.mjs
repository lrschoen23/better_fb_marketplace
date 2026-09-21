// Builds src/data/gazetteer.json from GeoNames cities5000 (CC BY 4.0).
// Usage: node scripts/build-gazetteer.mjs   (COUNTRIES=US,CA to override)
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL = 'https://download.geonames.org/export/dump/cities5000.zip';
const countries = new Set((process.env.COUNTRIES ?? 'US,CA').split(','));

// Download and unzip via system unzip (no extra deps).
const dir = mkdtempSync(join(tmpdir(), 'gaz-'));
const zip = join(dir, 'c.zip');
writeFileSync(zip, Buffer.from(await (await fetch(URL)).arrayBuffer()));
const tsv = execFileSync('unzip', ['-p', zip, 'cities5000.txt'], { maxBuffer: 1 << 28 }).toString();

// GeoNames columns: 1 name, 4 lat, 5 lng, 8 country, 10 admin1, 14 population.
const rows = [];
for (const line of tsv.split('\n')) {
  const c = line.split('\t');
  if (c.length < 15 || !countries.has(c[8])) continue;
  rows.push([c[1], c[10], c[8], +Number(c[4]).toFixed(4), +Number(c[5]).toFixed(4), +c[14]]);
}

mkdirSync('src/data', { recursive: true });
writeFileSync('src/data/gazetteer.json', JSON.stringify(rows));
console.log(`wrote ${rows.length} rows for ${[...countries].join(',')}`);
