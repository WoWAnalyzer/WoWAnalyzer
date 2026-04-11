import { getRaidbotsStaticDataUrl, readJsonFromUrl } from 'scripts/utils/helpers';
import fs from 'fs';
import {
  isItemEnchantment,
  EnchantmentStaticDataEntry,
  TempEnchantsStaticDataEntry,
} from 'scripts/enchants/enchants-types';
import {
  mapItemEnchantmentStaticDataToInternalEntries,
  groupEnchantsByType,
  mapTempEnchantsStaticDataToInternalEntries,
  printEnchants,
} from 'scripts/enchants/enchants-helpers';
import { RaidbotsStaticDataFile } from 'scripts/utils/raidbots-types';

const ENCHANTS_FILE = `./src/common/ITEMS/midnight/enchants.ts`;

const EXPANSION = 11;
const filterToExpansion = <T extends { expansion?: number }>(entry: T): boolean =>
  entry.expansion === EXPANSION;

async function generateEnchants(isPTR: boolean = false) {
  const enchantsData: EnchantmentStaticDataEntry[] = await readJsonFromUrl(
    getRaidbotsStaticDataUrl(RaidbotsStaticDataFile.Enchantments, isPTR),
  );

  const itemEnchants = enchantsData.filter(isItemEnchantment);
  const enchantsForExpansion = itemEnchants.filter(filterToExpansion);
  const itemEnchantsInternalEntries =
    mapItemEnchantmentStaticDataToInternalEntries(enchantsForExpansion);
  const keyedEnchantsByType = groupEnchantsByType(itemEnchantsInternalEntries);

  const tempEnchantsData: TempEnchantsStaticDataEntry[] = await readJsonFromUrl(
    getRaidbotsStaticDataUrl(RaidbotsStaticDataFile.TempEnchants, isPTR),
  );

  const tempEnchantsForExpansion = tempEnchantsData.filter(filterToExpansion);
  const temporaryEnchantmentsInternalEntries = await mapTempEnchantsStaticDataToInternalEntries(
    tempEnchantsForExpansion,
    isPTR,
  );
  const keyedTemporaryEnchantsByType = groupEnchantsByType(temporaryEnchantmentsInternalEntries);

  // WRITE TO FILE
  console.log(`Writing enchants...`);
  fs.writeFileSync(
    ENCHANTS_FILE,
    `// Generated file, changes will eventually be overwritten!
import { Enchant } from 'common/ITEMS/Item';

const enchants = {
  ${keyedEnchantsByType
    .concat(...keyedTemporaryEnchantsByType)
    .map(printEnchants)
    .join('')}
} satisfies Record<string, Enchant>;

export default enchants;`,
  );
}

const isPTR = process.argv.includes('--ptr');

generateEnchants(isPTR);
