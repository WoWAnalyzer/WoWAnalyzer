import fs from 'fs';
import path from 'path';

import { GenericTalentInterface, ISpellpower, ResourceTypes } from './talent-tree-types';

const debug = false;
/**
 * Requires NodeJS 18+ (or 17 with experimental flag)
 */
export async function readJsonFromUrl<T>(url: string): Promise<T> {
  const res = await fetch(url)
    .then((res) => res.json())
    .catch((err) => {
      throw err;
    });
  return res;
}

export function csvToObject<T>(csvString: string): T[] {
  // /\r?\n/ for better Windows support
  const lines = csvString.split(/\r?\n/);

  const result: T[] = [];

  const headers = lines[0].split(',');

  // eslint-disable-next-line no-plusplus
  for (let i = 1; i < lines.length - 1; i++) {
    const obj: any = {};
    const currentline = lines[i].split(',');

    // eslint-disable-next-line no-plusplus
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = obj[headers[j]] || {};
      obj[headers[j]] = currentline[j];
    }

    result.push(obj as T);
  }

  debug &&
    fs.writeFileSync(
      `.${__dirname.replace(process.cwd(), '')}/generated.json`,
      JSON.stringify(result),
    );
  //JSON
  return result;
}

export function readCsvFromFile(file: string) {
  return fs.readFileSync(path.resolve(__dirname, file), { encoding: 'utf-8' });
}

export async function readCsvFromUrl(url: string) {
  const res = await fetch(url, {
    method: 'get',
    headers: {
      'content-type': 'test/csv;charset=UTF-8',
    },
  })
    .then((res) => res.text())
    .catch((err) => {
      throw err;
    });
  return res;
}

export function printTalents(
  talentObj: Array<{ key: string; value: GenericTalentInterface }> | undefined,
) {
  if (!talentObj) {
    return "\n//Class doesn't exist in data yet\n";
  }
  return talentObj
    .sort((a, b) => {
      if (a.key < b.key) {
        return -1;
      } else if (a.key > b.key) {
        return 1;
      } else {
        return 0;
      }
    })
    .map(({ key, value }) => {
      //Spec was only used during generation, so we remove it before writing to file
      delete value.spec;
      delete value.sourceTree;
      // deduplicate the entry ids. this is not done at earlier steps so we can tell when a talent
      // is repeated across trees for the shared/spec disambiguation method
      value.entryIds = Array.from(new Set(value.entryIds));
      return `${key}: ${JSON.stringify(value)},`;
    })
    .join('\n');
}

//Right now in the alpha build there are a bunch of talents between class and spec trees that share the same name
//This is fixed by adding the spec name to the exported talent name
export function createTalentKey(talentName: string, specName?: string) {
  //A lot of the cleaning in here is due to the weirdnamings of stuff in alpha data
  //Examples of weird names
  //Fury of the Skies (1/2%)
  //Celestial Alignment [SL version, No initial damage]
  //Moonfire/Sunfire + 3/6s
  //This tries to clean it as good as possible, without spending too much time on it since these names will probably be fixed as alpha progresses
  const cleanedTalentName = talentName
    //.replace(/ *\([^)]*\) */g, '') //Remove all contents within a ()
    //.replace(/ *\[[^)]*\] */g, '') // Remove all contents within []
    .replace(/([,':[\]()/+%&])/g, '') // Remove ,':[]()/+% symbols
    .trim() //Remove any weird whitespaces that might remain
    .replace(/([ -])/g, '_'); // Transform - into _

  return `${cleanedTalentName.toUpperCase()}${
    specName ? `_${specName.toUpperCase().replace(' ', '_')}` : ''
  }_TALENT`;
}

export function camalize(str: string) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
    if (Number(match) === 0) {
      return '';
    } // or if (/\s+/.test(match)) for white spaces
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

export function findResourceCost(
  entryInSpellPowerTable: ISpellpower,
  resourceId: number,
  baseMaxResource: number,
) {
  if (parseInt(entryInSpellPowerTable.PowerCostPct) > 0) {
    return Math.round((Number(entryInSpellPowerTable.PowerCostPct) / 100) * baseMaxResource);
  } else if (
    [
      ResourceTypes.RunicPower,
      ResourceTypes.Rage,
      ResourceTypes.SoulShards,
      ResourceTypes.Pain,
    ].includes(resourceId)
  ) {
    return Number(entryInSpellPowerTable.ManaCost) / 10;
  } else {
    return Number(entryInSpellPowerTable.ManaCost);
  }
}

export function findResourceCostPerSecond(
  entryInSpellPowerTable: ISpellpower,
  resourceId: number,
  baseMaxResource: number,
) {
  if (parseFloat(entryInSpellPowerTable.PowerPctPerSecond) > 0) {
    return Math.round((Number(entryInSpellPowerTable.PowerPctPerSecond) / 100) * baseMaxResource);
  } else if (
    [
      ResourceTypes.RunicPower,
      ResourceTypes.Rage,
      ResourceTypes.SoulShards,
      ResourceTypes.Pain,
    ].includes(resourceId)
  ) {
    return Number(entryInSpellPowerTable.ManaPerSecond) / 10;
  } else {
    return Number(entryInSpellPowerTable.ManaPerSecond);
  }
}
