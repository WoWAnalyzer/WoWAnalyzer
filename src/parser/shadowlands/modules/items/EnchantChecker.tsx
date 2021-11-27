import { Trans } from '@lingui/macro';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SPECS from 'game/SPECS';
import BaseEnchantChecker from 'parser/shared/modules/items/EnchantChecker';

// Example logs with missing enchants:
// https://www.warcraftlogs.com/reports/ydxavfGq1mBrM9Vc/#fight=1&source=14

const AGI_SPECS = [
  SPECS.GUARDIAN_DRUID.id,
  SPECS.FERAL_DRUID.id,
  SPECS.BEAST_MASTERY_HUNTER.id,
  SPECS.MARKSMANSHIP_HUNTER.id,
  SPECS.ASSASSINATION_ROGUE.id,
  SPECS.OUTLAW_ROGUE.id,
  SPECS.SUBTLETY_ROGUE.id,
  SPECS.ENHANCEMENT_SHAMAN.id,
  SPECS.BREWMASTER_MONK.id,
  SPECS.WINDWALKER_MONK.id,
  SPECS.VENGEANCE_DEMON_HUNTER.id,
  SPECS.HAVOC_DEMON_HUNTER.id,
  SPECS.SURVIVAL_HUNTER.id,
];

const STR_SPECS = [
  SPECS.PROTECTION_PALADIN.id,
  SPECS.PROTECTION_WARRIOR.id,
  SPECS.BLOOD_DEATH_KNIGHT.id,
  SPECS.RETRIBUTION_PALADIN.id,
  SPECS.ARMS_WARRIOR.id,
  SPECS.FURY_WARRIOR.id,
  SPECS.FROST_DEATH_KNIGHT.id,
  SPECS.UNHOLY_DEATH_KNIGHT.id,
];

const AGI_ENCHANTABLE_SLOTS = {
  4: <Trans id="common.slots.chest">Chest</Trans>,
  7: <Trans id="common.slots.boots">Boots</Trans>,
  10: <Trans id="common.slots.ring">Ring</Trans>,
  11: <Trans id="common.slots.ring">Ring</Trans>,
  14: <Trans id="common.slots.cloak">Cloak</Trans>,
  15: <Trans id="common.slots.weapon">Weapon</Trans>,
  16: <Trans id="common.slots.offhand">OffHand</Trans>,
};

const STR_ENCHANTABLE_SLOTS = {
  4: <Trans id="common.slots.chest">Chest</Trans>,
  9: <Trans id="common.slots.gloves">Gloves</Trans>,
  10: <Trans id="common.slots.ring">Ring</Trans>,
  11: <Trans id="common.slots.ring">Ring</Trans>,
  14: <Trans id="common.slots.cloak">Cloak</Trans>,
  15: <Trans id="common.slots.weapon">Weapon</Trans>,
  16: <Trans id="common.slots.offhand">OffHand</Trans>,
};

const INT_ENCHANTABLE_SLOTS = {
  4: <Trans id="common.slots.chest">Chest</Trans>,
  8: <Trans id="common.slots.bracers">Bracers</Trans>,
  10: <Trans id="common.slots.ring">Ring</Trans>,
  11: <Trans id="common.slots.ring">Ring</Trans>,
  14: <Trans id="common.slots.cloak">Cloak</Trans>,
  15: <Trans id="common.slots.weapon">Weapon</Trans>,
  16: <Trans id="common.slots.offhand">OffHand</Trans>,
};

const MIN_ENCHANT_IDS = [
  ITEMS.ENCHANT_RING_BARGAIN_OF_CRITICAL_STRIKE.effectId,
  ITEMS.ENCHANT_RING_BARGAIN_OF_HASTE.effectId,
  ITEMS.ENCHANT_RING_BARGAIN_OF_MASTERY.effectId,
  ITEMS.ENCHANT_RING_BARGAIN_OF_VERSATILITY.effectId,
  ITEMS.ENCHANT_CHEST_SACRED_STATS.effectId,
  ITEMS.ENCHANT_BRACERS_ILLUMINATED_SOUL.effectId,
  ITEMS.ENCHANT_GLOVES_STRENGTH_OF_SOUL.effectId,
  ITEMS.ENCHANT_BOOTS_AGILE_SOULWALKER.effectId,
];

// TODO add the new weapon enchants
const MAX_ENCHANT_IDS = [
  ITEMS.ENCHANT_RING_TENET_OF_CRITICAL_STRIKE.effectId,
  ITEMS.ENCHANT_RING_TENET_OF_HASTE.effectId,
  ITEMS.ENCHANT_RING_TENET_OF_MASTERY.effectId,
  ITEMS.ENCHANT_RING_TENET_OF_VERSATILITY.effectId,
  ITEMS.ENCHANT_CHEST_ETERNAL_STATS.effectId,
  ITEMS.ENCHANT_CHEST_ETERNAL_BOUNDS.effectId,
  ITEMS.ENCHANT_CHEST_ETERNAL_INSIGHT.effectId,
  ITEMS.ENCHANT_CHEST_ETERNAL_BULWARK.effectId,
  ITEMS.ENCHANT_CHEST_ETERNAL_SKIRMISH.effectId,
  ITEMS.ENCHANT_BRACERS_ETERNAL_INTELLECT.effectId,
  ITEMS.ENCHANT_GLOVES_ETERNAL_STRENGTH.effectId,
  ITEMS.ENCHANT_BOOTS_ETERNAL_AGILITY.effectId,
  ITEMS.ENCHANT_CLOAK_FORTIFIED_AVOIDANCE.effectId,
  ITEMS.ENCHANT_CLOAK_FORTIFIED_LEECH.effectId,
  ITEMS.ENCHANT_CLOAK_FORTIFIED_SPEED.effectId,
  ITEMS.ENCHANT_CLOAK_SOUL_VITALITY.effectId,
  ITEMS.ENCHANT_WEAPON_SINFUL_REVELATION.effectId,
  ITEMS.ENCHANT_WEAPON_ASCENDED_VIGOR.effectId,
  ITEMS.ENCHANT_WEAPON_CELESTIAL_GUIDANCE.effectId,
  ITEMS.ENCHANT_WEAPON_LIGHTLESS_FORCE.effectId,
  ITEMS.ENCHANT_WEAPON_INFRA_GREEN_REFLEX_SIGHT.effectId,
  ITEMS.ENCHANT_WEAPON_OPTICAL_TARGET_EMBIGGENER.effectId,

  // Death Knight only
  SPELLS.RUNE_OF_THE_FALLEN_CRUSADER.effectId,
  SPELLS.RUNE_OF_RAZORICE.effectId,
  SPELLS.RUNE_OF_THE_STONESKIN_GARGOYLE.effectId,
  SPELLS.RUNE_OF_HYSTERIA.effectId,
  SPELLS.RUNE_OF_SANGUINATION.effectId,
  SPELLS.RUNE_OF_APOCALYPSE.effectId,
  SPELLS.RUNE_OF_UNENDING_THIRST.effectId,
  SPELLS.RUNE_OF_SPELLWARDING.effectId,
];

class EnchantChecker extends BaseEnchantChecker {
  get EnchantableSlots(): any {
    return AGI_SPECS.includes(this.selectedCombatant.specId)
      ? AGI_ENCHANTABLE_SLOTS
      : STR_SPECS.includes(this.selectedCombatant.specId)
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
