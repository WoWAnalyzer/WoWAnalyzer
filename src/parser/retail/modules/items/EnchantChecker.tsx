import { Trans } from '@lingui/macro';
import ITEMS from 'common/ITEMS';
import { Enchant } from 'common/ITEMS/Item';
import SPELLS from 'common/SPELLS';
import { PRIMARY_STAT } from 'parser/shared/modules/features/STAT';
import BaseEnchantChecker from 'parser/shared/modules/items/EnchantChecker';

// Example logs with missing enchants:
// https://www.warcraftlogs.com/reports/ydxavfGq1mBrM9Vc/#fight=1&source=14

const AGI_ENCHANTABLE_SLOTS = {
  4: <Trans id="common.slots.chest">Chest</Trans>,
  5: <Trans id="common.slots.belt">Belt</Trans>,
  6: <Trans id="common.slots.legs">Legs</Trans>,
  7: <Trans id="common.slots.boots">Boots</Trans>,
  8: <Trans id="common.slots.bracers">Bracers</Trans>,
  10: <Trans id="common.slots.ring">Ring</Trans>,
  11: <Trans id="common.slots.ring">Ring</Trans>,
  14: <Trans id="common.slots.cloak">Cloak</Trans>,
  15: <Trans id="common.slots.weapon">Weapon</Trans>,
  16: <Trans id="common.slots.offhand">OffHand</Trans>,
};

const STR_ENCHANTABLE_SLOTS = {
  4: <Trans id="common.slots.chest">Chest</Trans>,
  5: <Trans id="common.slots.belt">Belt</Trans>,
  6: <Trans id="common.slots.legs">Legs</Trans>,
  7: <Trans id="common.slots.boots">Boots</Trans>,
  8: <Trans id="common.slots.bracers">Bracers</Trans>,
  10: <Trans id="common.slots.ring">Ring</Trans>,
  11: <Trans id="common.slots.ring">Ring</Trans>,
  14: <Trans id="common.slots.cloak">Cloak</Trans>,
  15: <Trans id="common.slots.weapon">Weapon</Trans>,
  16: <Trans id="common.slots.offhand">OffHand</Trans>,
};

const INT_ENCHANTABLE_SLOTS = {
  4: <Trans id="common.slots.chest">Chest</Trans>,
  5: <Trans id="common.slots.belt">Belt</Trans>,
  6: <Trans id="common.slots.legs">Legs</Trans>,
  7: <Trans id="common.slots.boots">Boots</Trans>,
  8: <Trans id="common.slots.bracers">Bracers</Trans>,
  10: <Trans id="common.slots.ring">Ring</Trans>,
  11: <Trans id="common.slots.ring">Ring</Trans>,
  14: <Trans id="common.slots.cloak">Cloak</Trans>,
  15: <Trans id="common.slots.weapon">Weapon</Trans>,
  16: <Trans id="common.slots.offhand">OffHand</Trans>,
};

const MIN_ENCHANT_IDS = [
  ITEMS.ENCHANT_WEAPON_BURNING_DEVOTION_R1,
  ITEMS.ENCHANT_WEAPON_BURNING_DEVOTION_R2,
  ITEMS.ENCHANT_WEAPON_EARTHEN_DEVOTION_R1,
  ITEMS.ENCHANT_WEAPON_EARTHEN_DEVOTION_R2,
  ITEMS.ENCHANT_WEAPON_FROZEN_DEVOTION_R1,
  ITEMS.ENCHANT_WEAPON_FROZEN_DEVOTION_R2,
  ITEMS.ENCHANT_WEAPON_SOPHIC_DEVOTION_R1,
  ITEMS.ENCHANT_WEAPON_SOPHIC_DEVOTION_R2,
  ITEMS.ENCHANT_WEAPON_WAFTING_DEVOTION_R1,
  ITEMS.ENCHANT_WEAPON_WAFTING_DEVOTION_R2,
  ITEMS.ENCHANT_WEAPON_BURNING_WRIT_R1,
  ITEMS.ENCHANT_WEAPON_BURNING_WRIT_R2,
  ITEMS.ENCHANT_WEAPON_BURNING_WRIT_R3,
  ITEMS.ENCHANT_WEAPON_EARTHEN_WRIT_R1,
  ITEMS.ENCHANT_WEAPON_EARTHEN_WRIT_R2,
  ITEMS.ENCHANT_WEAPON_EARTHEN_WRIT_R3,
  ITEMS.ENCHANT_WEAPON_FROZEN_WRIT_R1,
  ITEMS.ENCHANT_WEAPON_FROZEN_WRIT_R2,
  ITEMS.ENCHANT_WEAPON_FROZEN_WRIT_R3,
  ITEMS.ENCHANT_WEAPON_SOPHIC_WRIT_R1,
  ITEMS.ENCHANT_WEAPON_SOPHIC_WRIT_R2,
  ITEMS.ENCHANT_WEAPON_SOPHIC_WRIT_R3,
  ITEMS.ENCHANT_WEAPON_WAFTING_WRIT_R1,
  ITEMS.ENCHANT_WEAPON_WAFTING_WRIT_R2,
  ITEMS.ENCHANT_WEAPON_WAFTING_WRIT_R3,
  ITEMS.ENCHANT_WEAPON_SHADOWFLAME_WREATHE_R1,
  ITEMS.ENCHANT_WEAPON_SHADOWFLAME_WREATHE_R2,
  ITEMS.ENCHANT_WEAPON_SPORE_TENDER_R1,
  ITEMS.ENCHANT_WEAPON_SPORE_TENDER_R2,
  ITEMS.ENCHANT_WEAPON_HIGH_INTENSITY_THERMAL_SCANNER_R1,
  ITEMS.ENCHANT_WEAPON_HIGH_INTENSITY_THERMAL_SCANNER_R2,
  ITEMS.ENCHANT_WEAPON_PROJECTILE_PROPULSION_PINION_R1,
  ITEMS.ENCHANT_WEAPON_PROJECTILE_PROPULSION_PINION_R2,
  ITEMS.ENCHANT_WEAPON_GYROSCOPIC_KALEIDOSCOPE_R1,
  ITEMS.ENCHANT_WEAPON_GYROSCOPIC_KALEIDOSCOPE_R2,
  ITEMS.ENCHANT_WEAPON_DREAMING_DEVOTION_R1,
  ITEMS.ENCHANT_WEAPON_DREAMING_DEVOTION_R2,
  ITEMS.ENCHANT_BOOTS_PLAINSRUNNERS_BREEZE_R1,
  ITEMS.ENCHANT_BOOTS_PLAINSRUNNERS_BREEZE_R2,
  ITEMS.ENCHANT_BOOTS_RIDERS_REASSURANCE_R1,
  ITEMS.ENCHANT_BOOTS_RIDERS_REASSURANCE_R2,
  ITEMS.ENCHANT_BOOTS_WATCHERS_LOAM_R1,
  ITEMS.ENCHANT_BOOTS_WATCHERS_LOAM_R2,
  ITEMS.ENCHANT_CHEST_ACCELERATED_AGILITY_R1,
  ITEMS.ENCHANT_CHEST_ACCELERATED_AGILITY_R2,
  ITEMS.ENCHANT_CHEST_RESERVE_OF_INTELLECT_R1,
  ITEMS.ENCHANT_CHEST_RESERVE_OF_INTELLECT_R2,
  ITEMS.ENCHANT_CHEST_SUSTAINED_STRENGTH_R1,
  ITEMS.ENCHANT_CHEST_SUSTAINED_STRENGTH_R2,
  ITEMS.ENCHANT_CHEST_WAKING_STATS_R1,
  ITEMS.ENCHANT_CHEST_WAKING_STATS_R2,
  ITEMS.ENCHANT_CLOAK_GRACEFUL_AVOIDANCE_R1,
  ITEMS.ENCHANT_CLOAK_GRACEFUL_AVOIDANCE_R2,
  ITEMS.ENCHANT_CLOAK_HOMEBOUND_SPEED_R1,
  ITEMS.ENCHANT_CLOAK_HOMEBOUND_SPEED_R2,
  ITEMS.ENCHANT_CLOAK_REGENERATIVE_LEECH_R1,
  ITEMS.ENCHANT_CLOAK_REGENERATIVE_LEECH_R2,
  ITEMS.ENCHANT_CLOAK_WRIT_OF_AVOIDANCE_R1,
  ITEMS.ENCHANT_CLOAK_WRIT_OF_AVOIDANCE_R2,
  ITEMS.ENCHANT_CLOAK_WRIT_OF_AVOIDANCE_R3,
  ITEMS.ENCHANT_CLOAK_WRIT_OF_SPEED_R1,
  ITEMS.ENCHANT_CLOAK_WRIT_OF_SPEED_R2,
  ITEMS.ENCHANT_CLOAK_WRIT_OF_SPEED_R3,
  ITEMS.ENCHANT_CLOAK_WRIT_OF_LEECH_R1,
  ITEMS.ENCHANT_CLOAK_WRIT_OF_LEECH_R2,
  ITEMS.ENCHANT_CLOAK_WRIT_OF_LEECH_R3,
  ITEMS.ENCHANT_BRACER_DEVOTION_OF_AVOIDANCE_R1,
  ITEMS.ENCHANT_BRACER_DEVOTION_OF_AVOIDANCE_R2,
  ITEMS.ENCHANT_BRACER_DEVOTION_OF_LEECH_R1,
  ITEMS.ENCHANT_BRACER_DEVOTION_OF_LEECH_R2,
  ITEMS.ENCHANT_BRACER_DEVOTION_OF_SPEED_R1,
  ITEMS.ENCHANT_BRACER_DEVOTION_OF_SPEED_R2,
  ITEMS.ENCHANT_BRACER_WRIT_OF_AVOIDANCE_R1,
  ITEMS.ENCHANT_BRACER_WRIT_OF_AVOIDANCE_R2,
  ITEMS.ENCHANT_BRACER_WRIT_OF_AVOIDANCE_R3,
  ITEMS.ENCHANT_BRACER_WRIT_OF_SPEED_R1,
  ITEMS.ENCHANT_BRACER_WRIT_OF_SPEED_R2,
  ITEMS.ENCHANT_BRACER_WRIT_OF_SPEED_R3,
  ITEMS.ENCHANT_BRACER_WRIT_OF_LEECH_R1,
  ITEMS.ENCHANT_BRACER_WRIT_OF_LEECH_R2,
  ITEMS.ENCHANT_BRACER_WRIT_OF_LEECH_R3,
  ITEMS.ENCHANT_RING_DEVOTION_OF_CRITICAL_STRIKE_R1,
  ITEMS.ENCHANT_RING_DEVOTION_OF_CRITICAL_STRIKE_R2,
  ITEMS.ENCHANT_RING_DEVOTION_OF_HASTE_R1,
  ITEMS.ENCHANT_RING_DEVOTION_OF_HASTE_R2,
  ITEMS.ENCHANT_RING_DEVOTION_OF_MASTERY_R1,
  ITEMS.ENCHANT_RING_DEVOTION_OF_MASTERY_R2,
  ITEMS.ENCHANT_RING_DEVOTION_OF_VERSATILITY_R1,
  ITEMS.ENCHANT_RING_DEVOTION_OF_VERSATILITY_R2,
  ITEMS.ENCHANT_RING_WRIT_OF_CRITICAL_STRIKE_R1,
  ITEMS.ENCHANT_RING_WRIT_OF_CRITICAL_STRIKE_R2,
  ITEMS.ENCHANT_RING_WRIT_OF_CRITICAL_STRIKE_R3,
  ITEMS.ENCHANT_RING_WRIT_OF_HASTE_R1,
  ITEMS.ENCHANT_RING_WRIT_OF_HASTE_R2,
  ITEMS.ENCHANT_RING_WRIT_OF_HASTE_R3,
  ITEMS.ENCHANT_RING_WRIT_OF_MASTERY_R1,
  ITEMS.ENCHANT_RING_WRIT_OF_MASTERY_R2,
  ITEMS.ENCHANT_RING_WRIT_OF_MASTERY_R3,
  ITEMS.ENCHANT_RING_WRIT_OF_VERSATILITY_R1,
  ITEMS.ENCHANT_RING_WRIT_OF_VERSATILITY_R2,
  ITEMS.ENCHANT_RING_WRIT_OF_VERSATILITY_R3,
  ITEMS.FIERCE_ARMOR_KIT_R1,
  ITEMS.FIERCE_ARMOR_KIT_R2,
  ITEMS.FROSTED_ARMOR_KIT_R1,
  ITEMS.FROSTED_ARMOR_KIT_R2,
  ITEMS.LAMBENT_ARMOR_KIT_R1,
  ITEMS.LAMBENT_ARMOR_KIT_R2,
  ITEMS.FROZEN_SPELLTHREAD_R1,
  ITEMS.FROZEN_SPELLTHREAD_R2,
  ITEMS.TEMPORAL_SPELLTHREAD_R1,
  ITEMS.TEMPORAL_SPELLTHREAD_R2,
  ITEMS.SHADOWED_BELT_CLASP_R1,
  ITEMS.SHADOWED_BELT_CLASP_R2,
].map((item) => (item as Enchant).effectId);

const MAX_ENCHANT_IDS = [
  ITEMS.ENCHANT_WEAPON_BURNING_DEVOTION_R3,
  ITEMS.ENCHANT_WEAPON_EARTHEN_DEVOTION_R3,
  ITEMS.ENCHANT_WEAPON_FROZEN_DEVOTION_R3,
  ITEMS.ENCHANT_WEAPON_SOPHIC_DEVOTION_R3,
  ITEMS.ENCHANT_WEAPON_WAFTING_DEVOTION_R3,
  ITEMS.ENCHANT_WEAPON_SHADOWFLAME_WREATHE_R3,
  ITEMS.ENCHANT_WEAPON_SPORE_TENDER_R3,
  ITEMS.ENCHANT_WEAPON_HIGH_INTENSITY_THERMAL_SCANNER_R3,
  ITEMS.ENCHANT_WEAPON_PROJECTILE_PROPULSION_PINION_R3,
  ITEMS.ENCHANT_WEAPON_GYROSCOPIC_KALEIDOSCOPE_R3,
  ITEMS.ENCHANT_WEAPON_DREAMING_DEVOTION_R3,
  ITEMS.ENCHANT_BOOTS_PLAINSRUNNERS_BREEZE_R3,
  ITEMS.ENCHANT_BOOTS_RIDERS_REASSURANCE_R3,
  ITEMS.ENCHANT_BOOTS_WATCHERS_LOAM_R3,
  ITEMS.ENCHANT_CHEST_ACCELERATED_AGILITY_R3,
  ITEMS.ENCHANT_CHEST_RESERVE_OF_INTELLECT_R3,
  ITEMS.ENCHANT_CHEST_SUSTAINED_STRENGTH_R3,
  ITEMS.ENCHANT_CHEST_WAKING_STATS_R3,
  ITEMS.ENCHANT_CLOAK_GRACEFUL_AVOIDANCE_R3,
  ITEMS.ENCHANT_CLOAK_HOMEBOUND_SPEED_R3,
  ITEMS.ENCHANT_CLOAK_REGENERATIVE_LEECH_R3,
  ITEMS.ENCHANT_BRACER_DEVOTION_OF_AVOIDANCE_R3,
  ITEMS.ENCHANT_BRACER_DEVOTION_OF_LEECH_R3,
  ITEMS.ENCHANT_BRACER_DEVOTION_OF_SPEED_R3,
  ITEMS.ENCHANT_RING_DEVOTION_OF_CRITICAL_STRIKE_R3,
  ITEMS.ENCHANT_RING_DEVOTION_OF_HASTE_R3,
  ITEMS.ENCHANT_RING_DEVOTION_OF_MASTERY_R3,
  ITEMS.ENCHANT_RING_DEVOTION_OF_VERSATILITY_R3,

  ITEMS.FIERCE_ARMOR_KIT_R3,
  ITEMS.FROSTED_ARMOR_KIT_R3,
  ITEMS.LAMBENT_ARMOR_KIT_R3,
  ITEMS.FROZEN_SPELLTHREAD_R3,
  ITEMS.TEMPORAL_SPELLTHREAD_R3,

  ITEMS.SHADOWED_BELT_CLASP_R3,

  // Death Knight only
  SPELLS.RUNE_OF_THE_FALLEN_CRUSADER,
  SPELLS.RUNE_OF_RAZORICE,
  SPELLS.RUNE_OF_THE_STONESKIN_GARGOYLE,
  SPELLS.RUNE_OF_HYSTERIA,
  SPELLS.RUNE_OF_SANGUINATION,
  SPELLS.RUNE_OF_APOCALYPSE,
  SPELLS.RUNE_OF_UNENDING_THIRST,
  SPELLS.RUNE_OF_SPELLWARDING,
].map((item) => (item as Enchant).effectId);

class EnchantChecker extends BaseEnchantChecker {
  get EnchantableSlots(): Record<number, JSX.Element> {
    return this.selectedCombatant.spec?.primaryStat === PRIMARY_STAT.AGILITY
      ? AGI_ENCHANTABLE_SLOTS
      : this.selectedCombatant.spec?.primaryStat === PRIMARY_STAT.STRENGTH
        ? STR_ENCHANTABLE_SLOTS
        : INT_ENCHANTABLE_SLOTS;
  }

  get MinEnchantIds(): number[] {
    return MIN_ENCHANT_IDS;
  }

  get MaxEnchantIds(): number[] {
    return MAX_ENCHANT_IDS;
  }
}

export default EnchantChecker;
