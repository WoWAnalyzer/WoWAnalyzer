import type { JSX } from 'react';
import { Trans } from '@lingui/react/macro';
import ITEMS from 'common/ITEMS/midnight/enchants';
import SPELLS from 'common/SPELLS/deathknight';
import { PRIMARY_STAT } from 'parser/shared/modules/features/STAT';
import BaseEnchantChecker from 'parser/shared/modules/items/EnchantChecker';

// Example logs with missing enchants:
// https://www.warcraftlogs.com/reports/CBAkyFWJVR1xXPgQ/?fight=34&source=29

const AGI_ENCHANTABLE_SLOTS = {
  4: <Trans id="common.slots.chest">Chest</Trans>,
  6: <Trans id="common.slots.legs">Legs</Trans>,
  7: <Trans id="common.slots.boots">Boots</Trans>,
  10: <Trans id="common.slots.ring">Ring</Trans>,
  11: <Trans id="common.slots.ring">Ring</Trans>,
  15: <Trans id="common.slots.weapon">Weapon</Trans>,
  16: <Trans id="common.slots.offhand">OffHand</Trans>,
};

const STR_ENCHANTABLE_SLOTS = {
  4: <Trans id="common.slots.chest">Chest</Trans>,
  6: <Trans id="common.slots.legs">Legs</Trans>,
  7: <Trans id="common.slots.boots">Boots</Trans>,
  10: <Trans id="common.slots.ring">Ring</Trans>,
  11: <Trans id="common.slots.ring">Ring</Trans>,
  15: <Trans id="common.slots.weapon">Weapon</Trans>,
  16: <Trans id="common.slots.offhand">OffHand</Trans>,
};

const INT_ENCHANTABLE_SLOTS = {
  4: <Trans id="common.slots.chest">Chest</Trans>,
  6: <Trans id="common.slots.legs">Legs</Trans>,
  7: <Trans id="common.slots.boots">Boots</Trans>,
  10: <Trans id="common.slots.ring">Ring</Trans>,
  11: <Trans id="common.slots.ring">Ring</Trans>,
  15: <Trans id="common.slots.weapon">Weapon</Trans>,
  16: <Trans id="common.slots.offhand">OffHand</Trans>,
};

const MIN_ENCHANT_IDS = [
  // #region Chest
  ITEMS.CHEST_MARK_OF_NALORAKK_R1.effectId,
  ITEMS.CHEST_MARK_OF_THE_MAGISTER_R1.effectId,
  ITEMS.CHEST_MARK_OF_THE_ROOTWARDEN_R1.effectId,
  ITEMS.CHEST_MARK_OF_THE_WORLDSOUL_R1.effectId,
  // #endregion

  // #region Legs
  ITEMS.BRIGHT_LINEN_SPELLTHREAD_R1.effectId,
  ITEMS.BRIGHT_LINEN_SPELLTHREAD_R2.effectId,
  ITEMS.SUNFIRE_SILK_SPELLTHREAD_R1.effectId,
  ITEMS.ARCANOWEAVE_SPELLTHREAD_R1.effectId,
  ITEMS.THALASSIAN_SCOUT_ARMOR_KIT_R1.effectId,
  ITEMS.THALASSIAN_SCOUT_ARMOR_KIT_R2.effectId,
  ITEMS.FOREST_HUNTERS_ARMOR_KIT_R1.effectId,
  ITEMS.BLOOD_KNIGHTS_ARMOR_KIT_R1.effectId,
  // #endregion

  // #region Boots
  ITEMS.BOOTS_FARSTRIDERS_HUNT_R1.effectId,
  ITEMS.BOOTS_LYNXS_DEXTERITY_R1.effectId,
  ITEMS.BOOTS_SHALADRASSILS_ROOTS_R1.effectId,
  // #endregion

  // #region Ring
  ITEMS.RING_AMANI_MASTERY_R1.effectId,
  ITEMS.RING_AMANI_MASTERY_R2.effectId,
  ITEMS.RING_EYES_OF_THE_EAGLE_R1.effectId,
  ITEMS.RING_NATURES_FURY_R1.effectId,
  ITEMS.RING_NATURES_FURY_R2.effectId,
  ITEMS.RING_NATURES_WRATH_R1.effectId,
  ITEMS.RING_SILVERMOONS_ALACRITY_R1.effectId,
  ITEMS.RING_SILVERMOONS_TENACITY_R1.effectId,
  ITEMS.RING_THALASSIAN_HASTE_R1.effectId,
  ITEMS.RING_THALASSIAN_HASTE_R2.effectId,
  ITEMS.RING_THALASSIAN_VERSATILITY_R1.effectId,
  ITEMS.RING_THALASSIAN_VERSATILITY_R2.effectId,
  ITEMS.RING_ZULJINS_MASTERY_R1.effectId,
  // #endregion

  // #region Helm
  ITEMS.HELM_BLESSING_OF_SPEED_R1.effectId,
  ITEMS.HELM_EMPOWERED_BLESSING_OF_SPEED_R1.effectId,
  ITEMS.HELM_EMPOWERED_HEX_OF_LEECHING_R1.effectId,
  ITEMS.HELM_EMPOWERED_RUNE_OF_AVOIDANCE_R1.effectId,
  ITEMS.HELM_HEX_OF_LEECHING_R1.effectId,
  ITEMS.HELM_RUNE_OF_AVOIDANCE_R1.effectId,
  // #endregion

  // #region Shoulder
  ITEMS.SHOULDERS_AKILZONS_CELERITY_R1.effectId,
  ITEMS.SHOULDERS_AMIRDRASSILS_GRACE_R1.effectId,
  ITEMS.SHOULDERS_FLIGHT_OF_THE_EAGLE_R1.effectId,
  ITEMS.SHOULDERS_FLIGHT_OF_THE_EAGLE_R2.effectId,
  ITEMS.SHOULDERS_NATURES_GRACE_R1.effectId,
  ITEMS.SHOULDERS_NATURES_GRACE_R2.effectId,
  ITEMS.SHOULDERS_SILVERMOONS_MENDING_R1.effectId,
  ITEMS.SHOULDERS_THALASSIAN_RECOVERY_R1.effectId,
  ITEMS.SHOULDERS_THALASSIAN_RECOVERY_R2.effectId,
  // #endregion

  // #region Weapon
  ITEMS.WEAPON_ACUITY_OF_THE_RENDOREI_R1.effectId,
  ITEMS.WEAPON_ARCANE_MASTERY_R1.effectId,
  ITEMS.WEAPON_BERSERKERS_RAGE_R1.effectId,
  ITEMS.WEAPON_FLAMES_OF_THE_SINDOREI_R1.effectId,
  ITEMS.WEAPON_JANALAIS_PRECISION_R1.effectId,
  ITEMS.WEAPON_STR_OF_HALAZZI_R1.effectId,
  ITEMS.WEAPON_WORLDSOUL_AEGIS_R1.effectId,
  ITEMS.WEAPON_WORLDSOUL_CRADLE_R1.effectId,
  ITEMS.WEAPON_WORLDSOUL_TENACITY_R1.effectId,
  // #endregion
] as const satisfies number[];

const MAX_ENCHANT_IDS = [
  // #region Chest
  ITEMS.CHEST_MARK_OF_NALORAKK_R2.effectId,
  ITEMS.CHEST_MARK_OF_THE_MAGISTER_R2.effectId,
  ITEMS.CHEST_MARK_OF_THE_ROOTWARDEN_R2.effectId,
  ITEMS.CHEST_MARK_OF_THE_WORLDSOUL_R2.effectId,
  // #endregion

  // #region Legs
  ITEMS.SUNFIRE_SILK_SPELLTHREAD_R2.effectId,
  ITEMS.ARCANOWEAVE_SPELLTHREAD_R2.effectId,
  ITEMS.FOREST_HUNTERS_ARMOR_KIT_R2.effectId,
  ITEMS.BLOOD_KNIGHTS_ARMOR_KIT_R2.effectId,
  // #endregion

  // #region Boots
  ITEMS.BOOTS_FARSTRIDERS_HUNT_R2.effectId,
  ITEMS.BOOTS_LYNXS_DEXTERITY_R2.effectId,
  ITEMS.BOOTS_SHALADRASSILS_ROOTS_R2.effectId,
  // #endregion

  // #region Ring
  ITEMS.RING_EYES_OF_THE_EAGLE_R2.effectId,
  ITEMS.RING_NATURES_WRATH_R2.effectId,
  ITEMS.RING_SILVERMOONS_ALACRITY_R2.effectId,
  ITEMS.RING_SILVERMOONS_TENACITY_R2.effectId,
  ITEMS.RING_ZULJINS_MASTERY_R2.effectId,
  // #endregion

  // #region Helm
  ITEMS.HELM_BLESSING_OF_SPEED_R2.effectId,
  ITEMS.HELM_EMPOWERED_BLESSING_OF_SPEED_R2.effectId,
  ITEMS.HELM_EMPOWERED_HEX_OF_LEECHING_R2.effectId,
  ITEMS.HELM_EMPOWERED_RUNE_OF_AVOIDANCE_R2.effectId,
  ITEMS.HELM_HEX_OF_LEECHING_R2.effectId,
  ITEMS.HELM_RUNE_OF_AVOIDANCE_R2.effectId,
  // #endregion

  // #region Shoulder
  ITEMS.SHOULDERS_AKILZONS_CELERITY_R2.effectId,
  ITEMS.SHOULDERS_AMIRDRASSILS_GRACE_R2.effectId,
  ITEMS.SHOULDERS_SILVERMOONS_MENDING_R2.effectId,
  // #endregion

  // #region Weapon
  ITEMS.WEAPON_ACUITY_OF_THE_RENDOREI_R2.effectId,
  ITEMS.WEAPON_ARCANE_MASTERY_R2.effectId,
  ITEMS.WEAPON_BERSERKERS_RAGE_R2.effectId,
  ITEMS.WEAPON_FLAMES_OF_THE_SINDOREI_R2.effectId,
  ITEMS.WEAPON_JANALAIS_PRECISION_R2.effectId,
  ITEMS.WEAPON_STR_OF_HALAZZI_R2.effectId,
  ITEMS.WEAPON_WORLDSOUL_AEGIS_R2.effectId,
  ITEMS.WEAPON_WORLDSOUL_CRADLE_R2.effectId,
  ITEMS.WEAPON_WORLDSOUL_TENACITY_R2.effectId,
  // #endregion

  // #region Weapon - Death Knight Exclusive
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
