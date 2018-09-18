import React from 'react';

import ItemLink from 'common/ItemLink';

import Analyzer from 'Parser/Core/Analyzer';
import SUGGESTION_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

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
    5946, // Weapon Enchant - Coastal Surge
    5950, // Weapon Enchant - Gale-Force Striking
    5949, // Weapon Enchant - Torrent of Elements
    5948, // Weapon Enchant - Siphoning
    5965, // Weapon Enchant - Deadly Navigation
    5964, // Weapon Enchant - Masterful Navigation
    5963, // Weapon Enchant - Quick Navigation
    5966, // Weapon Enchant - Stalwart Navigation
    5962, // Weapon Enchant - Versatile Navigation
    5955, // Crow's Nest Scope
    5956, // Monelite Scope of Alacrity
    5957, // Incendiary Ammunition
    5958, // Frost-Laced Ammunition
    3368, // Rune of the Fallen Crusader - Death Knight Only
    3370, // Rune of Razorice - Death Knight Only
    3847, // Rune of the Stoneskin Gargoyle - Death Knight Only

    5942, // Pact of Critical Strike
    5943, // Pact of Haste
    5944, // Pact of Mastery
    5945, // Pact of Versatility
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
