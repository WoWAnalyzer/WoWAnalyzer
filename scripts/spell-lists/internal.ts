import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as gamedata from 'wow-dbc';
import type { Dbc } from 'wow-dbc/dist/src/dbc';
import { cleanIconName, downloadFileList, type FileList } from 'wow-dbc/dist/util/icon-name.js';
import * as prettier from 'prettier';
import prettierConfig from '../../.prettierrc.json' with { type: 'json' };

const FILE_LISTS: Record<string, FileList> = {};

export const CURRENT_GAME_VERSIONS = {
  classic: '5.5.0.62232',
  retail: '12.0.1.65337',
};

export async function generateSpellData(
  gameBranch: string,
  gameVersion: string,
  className: string,
  specName: string,
): Promise<string> {
  const dbc = gamedata.dbc(gameVersion);
  const specId = await gamedata.getSpecIdByName(dbc, className, specName);

  if (!specId) {
    throw new Error(
      `unable to locate spec id for class ${className} and spec ${specName} in version ${gameVersion}`,
    );
  }

  const spells = await getSpellList(dbc, gameBranch, specId);

  if (!spells) {
    throw new Error(
      `could not load spell list for game branch ${gameBranch} and spec id ${specId}`,
    );
  }

  const rawData = await gamedata.loadAll(gamedata.PRESETS.RETAIL, dbc, spells);
  const fileList = await getFileList(gameVersion);
  const data = rawData
    .filter((spell) => spell.name)
    .map(stripSpellInternals)
    .map((spell) => addIconName(fileList, spell));

  const keyedData = keyByName(data);

  const output = `
      import type { RetailSpell } from 'wow-dbc';
      const SPELLS = ${JSON.stringify(keyedData, undefined, 2)} as const satisfies Record<string, RetailSpell & { icon: string; }>;
      export default SPELLS;
    `;

  return await prettier.format(output, {
    ...prettierConfig,
    parser: 'typescript',
  } as prettier.Options);
}

async function getSpellList(dbc: Dbc, branch: string, specId: number) {
  if (branch === 'classic') {
    return gamedata.classicSpellList(dbc, specId);
  } else if (branch === 'retail') {
    return gamedata.retailSpellList(dbc, specId);
  }

  return undefined;
}

function keyByName(spells: gamedata.RetailSpell[]): Record<string, gamedata.RetailSpell> {
  const spellsByName: Record<string, gamedata.RetailSpell[]> = {};

  spells.sort((a, b) => a.id - b.id);

  for (const spell of spells) {
    const name = baseSpellName(spell);
    if (!spellsByName[name]) {
      spellsByName[name] = [];
    }

    spellsByName[name]?.push(spell);
  }

  const output = {};

  for (const [name, conflictSpells] of Object.entries(spellsByName)) {
    if (conflictSpells.length === 1) {
      output[name] = conflictSpells[0];
    } else {
      const remainder: gamedata.RetailSpell[] = [];
      for (const spell of conflictSpells) {
        // handle temporary spells, typically granted by buffs (like Shadow Priest cooldowns)
        if (spell.type === 'temporary') {
          const duplicateSource = conflictSpells.some(
            (other) =>
              other.id !== spell.id &&
              other.type === 'temporary' &&
              other.grantedBy === spell.grantedBy,
          );

          const source = !duplicateSource && spells.find((other) => other.id === spell.grantedBy);
          if (!duplicateSource && source) {
            const suffix = temporarySpellConflictSuffix(source);

            const fullName = `${name}_${suffix}`;
            output[fullName] = spell;

            continue;
          }
        }

        if (
          spell.type === 'baseline' &&
          conflictSpells.some((other) => other.type !== 'temporary' && other.overrides === spell.id)
        ) {
          // many baseline spells are overridden by either hidden spec passives, or by essential talents.
          // for example: Blackout Kick for Brewmaster is overridden by a non-optional talent.
          // Spinning Crane Kick is overridden by a spell that is a part of the level-up spell list.
          const fullName = `${name}_BASELINE`;
          output[fullName] = spell;
          continue;
        }

        remainder.push(spell);
      }

      // finally, deconflict by index if necessary
      if (remainder.length === 1) {
        output[baseSpellName(remainder[0])] = remainder[0];
      } else {
        let indexDeconflict = remainder;

        // if there is exactly one baseline spell + one or more temporary spells, give the baseline an un-suffixed name and the others indexed names
        const baseline = remainder.find((spell) => spell.type === 'baseline');
        if (
          baseline &&
          remainder.every((spell) => spell.type === 'temporary' || spell.id === baseline?.id)
        ) {
          output[baseSpellName(baseline)] = baseline;
          indexDeconflict = remainder.filter((spell) => spell.id !== baseline.id);
        }

        for (let i = 0; i < indexDeconflict.length; i++) {
          output[`${name}_${i + 1}`] = indexDeconflict[i];
        }
      }
    }
  }

  return output;
}

function temporarySpellConflictSuffix(spell: gamedata.RetailSpell): string {
  if (spell.type === 'glyph') {
    return 'GLYPH';
  }

  return baseSpellName(spell);
}

function baseSpellName(spell: gamedata.RetailSpell): string {
  if (!spell.name) {
    return 'UNKNOWN';
  }

  const name = spell.name
    .replace(/[ -]+/g, '_')
    .replace(/[^a-zA-Z0-9_]+/g, '')
    .toUpperCase();

  let suffix: string | undefined = undefined;

  if (spell.type === 'temporary') {
    // we resolve this later if there is a conflict
    return name;
  } else if (isWellFormedGlyphSpell(spell)) {
    return name;
  } else if (spell.type === 'talent' || spell.type === 'mists-talent') {
    suffix = 'TALENT';
  } else if (spell.hidden === 'always') {
    suffix = 'HIDDEN';
  } else if (spell.passive) {
    suffix = 'PASSIVE';
  }

  if (suffix) {
    return `${name}_${suffix}`;
  }

  return name;
}

function isWellFormedGlyphSpell(spell: gamedata.RetailSpell): boolean {
  return spell.type === 'glyph' && spell.name.startsWith('Glyph');
}

function stripSpellInternals(spell: gamedata.RetailSpell): gamedata.RetailSpell {
  // internal fields left on by wow-dbc. should probably fix on that side...
  delete (spell as unknown as Record<string, unknown>).label;
  delete (spell as unknown as Record<string, unknown>).effects;
  delete (spell as unknown as Record<string, unknown>).classMask;

  return spell;
}

async function getFileList(version: string): Promise<FileList> {
  if (FILE_LISTS[version]) {
    return FILE_LISTS[version];
  }

  const cacheFile = path.join(import.meta.dirname, './.file-lists/', version);

  try {
    const data = await fs.readFile(cacheFile, { encoding: 'utf8' });

    FILE_LISTS[version] = JSON.parse(data);

    return FILE_LISTS[version];
  } catch {
    console.warn('downloading file list from wago.tools, this might take a bit...');
    // file doesn't exist. download it.
    const contents = await downloadFileList(version);

    await fs.mkdir(path.dirname(cacheFile), { recursive: true });

    await fs.writeFile(cacheFile, JSON.stringify(contents), { encoding: 'utf8' });

    FILE_LISTS[version] = contents;

    return contents;
  }
}

function addIconName(
  list: FileList,
  spell: gamedata.RetailSpell,
): gamedata.RetailSpell & { icon: string } {
  if (!spell.iconID) {
    return { ...spell, icon: 'inv_axe_02.jpg' };
  }

  const name = list[spell.iconID];

  return { ...spell, icon: cleanIconName(name) };
}
