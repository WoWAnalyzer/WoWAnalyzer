import {
  EnchantmentInternalEntry,
  ItemEffectEntry,
  ItemEnchantmentStaticDataEntry,
  ItemXItemEffectEntry,
  SpellEffectEntry,
  TempEnchantsStaticDataEntry,
} from 'scripts/enchants/enchants-types';
import { Enchant } from 'common/ITEMS/Item';
import { csvToObject, readCsvFromUrl, slugify } from 'scripts/utils/helpers';

// https://wago.tools/api/builds/latest
const LIVE_WOW_BUILD_NUMBER = '12.0.1.66220';
const PTR_WOW_BUILD_NUMBER = '12.0.1.66220';

const BASE_DBC_URL = 'https://wago.tools/db2';

export function printEnchants(enchants: {
  type: string;
  enchants: {
    key: string;
    value: Enchant;
  }[];
}) {
  return `// region ${enchants.type}
  ${enchants.enchants
    .map(({ key, value }) => {
      return `${key}: ${JSON.stringify(value)},`;
    })
    .join('\n')}
  // endregion
  `;
}

export function getKeyedEnchantmentInternalEntries(entries: EnchantmentInternalEntry[]) {
  const map = entries.reduce<
    Record<string, { type: string; enchants: EnchantmentInternalEntry[] }>
  >((acc, entry) => {
    if (!acc[entry.type]) {
      acc[entry.type] = {
        type: entry.type,
        enchants: [],
      };
    }

    acc[entry.type].enchants.push(entry);

    return acc;
  }, {});

  return Object.values(map);
}

// region Item Enchants

export function mapItemEnchantmentStaticDataToInternalEntries(
  entries: ItemEnchantmentStaticDataEntry[],
): EnchantmentInternalEntry[] {
  return entries.map((entry) => {
    const category = entry?.categoryName ? `${entry.categoryName.split(' ')[0]}` : 'Other';

    return {
      type: category,
      key: createEnchantKey(entry.itemName, entry.craftingQuality, entry.categoryName),
      value: mapItemEnchantmentToEnchant(entry),
    };
  });
}

function mapItemEnchantmentToEnchant(entry: ItemEnchantmentStaticDataEntry): Enchant {
  return {
    id: entry?.itemId ?? -1,
    name: entry?.baseDisplayName ?? entry.itemName ?? entry.displayName,
    icon: entry?.itemIcon ?? entry.spellIcon,
    effectId: entry.id,
    craftQuality: entry.craftingQuality,
  };
}

// endregion

// region Temporary Enchants

export async function mapTempEnchantsStaticDataToInternalEntries(
  tempEnchants: TempEnchantsStaticDataEntry[],
  isPTR: boolean = false,
): Promise<EnchantmentInternalEntry[]> {
  const itemIds = tempEnchants.map((entry) => entry.itemId);
  const effectIdMap = await getEffectIdMapForItemIds(itemIds, isPTR);

  return tempEnchants.map((entry) => {
    return {
      type: 'Temporary Weapon Enchants',
      key: createEnchantKey(entry.name, entry.craftingQuality),
      value: mapTempEnchantToEnchant(entry, effectIdMap[entry.itemId]),
    };
  });
}

function mapTempEnchantToEnchant(
  tempEnchantsEntry: TempEnchantsStaticDataEntry,
  effectId: number,
): Enchant {
  return {
    id: tempEnchantsEntry.itemId,
    name: tempEnchantsEntry.name,
    icon: tempEnchantsEntry.icon,
    effectId: effectId,
    craftQuality: tempEnchantsEntry.craftingQuality,
  };
}

// endregion

// region Item ID to Effect ID

async function fetchItemIdToEffectIdDbcData(isPTR: boolean) {
  const build = isPTR ? PTR_WOW_BUILD_NUMBER : LIVE_WOW_BUILD_NUMBER;

  const [itemXItemEffectRaw, itemEffectRaw, spellEffectRaw] = await Promise.all([
    readCsvFromUrl(`${BASE_DBC_URL}/ItemXItemEffect/csv?build=${build}`),
    readCsvFromUrl(`${BASE_DBC_URL}/ItemEffect/csv?build=${build}`),
    readCsvFromUrl(`${BASE_DBC_URL}/SpellEffect/csv?build=${build}`),
  ]);

  return {
    itemXItemEffect: csvToObject<ItemXItemEffectEntry>(itemXItemEffectRaw),
    itemEffect: csvToObject<ItemEffectEntry>(itemEffectRaw),
    spellEffect: csvToObject<SpellEffectEntry>(spellEffectRaw),
  };
}

function buildItemIdToEffectIdLookupMaps(
  data: Awaited<ReturnType<typeof fetchItemIdToEffectIdDbcData>>,
  targetItemIds: Set<number>,
) {
  const itemIdToEffectId = new Map<number, number>();
  const relevantEffectIds = new Set<number>();

  // 1. Map ItemID -> ItemEffectID
  data.itemXItemEffect.forEach((entry) => {
    const itemId = Number(entry.ItemID);
    if (!targetItemIds.has(itemId)) return;

    const effectId = Number(entry.ItemEffectID);
    if (itemIdToEffectId.has(itemId) && itemIdToEffectId.get(itemId) !== effectId) {
      console.warn(`[Ambiguity] ItemID ${itemId} has multiple ItemEffectIDs. Using first.`);
    } else {
      itemIdToEffectId.set(itemId, effectId);
      relevantEffectIds.add(effectId);
    }
  });

  // 2. Map ItemEffectID -> SpellID
  const effectIdToSpellId = new Map<number, number>();
  const relevantSpellIds = new Set<number>();

  data.itemEffect.forEach((entry) => {
    const effectId = Number(entry.ID);
    if (!relevantEffectIds.has(effectId)) return;

    const spellId = Number(entry.SpellID);
    if (effectIdToSpellId.has(effectId) && effectIdToSpellId.get(effectId) !== spellId) {
      console.warn(`[Ambiguity] ItemEffectID ${effectId} has multiple SpellIDs. Using first.`);
    } else {
      effectIdToSpellId.set(effectId, spellId);
      relevantSpellIds.add(spellId);
    }
  });

  // 3. Map SpellID -> EffectMiscValue_0
  const spellIdToMiscValue = new Map<number, number>();

  data.spellEffect.forEach((entry) => {
    const spellId = Number(entry.SpellID);
    const miscValue = Number(entry.EffectMiscValue_0);

    if (!relevantSpellIds.has(spellId) || miscValue <= 0) return;

    if (spellIdToMiscValue.has(spellId) && spellIdToMiscValue.get(spellId) !== miscValue) {
      console.warn(`[Ambiguity] SpellID ${spellId} has multiple MiscValues. Using first.`);
    } else {
      spellIdToMiscValue.set(spellId, miscValue);
    }
  });

  return { itemIdToEffectId, effectIdToSpellId, spellIdToMiscValue };
}

async function getEffectIdMapForItemIds(
  itemIds: number[],
  isPTR: boolean = false,
): Promise<Record<number, number>> {
  const targetIds = new Set(itemIds);
  const rawData = await fetchItemIdToEffectIdDbcData(isPTR);
  const maps = buildItemIdToEffectIdLookupMaps(rawData, targetIds);

  return itemIds.reduce<Record<number, number>>((acc, itemId) => {
    const effectId = maps.itemIdToEffectId.get(itemId);
    const spellId = effectId ? maps.effectIdToSpellId.get(effectId) : null;
    const miscValue = spellId ? maps.spellIdToMiscValue.get(spellId) : null;

    if (miscValue) {
      acc[itemId] = miscValue;
    } else {
      console.warn(`Missing mapping for Item ${itemId}: Effect ${effectId}, Spell ${spellId}`);
    }

    return acc;
  }, {});
}

function createEnchantKey(name: string, craftingQuality?: number, category?: string) {
  const rank = craftingQuality ? `_R${craftingQuality}` : '';
  const categoryName = category ? `${category.split(' ')[0]}_` : '';

  return `${categoryName}${slugify(name, true)}${rank}`.toUpperCase();
}

// endregion
