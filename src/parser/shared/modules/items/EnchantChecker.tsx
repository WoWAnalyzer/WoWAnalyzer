
import ItemLink from 'common/ItemLink';
import ITEMS from 'common/ITEMS';
import SPECS from 'game/SPECS';

import Analyzer from 'parser/core/Analyzer';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { When } from 'parser/core/ParseResults';
import { Item } from 'parser/core/Events';

import React from 'react';
import { Trans } from '@lingui/macro';
import SPELLS from 'common/SPELLS';

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

class EnchantChecker extends Analyzer {

  static AGI_ENCHANTABLE_SLOTS = {
    4: <Trans id="common.slots.chest">Chest</Trans>,
    7: <Trans id="common.slots.boots">Boots</Trans>,
    10: <Trans id="common.slots.ring">Ring</Trans>,
    11: <Trans id="common.slots.ring">Ring</Trans>,
    14: <Trans id="common.slots.cloak">Cloak</Trans>,
    15: <Trans id="common.slots.weapon">Weapon</Trans>,
    16: <Trans id="common.slots.offhand">OffHand</Trans>,
  };

  static STR_ENCHANTABLE_SLOTS = {
    4: <Trans id="common.slots.chest">Chest</Trans>,
    9: <Trans id="common.slots.gloves">Gloves</Trans>,
    10: <Trans id="common.slots.ring">Ring</Trans>,
    11: <Trans id="common.slots.ring">Ring</Trans>,
    14: <Trans id="common.slots.cloak">Cloak</Trans>,
    15: <Trans id="common.slots.weapon">Weapon</Trans>,
    16: <Trans id="common.slots.offhand">OffHand</Trans>,
  };

  static INT_ENCHANTABLE_SLOTS = {
    4: <Trans id="common.slots.chest">Chest</Trans>,
    8: <Trans id="common.slots.bracers">Bracers</Trans>,
    10: <Trans id="common.slots.ring">Ring</Trans>,
    11: <Trans id="common.slots.ring">Ring</Trans>,
    14: <Trans id="common.slots.cloak">Cloak</Trans>,
    15: <Trans id="common.slots.weapon">Weapon</Trans>,
    16: <Trans id="common.slots.offhand">OffHand</Trans>,
  };

  static MIN_ENCHANT_IDS = [
    ITEMS.ENCHANT_RING_BARGAIN_OF_CRITICAL_STRIKE.id,
    ITEMS.ENCHANT_RING_BARGAIN_OF_HASTE.id,
    ITEMS.ENCHANT_RING_BARGAIN_OF_MASTERY.id,
    ITEMS.ENCHANT_RING_BARGAIN_OF_VERSATILITY.id,
    ITEMS.ENCHANT_CHEST_SACRED_STATS.id,
    ITEMS.ENCHANT_BRACERS_ILLUMINATED_SOUL.id,
    ITEMS.ENCHANT_GLOVES_STRENGTH_OF_SOUL.id,
    ITEMS.ENCHANT_BOOTS_AGILE_SOULWALKER.id,
  ];

  // TODO add the new weapon enchants
  static MAX_ENCHANT_IDS = [
    ITEMS.ENCHANT_RING_TENET_OF_CRITICAL_STRIKE.id,
    ITEMS.ENCHANT_RING_TENET_OF_HASTE.id,
    ITEMS.ENCHANT_RING_TENET_OF_MASTERY.id,
    ITEMS.ENCHANT_RING_TENET_OF_VERSATILITY.id,
    ITEMS.ENCHANT_CHEST_ETERNAL_STATS.id,
    ITEMS.ENCHANT_CHEST_ETERNAL_BOUNDS.id,
    ITEMS.ENCHANT_CHEST_ETERNAL_INSIGHT.id,
    ITEMS.ENCHANT_CHEST_ETERNAL_BULWARK.id,
    ITEMS.ENCHANT_CHEST_ETERNAL_SKIRMISH.id,
    ITEMS.ENCHANT_BRACERS_ETERNAL_INTELLECT.id,
    ITEMS.ENCHANT_GLOVES_ETERNAL_STRENGTH.id,
    ITEMS.ENCHANT_BOOTS_ETERNAL_AGILITY.id,
    ITEMS.ENCHANT_CLOAK_FORTIFIED_AVOIDANCE.id,
    ITEMS.ENCHANT_CLOAK_FORTIFIED_LEECH.id,
    ITEMS.ENCHANT_CLOAK_FORTIFIED_SPEED.id,
    ITEMS.ENCHANT_CLOAK_SOUL_VITALITY.id,
    ITEMS.ENCHANT_WEAPON_SINFUL_REVELATION.id,
    ITEMS.ENCHANT_WEAPON_ASCENDED_VIGOR.id,
    ITEMS.ENCHANT_WEAPON_CELESTIAL_GUIDANCE.id,
    ITEMS.ENCHANT_WEAPON_LIGHTLESS_FORCE.id,
    ITEMS.ENCHANT_WEAPON_INFRA_GREEN_REFLEX_SIGHT.id,
    ITEMS.ENCHANT_WEAPON_OPTICAL_TARGET_EMBIGGENER.id,

    // Death Knight only
    SPELLS.RUNE_OF_THE_FALLEN_CRUSADER.id,
    SPELLS.RUNE_OF_RAZORICE.id,
    SPELLS.RUNE_OF_THE_STONESKIN_GARGOYLE.id,
    SPELLS.RUNE_OF_HYSTERIA.id,
    SPELLS.RUNE_OF_SANGUINATION.id,
    SPELLS.RUNE_OF_APOCALYPSE.id,
    SPELLS.RUNE_OF_UNENDING_THIRST.id,
    SPELLS.RUNE_OF_SPELLWARDING.id,
  ];

  get enchantableGear() {
    const enchantSlots = AGI_SPECS.includes(this.selectedCombatant.specId) ? EnchantChecker.AGI_ENCHANTABLE_SLOTS : STR_SPECS.includes(this.selectedCombatant.specId) ? EnchantChecker.STR_ENCHANTABLE_SLOTS : EnchantChecker.INT_ENCHANTABLE_SLOTS;
    return Object.keys(enchantSlots).reduce((obj: {[key: number]: Item}, slot) => {
      const item = this.selectedCombatant._getGearItemBySlotId(Number(slot));

      // If there is no offhand, disregard the item.
      // If the icon has `offhand` in the name, we know it's not a weapon and doesn't need an enchant.
      // This is not an ideal way to determine if an offhand is a weapon.
      if (item.id === 0 || item.icon.includes('offhand') || item.icon.includes('shield')) {
        return obj;
      }
      obj[Number(slot)] = this.selectedCombatant._getGearItemBySlotId(Number(slot));

      return obj;
    }, {});
  }
  get numEnchantableGear() {
    return Object.keys(this.enchantableGear).length;
  }
  get slotsMissingEnchant() {
    const gear = this.enchantableGear;
    return Object.keys(gear).filter(slot => !this.hasEnchant(gear[Number(slot)]));
  }
  get numSlotsMissingEnchant() {
    return this.slotsMissingEnchant.length;
  }
  get slotsMissingMaxEnchant() {
    const gear = this.enchantableGear;
    return Object.keys(gear).filter(slot => this.hasEnchant(gear[Number(slot)]) && !this.hasMaxEnchant(gear[Number(slot)]));
  }
  get numSlotsMissingMaxEnchant() {
    return this.slotsMissingMaxEnchant.length;
  }
  hasEnchant(item: Item) {
    return Boolean(item.permanentEnchant);
  }
  hasMaxEnchant(item: Item) {
    return EnchantChecker.MAX_ENCHANT_IDS.includes(item.permanentEnchant ? item.permanentEnchant : 0);
  }

  suggestions(when: When) {
    const gear = this.enchantableGear;
    const enchantSlots: {[key: number]: JSX.Element} = AGI_SPECS.includes(this.selectedCombatant.specId) ? EnchantChecker.AGI_ENCHANTABLE_SLOTS : STR_SPECS.includes(this.selectedCombatant.specId) ? EnchantChecker.STR_ENCHANTABLE_SLOTS : EnchantChecker.INT_ENCHANTABLE_SLOTS;
    // iterating with keys instead of value because the values don't store what slot is being looked at
    Object.keys(gear)
      .forEach(slot => {
        const item = gear[Number(slot)];
        const slotName = enchantSlots[Number(slot)];
        const hasEnchant = this.hasEnchant(item);

        when(hasEnchant).isFalse()
          .addSuggestion((suggest, actual, recommended) => suggest(
              <Trans id="shared.enchantChecker.suggestions.noEnchant.label">
                Your <ItemLink id={item.id} quality={item.quality} details={item} icon={false}>{slotName}</ItemLink> is missing an enchant. Apply a strong enchant to very easily increase your throughput slightly.
              </Trans>,
            )
              .icon(item.icon)
              .staticImportance(SUGGESTION_IMPORTANCE.MAJOR));

        const noMaxEnchant = hasEnchant && !this.hasMaxEnchant(item);
        when(noMaxEnchant).isTrue()
          .addSuggestion((suggest, actual, recommended) => suggest(
              <Trans id="shared.enchantChecker.suggestions.weakEnchant.label">
                Your <ItemLink id={item.id} quality={item.quality} details={item} icon={false}>{slotName}</ItemLink> has a cheap enchant. Apply a strong enchant to very easily increase your throughput slightly.
              </Trans>,
            )
              .icon(item.icon)
              .staticImportance(SUGGESTION_IMPORTANCE.MINOR));
      });
  }
}

export default EnchantChecker;
