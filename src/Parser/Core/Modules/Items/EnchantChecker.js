import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SUGGESTION_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

const ENCHANTABLE_SLOTS = {
  1: 'Neck',
  10: 'Ring', 
  11: 'Ring', 
  14: 'Cloak',
};

const MAX_ENCHANT_IDS = [
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

class EnchantChecker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  suggestions(when) {
    const gear = {};
    Object.keys(ENCHANTABLE_SLOTS).forEach(slot => gear[slot] = this.combatants.selected._getGearItemBySlotId(slot));

    // iterating with keys instead of value because the values don't store what slot is being looked at
    Object.keys(gear)
    .forEach(item => {
        // inverting everything felt improper but its what made sure only one suggestion fires
        const missingEnchant = !gear[item].hasOwnProperty('permanentEnchant');
        const missingMaxEnchant = !missingEnchant && !MAX_ENCHANT_IDS.includes(gear[item].permanentEnchant)
        const itemUrl = "https://wowhead.com/item=" + gear[item].id;
        when(missingEnchant).isTrue()
          .addSuggestion((suggest, actual, recommended) => {
            return suggest(<span>Your <a href={itemUrl}>{ENCHANTABLE_SLOTS[item]}</a> has a missing enchant.</span>)
              .icon(gear[item].icon)
              .staticImportance(SUGGESTION_IMPORTANCE.MAJOR);
          });
        when(missingMaxEnchant).isTrue()
          .addSuggestion((suggest, actual, recommended) => {
            return suggest(<span>Your <a href={itemUrl}>{ENCHANTABLE_SLOTS[item]}</a> has a cheap enchant.  You should consider upgrading it from a "Word of" enchant to a "Binding of" enchant.</span>)
              .icon(gear[item].icon)
              .staticImportance(SUGGESTION_IMPORTANCE.MINOR);
          });
    });
  }
}

export default EnchantChecker;
