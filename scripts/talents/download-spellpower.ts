import { createWriteStream, existsSync } from 'node:fs';
import { mkdir, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';

import { PathLike } from 'fs';

const ensureDir = (path: PathLike) => mkdir(path, { mode: 0o777, recursive: true });

const downloadWagoToolsCsv = async (
  tableName: string,
  build: string,
  skipIfExisting: boolean = false,
) => {
  const dataDirectory = join(process.cwd(), 'scripts', 'talents');
  await ensureDir(dataDirectory);
  const pathToSave = join(dataDirectory, `${tableName.toLowerCase()}_${build}.csv`);
  if (existsSync(pathToSave)) {
    if (skipIfExisting) {
      return;
    }
    await unlink(pathToSave);
  }

  const response = await fetch(`https://wago.tools/db2/${tableName}/csv?build=${build}`);
  if (!response.body) {
    throw new Error(`Unable to retrieve table ${tableName} for build ${build}`);
  }

  const fileStream = createWriteStream(pathToSave, {
    flags: 'wx',
    encoding: 'utf-8',
  });
  // @ts-expect-error Browser/Node incompatibility
  await finished(Readable.fromWeb(response.body).pipe(fileStream));
};

(async () => {
  const argv = process.argv.slice(2);
  if (argv.length === 0) {
    console.log('Please provide a SpellPower version to download!');
    process.exit(1);
  }

  const spellpowerVersion = argv[0];
  await downloadWagoToolsCsv('SpellPower', spellpowerVersion, true);
})().catch(console.error);
