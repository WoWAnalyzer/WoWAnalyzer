import { format } from 'prettier';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import CONFIGS from 'parser';
import { CLASSIC_EXPANSION, isCurrentExpansion } from 'game/Expansion';
import isLatestPatch from 'game/isLatestPatch';

const supportedConfigs = CONFIGS.filter(
  (it) => it.exampleReport && isLatestPatch(it) && isCurrentExpansion(it.expansion),
);

const specs = supportedConfigs.map((config) => {
  const nameParts: string[] = [];
  const namePrefixParts: string[] = [];
  if (config.expansion === CLASSIC_EXPANSION) {
    namePrefixParts.push('Classic');
  }
  if (config.spec.specName) {
    nameParts.push(config.spec.specName);
  }
  nameParts.push(config.spec.className);
  return {
    name: nameParts.join(' '),
    fullName: namePrefixParts.concat(nameParts).join(' '),
    exampleReport: config.exampleReport,
    isLatestPatch: isLatestPatch(config),
    isClassic: config.expansion === CLASSIC_EXPANSION,
  };
});

const screamingSnakeCase = (str: string) => {
  return str
    .replace(/\d+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map((word) => word.toUpperCase())
    .join('_');
};

const rawTsFile = `
  // Generated file, changes will eventually be overwritten!

  ${specs
    .map((spec) => `export const ${screamingSnakeCase(spec.fullName)} = ${JSON.stringify(spec)};`)
    .join('\n')}

  export const SUPPORTED_SPECS = [${specs
    .map((spec) => screamingSnakeCase(spec.fullName))
    .join(', ')}];
`;
const formattedTsFile = format(rawTsFile, { parser: 'typescript' });

const configDirectory = join(__dirname, '..', '..', 'e2e', 'generated');
if (!existsSync(configDirectory)) {
  mkdirSync(configDirectory);
}

const pathToWriteConfigs = join(configDirectory, 'supportedSpecs.ts');
writeFileSync(pathToWriteConfigs, formattedTsFile, {
  encoding: 'utf-8',
});
console.log(`Wrote specs file to ${pathToWriteConfigs}`);
