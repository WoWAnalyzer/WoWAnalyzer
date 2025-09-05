/**
 * generate-list <branch> <class> <spec> [<targetPath>]
 *
 * if no target path is specified, uses a default of `src/analysis/<branch>/<class>/<spec>/spell-list_<class>_<spec>.<branch>.ts`
 *
 * Example:
 *
 *     pnpm run spell-lists:create classic DeathKnight Blood
 */

import * as fs from 'node:fs/promises';
import { CURRENT_GAME_VERSIONS, generateSpellData } from './internal.ts';

const [branch, className, specName, optTargetPath] = process.argv.slice(2);

const targetPath =
  optTargetPath ??
  `src/analysis/${branch}/${className.toLowerCase()}/${specName.toLowerCase()}/spell-list_${className}_${specName}.${branch}.ts`;

const gameVersion = CURRENT_GAME_VERSIONS[branch];
if (!gameVersion) {
  console.error(
    `invalid game branch ${branch} (known values: ${Object.keys(CURRENT_GAME_VERSIONS).join(', ')})`,
  );
  process.exit(-1);
}

const contents = await generateSpellData(branch, gameVersion, className, specName);

await fs.writeFile(targetPath, contents);

console.log(`wrote spell data to ${targetPath}`);
