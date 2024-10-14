import { Trans } from '@lingui/macro';
import ITEMS from 'common/ITEMS/thewarwithin/enchants';
import SPELLS from 'common/SPELLS/deathknight';
import { PRIMARY_STAT } from 'parser/shared/modules/features/STAT';
import BaseEnchantChecker from 'parser/shared/modules/items/EnchantChecker';

// Example logs with missing enchants:
// https://www.warcraftlogs.com/reports/ydxavfGq1mBrM9Vc/#fight=1&source=14

const AGI_ENCHANTABLE_SLOTS = {
  4: <Trans id="common.slots.chest">Chest</Trans>,
  // 5: <Trans id="common.slots.belt">Belt</Trans>,
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
  // 5: <Trans id="common.slots.belt">Belt</Trans>,
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
  // 5: <Trans id="common.slots.belt">Belt</Trans>,
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
  // #region Chest
  ITEMS.COUNCILS_INTELLECT_R1.effectId,
  ITEMS.COUNCILS_INTELLECT_R2.effectId,
  ITEMS.OATHSWORNS_STRENGTH_R1.effectId,
  ITEMS.OATHSWORNS_STRENGTH_R2.effectId,
  ITEMS.STORMRIDERS_AGILITY_R1.effectId,
  ITEMS.STORMRIDERS_AGILITY_R2.effectId,
  ITEMS.CRYSTALLINE_RADIANCE_R1.effectId,
  ITEMS.CRYSTALLINE_RADIANCE_R2.effectId,
  // #endregion

  // #region Legs
  ITEMS.DUAL_LAYERED_ARMOR_KIT_R1.effectId,
  ITEMS.DUAL_LAYERED_ARMOR_KIT_R2.effectId,
  ITEMS.DUAL_LAYERED_ARMOR_KIT_R3.effectId,
  ITEMS.DEFENDERS_ARMOR_KIT_R1.effectId,
  ITEMS.DEFENDERS_ARMOR_KIT_R2.effectId,
  ITEMS.STORMBOUND_ARMOR_KIT_R1.effectId,
  ITEMS.STORMBOUND_ARMOR_KIT_R2.effectId,
  ITEMS.WEAVERCLOTH_SPELLTHREAD_R1.effectId,
  ITEMS.WEAVERCLOTH_SPELLTHREAD_R2.effectId,
  ITEMS.WEAVERCLOTH_SPELLTHREAD_R3.effectId,
  ITEMS.SUNSET_SPELLTHREAD_R1.effectId,
  ITEMS.SUNSET_SPELLTHREAD_R2.effectId,
  ITEMS.DAYBREAK_SPELLTHREAD_R1.effectId,
  ITEMS.DAYBREAK_SPELLTHREAD_R2.effectId,
  // #endregion

  // #region Boots
  ITEMS.CAVALRYS_MARCH_R1.effectId,
  ITEMS.CAVALRYS_MARCH_R2.effectId,
  ITEMS.CAVALRYS_MARCH_R3.effectId,
  ITEMS.DEFENDERS_MARCH_R1.effectId,
  ITEMS.DEFENDERS_MARCH_R2.effectId,
  ITEMS.SCOUTS_MARCH_R1.effectId,
  ITEMS.SCOUTS_MARCH_R2.effectId,
  // #endregion

  // #region Bracers
  ITEMS.WHISPER_OF_ARMORED_AVOIDANCE_R1.effectId,
  ITEMS.WHISPER_OF_ARMORED_AVOIDANCE_R2.effectId,
  ITEMS.WHISPER_OF_ARMORED_AVOIDANCE_R3.effectId,
  ITEMS.WHISPER_OF_ARMORED_LEECH_R1.effectId,
  ITEMS.WHISPER_OF_ARMORED_LEECH_R2.effectId,
  ITEMS.WHISPER_OF_ARMORED_LEECH_R3.effectId,
  ITEMS.WHISPER_OF_ARMORED_SPEED_R1.effectId,
  ITEMS.WHISPER_OF_ARMORED_SPEED_R2.effectId,
  ITEMS.WHISPER_OF_ARMORED_SPEED_R3.effectId,
  ITEMS.CHANT_OF_ARMORED_AVOIDANCE_R1.effectId,
  ITEMS.CHANT_OF_ARMORED_AVOIDANCE_R2.effectId,
  ITEMS.CHANT_OF_ARMORED_LEECH_R1.effectId,
  ITEMS.CHANT_OF_ARMORED_LEECH_R2.effectId,
  ITEMS.CHANT_OF_ARMORED_SPEED_R1.effectId,
  ITEMS.CHANT_OF_ARMORED_SPEED_R2.effectId,
  // #endregion

  // #region Ring
  ITEMS.GLIMMERING_CRITICAL_STRIKE_R1.effectId,
  ITEMS.GLIMMERING_CRITICAL_STRIKE_R2.effectId,
  ITEMS.GLIMMERING_CRITICAL_STRIKE_R3.effectId,
  ITEMS.GLIMMERING_HASTE_R1.effectId,
  ITEMS.GLIMMERING_HASTE_R2.effectId,
  ITEMS.GLIMMERING_HASTE_R3.effectId,
  ITEMS.GLIMMERING_MASTERY_R1.effectId,
  ITEMS.GLIMMERING_MASTERY_R2.effectId,
  ITEMS.GLIMMERING_MASTERY_R3.effectId,
  ITEMS.GLIMMERING_VERSATILITY_R1.effectId,
  ITEMS.GLIMMERING_VERSATILITY_R2.effectId,
  ITEMS.GLIMMERING_VERSATILITY_R3.effectId,
  ITEMS.CURSED_CRITICAL_STRIKE_R1.effectId,
  ITEMS.CURSED_CRITICAL_STRIKE_R2.effectId,
  ITEMS.CURSED_HASTE_R1.effectId,
  ITEMS.CURSED_HASTE_R2.effectId,
  ITEMS.CURSED_MASTERY_R1.effectId,
  ITEMS.CURSED_MASTERY_R2.effectId,
  ITEMS.CURSED_VERSATILITY_R1.effectId,
  ITEMS.CURSED_VERSATILITY_R2.effectId,
  ITEMS.RADIANT_CRITICAL_STRIKE_R1.effectId,
  ITEMS.RADIANT_CRITICAL_STRIKE_R2.effectId,
  ITEMS.RADIANT_HASTE_R1.effectId,
  ITEMS.RADIANT_HASTE_R2.effectId,
  ITEMS.RADIANT_MASTERY_R1.effectId,
  ITEMS.RADIANT_MASTERY_R2.effectId,
  ITEMS.RADIANT_VERSATILITY_R1.effectId,
  ITEMS.RADIANT_VERSATILITY_R2.effectId,
  // #endregion

  // #region Cloak
  ITEMS.CHANT_OF_BURROWING_RAPIDITY_R1.effectId,
  ITEMS.CHANT_OF_BURROWING_RAPIDITY_R2.effectId,
  ITEMS.CHANT_OF_LEECHING_FANGS_R1.effectId,
  ITEMS.CHANT_OF_LEECHING_FANGS_R2.effectId,
  ITEMS.CHANT_OF_WINGED_GRACE_R1.effectId,
  ITEMS.CHANT_OF_WINGED_GRACE_R2.effectId,
  ITEMS.WHISPER_OF_SILKEN_AVOIDANCE_R1.effectId,
  ITEMS.WHISPER_OF_SILKEN_AVOIDANCE_R2.effectId,
  ITEMS.WHISPER_OF_SILKEN_AVOIDANCE_R3.effectId,
  ITEMS.WHISPER_OF_SILKEN_LEECH_R1.effectId,
  ITEMS.WHISPER_OF_SILKEN_LEECH_R2.effectId,
  ITEMS.WHISPER_OF_SILKEN_LEECH_R3.effectId,
  ITEMS.WHISPER_OF_SILKEN_SPEED_R1.effectId,
  ITEMS.WHISPER_OF_SILKEN_SPEED_R2.effectId,
  ITEMS.WHISPER_OF_SILKEN_SPEED_R3.effectId,
  // #endregion

  // #region Weapon
  ITEMS.AUTHORITY_OF_AIR_R1.effectId,
  ITEMS.AUTHORITY_OF_AIR_R2.effectId,
  ITEMS.AUTHORITY_OF_FIERY_RESOLVE_R1.effectId,
  ITEMS.AUTHORITY_OF_FIERY_RESOLVE_R2.effectId,
  ITEMS.AUTHORITY_OF_RADIANT_POWER_R1.effectId,
  ITEMS.AUTHORITY_OF_RADIANT_POWER_R2.effectId,
  ITEMS.AUTHORITY_OF_STORMS_R1.effectId,
  ITEMS.AUTHORITY_OF_STORMS_R2.effectId,
  ITEMS.AUTHORITY_OF_THE_DEPTHS_R1.effectId,
  ITEMS.AUTHORITY_OF_THE_DEPTHS_R2.effectId,
  ITEMS.OATHSWORNS_TENACITY_R1.effectId,
  ITEMS.OATHSWORNS_TENACITY_R2.effectId,
  ITEMS.OATHSWORNS_TENACITY_R3.effectId,
  ITEMS.COUNCILS_GUILE_R1.effectId,
  ITEMS.COUNCILS_GUILE_R2.effectId,
  ITEMS.COUNCILS_GUILE_R3.effectId,
  ITEMS.STONEBOUND_ARTISTRY_R1.effectId,
  ITEMS.STONEBOUND_ARTISTRY_R2.effectId,
  ITEMS.STONEBOUND_ARTISTRY_R3.effectId,
  // #endregion
] as const satisfies number[];

const MAX_ENCHANT_IDS = [
  // #region Chest
  ITEMS.COUNCILS_INTELLECT_R3.effectId,
  ITEMS.OATHSWORNS_STRENGTH_R3.effectId,
  ITEMS.STORMRIDERS_AGILITY_R3.effectId,
  ITEMS.CRYSTALLINE_RADIANCE_R3.effectId,
  // #endregion

  // #region Legs
  ITEMS.DEFENDERS_ARMOR_KIT_R3.effectId,
  ITEMS.STORMBOUND_ARMOR_KIT_R3.effectId,
  ITEMS.SUNSET_SPELLTHREAD_R3.effectId,
  ITEMS.DAYBREAK_SPELLTHREAD_R3.effectId,
  // #endregion

  // #region Boots
  ITEMS.DEFENDERS_MARCH_R3.effectId,
  ITEMS.SCOUTS_MARCH_R3.effectId,
  // #endregion

  // #region Bracers
  ITEMS.CHANT_OF_ARMORED_AVOIDANCE_R3.effectId,
  ITEMS.CHANT_OF_ARMORED_LEECH_R3.effectId,
  ITEMS.CHANT_OF_ARMORED_SPEED_R3.effectId,
  // #endregion

  // #region Ring
  ITEMS.CURSED_CRITICAL_STRIKE_R3.effectId,
  ITEMS.CURSED_HASTE_R3.effectId,
  ITEMS.CURSED_MASTERY_R3.effectId,
  ITEMS.CURSED_VERSATILITY_R3.effectId,
  ITEMS.RADIANT_CRITICAL_STRIKE_R3.effectId,
  ITEMS.RADIANT_HASTE_R3.effectId,
  ITEMS.RADIANT_MASTERY_R3.effectId,
  ITEMS.RADIANT_VERSATILITY_R3.effectId,
  // #endregion

  // #region Cloak
  ITEMS.CHANT_OF_BURROWING_RAPIDITY_R3.effectId,
  ITEMS.CHANT_OF_LEECHING_FANGS_R3.effectId,
  ITEMS.CHANT_OF_WINGED_GRACE_R3.effectId,
  // #endregion

  // #region Weapon
  ITEMS.AUTHORITY_OF_AIR_R3.effectId,
  ITEMS.AUTHORITY_OF_FIERY_RESOLVE_R3.effectId,
  ITEMS.AUTHORITY_OF_RADIANT_POWER_R3.effectId,
  ITEMS.AUTHORITY_OF_STORMS_R3.effectId,
  ITEMS.AUTHORITY_OF_THE_DEPTHS_R3.effectId,

  // Death Knight only
  SPELLS.RUNE_OF_THE_FALLEN_CRUSADER.effectId,
  SPELLS.RUNE_OF_RAZORICE.effectId,
  SPELLS.RUNE_OF_THE_STONESKIN_GARGOYLE.effectId,
  SPELLS.RUNE_OF_HYSTERIA.effectId,
  SPELLS.RUNE_OF_SANGUINATION.effectId,
  SPELLS.RUNE_OF_APOCALYPSE.effectId,
  SPELLS.RUNE_OF_UNENDING_THIRST.effectId,
  SPELLS.RUNE_OF_SPELLWARDING.effectId,
  // #endregion
] as const satisfies number[];

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
