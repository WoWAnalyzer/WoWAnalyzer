import React from 'react';

import SPELLS from 'common/SPELLS';
import SPECS from 'common/SPECS';
import ITEMS from 'common/ITEMS';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import ItemLink from 'common/ItemLink';
import Wrapper from 'common/Wrapper';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SUGGESTION_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

const debug = false;

const HEALER_SPECS = [
  SPECS.HOLY_PALADIN.id,
  SPECS.RESTORATION_DRUID.id,
  SPECS.HOLY_PRIEST.id,
  SPECS.DISCIPLINE_PRIEST.id,
  SPECS.MISTWEAVER_MONK.id,
  SPECS.RESTORATION_SHAMAN.id,
];

const PRE_POTIONS = [
  SPELLS.POTION_OF_PROLONGED_POWER.id,
  SPELLS.POTION_OF_DEADLY_GRACE.id,
  SPELLS.POTION_OF_THE_OLD_WAR.id,
  SPELLS.UNBENDING_POTION.id,
];

const SECOND_POTIONS = [
  SPELLS.POTION_OF_PROLONGED_POWER.id,
  SPELLS.POTION_OF_DEADLY_GRACE.id,
  SPELLS.POTION_OF_THE_OLD_WAR.id,
  SPELLS.ANCIENT_MANA_POTION.id,
  SPELLS.LEYTORRENT_POTION.id,
  SPELLS.UNBENDING_POTION.id,
  SPELLS.SPIRIT_BERRIES.id,
];

const ANCIENT_MANA_POTION_AMOUNT = 152000;

class PrePotion extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  usedPrePotion = false;
  usedSecondPotion = false;
  neededManaSecondPotion = false;

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if(PRE_POTIONS.includes(spellId) && event.prepull) {
      this.usedPrePotion = true;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (SECOND_POTIONS.indexOf(spellId) !== -1) {
      this.usedSecondPotion = true;
    }

    if (event.classResources && event.classResources[0] && event.classResources[0].type === RESOURCE_TYPES.MANA.id) {
      const resource = event.classResources[0];
      const manaLeftAfterCast = resource.amount - resource.cost;
      if (manaLeftAfterCast < ANCIENT_MANA_POTION_AMOUNT) {
        this.neededManaSecondPotion = true;
      }
    }
  }

  on_finished() {
    if (debug) {
      console.log(`used potion:${this.usedPrePotion}`);
      console.log(`used 2nd potion:${this.usedSecondPotion}`);
    }
  }

  get prePotionSuggestionThresholds() {
    return {
      actual: this.usedPrePotion,
      isEqual: false,
      style: 'boolean',
    };
  }
  get secondPotionSuggestionThresholds() {
    return {
      actual: this.usedSecondPotion,
      isEqual: false,
      style: 'boolean',
    };
  }

  suggestions(when) {
    when(this.prePotionSuggestionThresholds)
      .addSuggestion((suggest) => {
        return suggest(<Wrapper>You did not use a potion before combat. Using a potion before combat allows you the benefit of two potions in a single fight. A potion such as <ItemLink id={ITEMS.POTION_OF_PROLONGED_POWER.id} /> can be very effective (even for healers), especially during shorter encounters.</Wrapper>)
          .icon(ITEMS.POTION_OF_PROLONGED_POWER.icon)
          .staticImportance(SUGGESTION_IMPORTANCE.MINOR);
      });
    when(this.secondPotionSuggestionThresholds)
      .addSuggestion((suggest) => {
        let suggestionText;
        let importance;
        // Only healer specs would use a mana potion all other specs either don't use mana as a primary resource (such as bears)
        // or have another method to regen mana, this fixes an issue with Guardian where they shift out of bear form and cast a
        // spell but mana is not their primary resource and should not use a mana potion.
        const healerSpec = HEALER_SPECS.indexOf(this.combatants.selected.specId) !== -1;
        if (!healerSpec) {
          suggestionText = <Wrapper>You forgot to use a potion during combat. By using a potion during combat such as <ItemLink id={ITEMS.POTION_OF_PROLONGED_POWER.id} /> you the increasing dps and also suvivability against a boss.</Wrapper>;
          importance = SUGGESTION_IMPORTANCE.MINOR;
        } else if (!this.neededManaSecondPotion) {
          suggestionText = <Wrapper>You forgot to use a potion during combat. Using a potion during combat allows you the benefit of either increasing output through <ItemLink id={ITEMS.POTION_OF_PROLONGED_POWER.id} /> or allowing you to gain mana using <ItemLink id={ITEMS.ANCIENT_MANA_POTION.id} />, for example.</Wrapper>;
          importance = SUGGESTION_IMPORTANCE.MINOR;
        } else {
          suggestionText = <Wrapper>You ran out of mana (OOM) during the encounter without using a second potion. Use a second potion such as <ItemLink id={ITEMS.ANCIENT_MANA_POTION.id} /> or if the fight allows <ItemLink id={ITEMS.LEYTORRENT_POTION.id} /> to regenerate some mana.</Wrapper>;
          importance = SUGGESTION_IMPORTANCE.REGULAR;
        }
        return suggest(suggestionText)
          .icon(ITEMS.LEYTORRENT_POTION.icon)
          .staticImportance(importance);
      });
  }
}

export default PrePotion;
