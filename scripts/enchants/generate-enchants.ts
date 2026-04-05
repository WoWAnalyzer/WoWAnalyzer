import { readJsonFromUrl } from 'scripts/utils/helpers';
import fs from 'fs';
import {
  isItemEnchantment,
  EnchantmentStaticDataEntry,
  RaidbotsStaticDataFile,
  TempEnchantsStaticDataEntry,
} from 'scripts/enchants/enchants-types';
import {
  mapItemEnchantmentStaticDataToInternalEntries,
  getKeyedEnchantmentInternalEntries,
  mapTempEnchantsStaticDataToInternalEntries,
  printEnchants,
} from 'scripts/enchants/enchants-helpers';

const ENCHANTS_DIR = `./src/common/ITEMS/midnight/enchants.ts`;

// 'live' uses latests live data - can also specify a specific build instead if needed
const LIVE_STATIC_DATA_URL = `https://www.raidbots.com/static/data/live`;
const PTR_STATIC_DATA_URL = `https://www.raidbots.com/static/data/ptr`;

const getRaidbotsStaticDataUrl = (dataType: RaidbotsStaticDataFile, ptr: boolean = false) =>
  ptr ? `${PTR_STATIC_DATA_URL}/${dataType}.json` : `${LIVE_STATIC_DATA_URL}/${dataType}.json`;

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
  const keyedEnchantsByType = getKeyedEnchantmentInternalEntries(itemEnchantsInternalEntries);

  const tempEnchantsData: TempEnchantsStaticDataEntry[] = await readJsonFromUrl(
    getRaidbotsStaticDataUrl(RaidbotsStaticDataFile.TempEnchants, isPTR),
  );

  const tempEnchantsForExpansion = tempEnchantsData.filter(filterToExpansion);
  const temporaryEnchantmentsInternalEntries = await mapTempEnchantsStaticDataToInternalEntries(
    tempEnchantsForExpansion,
    isPTR,
  );
  const keyedTemporaryEnchantsByType = getKeyedEnchantmentInternalEntries(
    temporaryEnchantmentsInternalEntries,
  );

  // WRITE TO FILE
  console.log(`Writing enchants...`);
  fs.writeFileSync(
    ENCHANTS_DIR,
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
