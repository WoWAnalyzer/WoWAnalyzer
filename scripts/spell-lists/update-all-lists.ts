import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { CURRENT_GAME_VERSIONS, generateSpellData } from './internal.ts';

// i don't like doing this with regex but it *is* simpler
const IMPORT_REGEX =
  /import .+ from ['"](?<targetFileName>.*spell-list_(?<className>[a-zA-Z]+)_(?<specName>[a-zA-Z]+)\.(?<gameBranch>[a-zA-Z]+))['"];/g;

const globPatterns = process.argv.slice(2);

const DEBUG = false;

const completed = new Set();

for (const pattern of globPatterns) {
  const files = fs.glob(pattern);
  for await (const fileName of files) {
    DEBUG && console.log(`examining source file ${fileName}...`);
    const contents = await fs.readFile(fileName, { encoding: 'utf8' });

    const imports = contents.matchAll(IMPORT_REGEX);

    for (const import_ of imports) {
      const { className, specName, gameBranch, targetFileName } = import_.groups!;
      const targetPath = path.join(path.dirname(fileName), targetFileName + '.ts');

      if (completed.has(targetPath)) {
        continue;
      }

      console.log(`found import of ${className}-${specName} for branch ${gameBranch}`);

      const gameVersion = CURRENT_GAME_VERSIONS[gameBranch];

      if (!gameVersion) {
        console.error(`invalid game branch ${gameBranch} in file ${fileName}`);
        continue;
      }
      try {
        const contents = await generateSpellData(gameBranch, gameVersion, className, specName);
        await fs.writeFile(targetPath, contents);

        completed.add(targetPath);

        console.log(`wrote spell data to ${targetPath}`);
      } catch (e) {
        console.log(e);
        continue;
      }
    }
  }
}
