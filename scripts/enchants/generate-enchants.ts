import { getRaidbotsStaticDataUrl, readJsonFromUrl } from 'scripts/utils/helpers';
import fs from 'fs';
import {
  isItemEnchantment,
  EnchantmentStaticDataEntry,
  TempEnchantsStaticDataEntry,
  EnchantmentInternalEntry,
} from 'scripts/enchants/enchants-types';
import {
  groupEnchantsByType,
  mapTempEnchantsStaticDataToInternalEntries,
  printEnchants,
  createEnchantKey,
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

  const itemEnchantsInternalEntries: EnchantmentInternalEntry[] = enchantsForExpansion
    .map((entry) => {
      let categoryName = 'Other';

      if (entry.categoryName) {
        // Format the category to match in-game naming
        const category = entry.categoryName.split(' ')[0];

        categoryName = (() => {
          switch (category) {
            case 'Rings':
              return 'Ring';
            case 'Boot':
              return 'Boots';
            case 'Shoulder':
              return 'Shoulders';
            default:
              return category;
          }
        })();
      }

      /** Enchants with no `categoryName` entry will generally look like this:
       * "displayName": "32 Int & 70 Sta"
       * "itemName": "Sunfire Silk Spellthread"
       *
       * Whilst enchants with a `categoryName` entry will generally look like this:
       * "baseDisplayName": "Enchant Ring - Amani Mast"
       * "displayName": "Enchant Ring - Amani Mast 1"
       * "itemName": "Amani Mastery"
       * "categoryName": "Rings Enchants"
       *
       * Raidbots truncates the `baseDisplayName` entry for better UX on their website
       * there can also be some weird spelling mistakes present in `baseDisplayName`.
       * So we will use `itemName` instead and insert our own category name where relevant */
      const enchantmentName = !entry.categoryName
        ? entry.itemName
        : `Enchant ${categoryName} - ${entry.itemName}`;

      if (!entry?.itemId) {
        console.warn(`Missing itemId for ${entry.itemName}`);
        return null;
      }

      return {
        type: categoryName,
        key: createEnchantKey(entry.itemName, entry.craftingQuality, categoryName),
        value: {
          id: entry?.itemId ?? -1,
          name: enchantmentName,
          icon: entry?.itemIcon ?? entry.spellIcon,
          effectId: entry.id,
          craftQuality: entry.craftingQuality,
        },
      };
    })
    .filter((x) => x !== null);

  const itemEnchantsByType = groupEnchantsByType(itemEnchantsInternalEntries);

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
  ${itemEnchantsByType
    .concat(...keyedTemporaryEnchantsByType)
    .map(printEnchants)
    .join('')}
} satisfies Record<string, Enchant>;

export default enchants;`,
  );
}

const isPTR = process.argv.includes('--ptr');

generateEnchants(isPTR);
