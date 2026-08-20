import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFile(path.join(root, relativePath), 'utf8');

const [apl, opener, abilities, config, documentation] = await Promise.all([
  read('src/analysis/retail/deathknight/frost/modules/apl/AplCheck.tsx'),
  read('src/analysis/retail/deathknight/frost/modules/apl/Opener.tsx'),
  read('src/analysis/retail/deathknight/frost/modules/Abilities.tsx'),
  read('src/analysis/retail/deathknight/frost/CONFIG.tsx'),
  read('docs/specs/frost-death-knight-apl.md'),
]);

assert.match(config, /patchCompatibility:\s*'12\.1\.0'/, 'Frost compatibility must be 12.1.0');
assert.match(documentation, /Patch:\s*12\.1\.0/, 'documentation patch must match config');
assert.match(
  documentation,
  /351fcec671c8c88b9fc042244fc9e6532a3074ba/,
  'documentation must pin the reviewed SimC commit',
);

for (const source of ['wowhead.com', 'method.gg', 'github.com/simulationcraft/simc']) {
  assert.ok(documentation.includes(source), `missing trusted source: ${source}`);
}

const stableIds = [
  ...apl.matchAll(/:\s*'(frost\.[^']+)'/g),
  ...opener.matchAll(/:\s*'(frost\.[^']+)'/g),
].map((match) => match[1]);
assert.equal(new Set(stableIds).size, stableIds.length, 'rule and opener IDs must be unique');
for (const id of stableIds) {
  assert.ok(
    documentation.includes(`\`${id}\``),
    `documentation is missing source mapping for ${id}`,
  );
}

for (const spell of [
  'PILLAR_OF_FROST_TALENT',
  'EMPOWER_RUNE_WEAPON_TALENT',
  'BREATH_OF_SINDRAGOSA_TALENT',
  'FROSTWYRMS_FURY_TALENT',
  'OBLITERATE_TALENT',
  'HOWLING_BLAST_TALENT',
  'FROST_STRIKE_TALENT',
  'FROSTSCYTHE_TALENT',
  'GLACIAL_ADVANCE',
  'REAPERS_MARK_TALENT',
]) {
  assert.ok(abilities.includes(spell), `Abilities is missing APL spell metadata for ${spell}`);
}

console.log(`Frost APL validation passed (${stableIds.length} stable IDs).`);
