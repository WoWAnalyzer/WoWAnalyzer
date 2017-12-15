import React from 'react';

import ItemLink from 'common/ItemLink';
import Wrapper from 'common/Wrapper';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SUGGESTION_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

class EnchantChecker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  static ENCHANTABLE_SLOTS = {
    1: 'Neck',
    10: 'Ring',
    11: 'Ring',
    14: 'Cloak',
  };
  static MAX_ENCHANT_IDS = [
    5436, // binding of intellect
    5435, // binding of agility
    5434, // binding of strength
    5891, // mark of the ancient priestess
    5437, // mark of the claw
    5438, // mark of the distant army
    5889, // mark of the heavy hide
    5439, // mark of the hidden satyr
    5890, // mark of the trained soldier
    5898, // mark of the deadly
    5897, // mark of the quick
    5895, // mark of the master
    5896, // mark of the verstile
    5427, // binding of critical strike
    5428, // binding of haste
    5429, // binding of mastery
    5430, // binding of versatility
  ];

  get enchantableGear() {
    return Object.keys(this.constructor.ENCHANTABLE_SLOTS).reduce((obj, slot) => {
      obj[slot] = this.combatants.selected._getGearItemBySlotId(slot);
      return obj;
    }, {});
  }
  get slotsMissingEnchant() {
    const gear = this.enchantableGear;
    return Object.keys(gear).filter(slot => !this.hasEnchant(gear[slot]));
  }
  get slotsMissingMaxEnchant() {
    const gear = this.enchantableGear;
    return Object.keys(gear).filter(slot => this.hasEnchant(gear[slot]) && !this.hasMaxEnchant(gear[slot]));
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
      .forEach(item => {
        const hasEnchant = this.hasEnchant(gear[item]);
        when(hasEnchant).isFalse()
          .addSuggestion((suggest, actual, recommended) => {
            return suggest(<Wrapper>Your <ItemLink id={gear[item].id} quality={gear[item].quality}>{this.constructor.ENCHANTABLE_SLOTS[item]}</ItemLink> is missing an enchant. Apply a strong enchant to very easily increase your throughput slightly.</Wrapper>)
              .icon(gear[item].icon)
              .staticImportance(SUGGESTION_IMPORTANCE.MAJOR);
          });

        const hasMaxEnchant = hasEnchant && this.hasMaxEnchant(gear[item]);
        when(hasMaxEnchant).isFalse()
          .addSuggestion((suggest, actual, recommended) => {
            return suggest(<Wrapper>Your <ItemLink id={gear[item].id} quality={gear[item].quality}>{this.constructor.ENCHANTABLE_SLOTS[item]}</ItemLink> has a cheap enchant. Apply a strong enchant to very easily increase your throughput slightly.</Wrapper>)
              .icon(gear[item].icon)
              .staticImportance(SUGGESTION_IMPORTANCE.MINOR);
          });
      });
  }
}

export default EnchantChecker;
