const fs = require('fs');

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}
function reformat(json) {
  return json.realms
    .map(({ name, slug }) => ({ name, slug }))
    .filter(({ name }) => !name.includes('CWOW'))
    .sort((a, b) => a.name.localeCompare(b.name));
}
function reformatFile(path) {
  return reformat(readJson(path));
}

const output = {
  EU: reformatFile('./data/EU.json'),
  KR: reformatFile('./data/KR.json'),
  TW: reformatFile('./data/TW.json'),
  US: reformatFile('./data/US.json'),
  CN: reformatFile('./data/CN.json'),
};

const classic_output = {
  EU: reformatFile('./data/classicEU.json'),
  KR: reformatFile('./data/classicKR.json'),
  TW: reformatFile('./data/classicTW.json'),
  US: reformatFile('./data/classicUS.json'),
};

fs.writeFileSync(
  './output.ts',
  `// Generated file, changes will be overwritten!

import { Region, ClassicRegion } from 'common/regions';

interface Realm {
  name: string;
  slug: string;
}

export const REALMS: Record<Region, Realm[]> = ${JSON.stringify(output)};

export const CLASSIC_REALMS: Record<ClassicRegion, Realm[]> = ${JSON.stringify(classic_output)};
`,
);
