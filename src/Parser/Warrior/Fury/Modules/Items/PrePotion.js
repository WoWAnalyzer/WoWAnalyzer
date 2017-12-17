import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SUGGESTION_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

const debug = false;

const PRE_POTIONS = [
  SPELLS.POTION_OF_PROLONGED_POWER.id,
  SPELLS.POTION_OF_THE_OLD_WAR.id,
];

const SECOND_POTIONS = [
  SPELLS.POTION_OF_PROLONGED_POWER.id,
  SPELLS.POTION_OF_THE_OLD_WAR.id,
];

class PrePotion extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  usedPrePotion = false;
  usedSecondPotion = false;

  prePotionId = 0
  secondPotionId = 0

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if(PRE_POTIONS.includes(spellId) && event.prepull) {
      this.usedPrePotion = true;
      this.prePotionId = spellId;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (SECOND_POTIONS.indexOf(spellId) !== -1) {
      this.usedSecondPotion = true;
      this.secondPotionId = spellId;
    }
  }

  on_finished() {
    if (debug) {
      console.log(`used potion:${this.usedPrePotion}`);
      console.log(`used 2nd potion:${this.usedSecondPotion}`);
    }
  }

  suggestions(when) {
    when(this.usedPrePotion).isFalse()
      .addSuggestion((suggest) => {
        return suggest(<span>You did not use a potion before combat. Using a potion before combat allows you the benefit of two potions in a single fight. Generally <ItemLink id={ITEMS.POTION_OF_THE_OLD_WAR.id} /> is recommended although <ItemLink id={ITEMS.POTION_OF_PROLONGED_POWER.id} /> can be better in certain situations such as AOE encounters.</span>)
          .icon(ITEMS.POTION_OF_THE_OLD_WAR.icon)
          .staticImportance(SUGGESTION_IMPORTANCE.AVERAGE);
      });
    when(this.usedSecondPotion).isFalse()
      .addSuggestion((suggest) => {          
        return suggest(<span>You forgot to use a potion during combat. By using a potion during combat such as <ItemLink id={ITEMS.POTION_OF_THE_OLD_WAR.id} /> you increase your DPS significantly.</span>)
          .icon(ITEMS.POTION_OF_THE_OLD_WAR.icon)
          .staticImportance(SUGGESTION_IMPORTANCE.AVERAGE);
      });
    // Ensure that potions were Potion of the Old War
    when((this.usedPrePotion && this.prePotionId !== SPELLS.POTION_OF_THE_OLD_WAR.ID) || (this.secondPotionId !== SPELLS.POTION_OF_THE_OLD_WAR.id)).isTrue()
      .addSuggestion((suggest) => {
        return suggest(<span>Generally <ItemLink id={ITEMS.POTION_OF_THE_OLD_WAR.id} /> is recommended although <ItemLink id={ITEMS.POTION_OF_PROLONGED_POWER.id} /> can be better in certain situations such as AOE encounters.</span>)
        .icon(ITEMS.POTION_OF_THE_OLD_WAR.icon)
        .staticImportance(SUGGESTION_IMPORTANCE.MINOR);
    });
  }
}

export default PrePotion;
