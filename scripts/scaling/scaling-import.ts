// TODO this should be unified?
import { readCsvFromUrl, csvToObject } from '../talents/talent-tree-helpers';
import * as fs from 'fs';

const BUILD_NUMBER = '11.0.2.56110';

interface RandPoint {
  ID: string;
  GoodF_0: string;
  DamageSecondaryF: string;
}

async function ensureDirectory() {
  await fs.promises.mkdir('./src/parser/core/statsMultiplierTables', { recursive: true });
}

async function importRandPoints() {
  const res = await readCsvFromUrl(
    `https://wago.tools/db2/RandPropPoints/csv?build=${BUILD_NUMBER}`,
  );
  const data = csvToObject<RandPoint>(res);

  const result: number[] = [];
  const effectResult: number[] = [];
  let lastIlvl = -1;
  for (let index = 0; index < data.length; index += 1) {
    const ilvl = Number(data[index].ID);
    for (let i = lastIlvl + 1; i < ilvl; i += 1) {
      effectResult[i] = effectResult[i - 1] ?? 0;
      result[i] = result[i - 1] ?? 0;
    }
    effectResult[ilvl] = Number(data[index].DamageSecondaryF);
    result[ilvl] = Number(data[index].GoodF_0);
    lastIlvl = ilvl;
  }

  await ensureDirectory();

  await fs.promises.writeFile(
    `./src/parser/core/statsMultiplierTables/rand-points.generated.json`,
    JSON.stringify(result),
  );

  await fs.promises.writeFile(
    `./src/parser/core/statsMultiplierTables/effect-points.generated.json`,
    JSON.stringify(effectResult),
  );
}

let fileIndex: Record<string, string> | null = null;

async function getFileId(filename: string): Promise<string | undefined> {
  if (!fileIndex) {
    const req = await fetch(
      `https://github.com/wowdev/wow-listfile/releases/latest/download/community-listfile.csv`,
    );
    const res = await req.text();
    fileIndex = res
      .split('\r\n')
      .map((line) => line.split(';'))
      .reduce((data, [id, name]) => {
        data[name] = id;
        return data;
      }, {});
  }

  return fileIndex[filename];
}

async function importCombatRatings() {
  const fdid = await getFileId('gametables/combatratingsmultbyilvl.txt');
  if (!fdid) {
    return;
  }

  const res = await fetch(`https://wago.tools/api/casc/${fdid}`);

  const data = (await res.text()).split('\r\n');
  const result = {};
  const header = data[0].split('\t');
  for (const key of header) {
    if (key === 'Item Level') {
      continue;
    }
    result[key.split(' ')[0]] = [];
  }
  for (let index = 1; index < data.length; index += 1) {
    const row = data[index].split('\t');
    const ilvl = Number(row[0]);
    for (let colIndex = 1; colIndex < row.length; colIndex += 1) {
      const key = header[colIndex].split(' ')[0];
      result[key][ilvl] = Number(row[colIndex]);
    }
  }

  await ensureDirectory();

  await fs.promises.writeFile(
    `./src/parser/core/statsMultiplierTables/combat-rating-multipliers.generated.json`,
    JSON.stringify(result),
  );
}

await Promise.all([importRandPoints(), importCombatRatings()]);
