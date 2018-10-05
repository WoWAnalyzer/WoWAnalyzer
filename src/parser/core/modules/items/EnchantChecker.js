import React from 'react';

import ItemLink from 'common/ItemLink';
import ITEMS from 'common/ITEMS/bfa/enchants';

import Analyzer from 'parser/core/Analyzer';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';

// Example logs with missing enchants:
// https://www.warcraftlogs.com/reports/ydxavfGq1mBrM9Vc/#fight=1&source=14

class EnchantChecker extends Analyzer {

  static ENCHANTABLE_SLOTS = {
    10: 'Ring',
    11: 'Ring',
    15: 'Weapon',
    16: 'OffHand',
  };
  static MAX_ENCHANT_IDS = [
    //BfA enchants
    ITEMS.ENCHANT_RING_PACT_OF_CRITICAL_STRIKE.effectId,
    ITEMS.ENCHANT_RING_PACT_OF_HASTE.effectId,
    ITEMS.ENCHANT_RING_PACT_OF_MASTERY.effectId,
    ITEMS.ENCHANT_RING_PACT_OF_VERSATILITY.effectId,
    ITEMS.ENCHANT_WEAPON_COASTAL_SURGE.effectId,
    ITEMS.ENCHANT_WEAPON_GALE_FORCE_STRIKING.effectId,
    ITEMS.ENCHANT_WEAPON_TORRENT_OF_ELEMENTS.effectId,
    ITEMS.ENCHANT_WEAPON_SIPHONING.effectId,
    ITEMS.ENCHANT_WEAPON_DEADLY_NAVIGATION.effectId,
    ITEMS.ENCHANT_WEAPON_MASTERGUL_NAVIGATION.effectId,
    ITEMS.ENCHANT_WEAPON_QUICK_NAVIGATION.effectId,
    ITEMS.ENCHANT_WEAPON_STALWART_NAVIGATION.effectId,
    ITEMS.ENCHANT_WEAPON_VERSATILE_NAVIGATION.effectId,
    ITEMS.CROWS_NEST_SCOPE.effectId,
    ITEMS.MONELITE_SCOPE_OF_ALACRITY.effectId,
    ITEMS.INCENDIARY_AMMUNITION.effectId,
    ITEMS.FROST_LACED_AMMUNITION.effectId,
    3368, // Rune of the Fallen Crusader - Death Knight Only
    3370, // Rune of Razorice - Death Knight Only
    3847, // Rune of the Stoneskin Gargoyle - Death Knight Only
  ];

  get enchantableGear() {
    return Object.keys(this.constructor.ENCHANTABLE_SLOTS).reduce((obj, slot) => {
      const item = this.selectedCombatant._getGearItemBySlotId(slot);

      // If there is no offhand, disregard the item.
      // If the icon has `offhand` in the name, we know it's not a weapon and doesn't need an enchant.
      // This is not an ideal way to determine if an offhand is a weapon.
      if (item.id === 0 || item.icon.includes('offhand') || item.icon.includes('shield')) {
        return obj;
      }
      obj[slot] = this.selectedCombatant._getGearItemBySlotId(slot);

      return obj;
    }, {});
  }
  get numEnchantableGear() {
    return Object.keys(this.constructor.ENCHANTABLE_SLOTS).length;
  }
  get slotsMissingEnchant() {
    const gear = this.enchantableGear;
    return Object.keys(gear).filter(slot => !this.hasEnchant(gear[slot]));
  }
  get numSlotsMissingEnchant() {
    return this.slotsMissingEnchant.length;
  }
  get slotsMissingMaxEnchant() {
    const gear = this.enchantableGear;
    return Object.keys(gear).filter(slot => this.hasEnchant(gear[slot]) && !this.hasMaxEnchant(gear[slot]));
  }
  get numSlotsMissingMaxEnchant() {
    return this.slotsMissingMaxEnchant.length;
  }
  hasEnchant(item) {
    return !!item.permanentEnchant;
  }
  hasMaxEnchant(item) {
    return this.constructor.MAX_ENCHANT_IDS.includes(item.permanentEnchant);
  }

  suggestions(when) {
    const gear = this.enchantableGear;
    // iterating with keys instead of value because the values don't store what slot is being looked at
    Object.keys(gear)
      .forEach(slot => {
        const item = gear[slot];
        const slotName = this.constructor.ENCHANTABLE_SLOTS[slot];
        const hasEnchant = this.hasEnchant(item);

        when(hasEnchant).isFalse()
          .addSuggestion((suggest, actual, recommended) => {
            return suggest(
              <React.Fragment>
                Your <ItemLink id={item.id} quality={item.quality} details={item} icon={false}>{slotName}</ItemLink> is missing an enchant. Apply a strong enchant to very easily increase your throughput slightly.
              </React.Fragment>
            )
              .icon(item.icon)
              .staticImportance(SUGGESTION_IMPORTANCE.MAJOR);
          });

        const noMaxEnchant = hasEnchant && !this.hasMaxEnchant(item);
        when(noMaxEnchant).isTrue()
          .addSuggestion((suggest, actual, recommended) => {
            return suggest(
              <React.Fragment>
                Your <ItemLink id={item.id} quality={item.quality} details={item} icon={false}>{slotName}</ItemLink> has a cheap enchant. Apply a strong enchant to very easily increase your throughput slightly.
              </React.Fragment>
            )
              .icon(item.icon)
              .staticImportance(SUGGESTION_IMPORTANCE.MINOR);
          });
      });
  }
}

export default EnchantChecker;
