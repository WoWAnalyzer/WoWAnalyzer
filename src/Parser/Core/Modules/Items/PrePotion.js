import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';

import Module from 'Parser/Core/Module';
import SUGGESTION_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

const debug = false;

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

const DURATION = 30000;
const DURATION_PROLONGED = 60000;
const ANCIENT_MANA_POTION_AMOUNT = 152000;

const MANA_CLASS_RESOURCE_ID = 0;

class PrePotion extends Module {
  usedPrePotion = false;
  usedSecondPotion = false;
  neededManaSecondPotion = false;

  on_toPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (PRE_POTIONS.indexOf(spellId) === -1) {
      return;
    }
    if(SPELLS.POTION_OF_PROLONGED_POWER.id === spellId) {
      if ((this.owner.fight.start_time + DURATION_PROLONGED) > event.timestamp) {
        this.usedPrePotion = true;
      }
    } else {
      if ((this.owner.fight.start_time + DURATION) > event.timestamp) {
        this.usedPrePotion = true;
      }
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (SECOND_POTIONS.indexOf(spellId) !== -1) {
      this.usedSecondPotion = true;
    }

    // class resource type 0 means the resource is mana
    if (event.classResources && event.classResources[0] && event.classResources[0].type === MANA_CLASS_RESOURCE_ID) {
      const resource = event.classResources[0];
      const manaLeftAfterCast = resource.amount - resource.cost;
      if (manaLeftAfterCast < ANCIENT_MANA_POTION_AMOUNT) {
        this.neededManaSecondPotion = true;
      }
    }
  }

  on_finished() {
    if(debug) {
      console.log("used potion:" + this.usedPrePotion);
      console.log("used 2nd potion:" + this.usedSecondPotion);
    }
  }

  suggestions(when) {
    when(this.usedPrePotion).isFalse()
      .addSuggestion(suggest => {
        return suggest(<span>You did not use a potion before combat. Using a potion before combat allows you the benefit of two potions in a single fight. A potion such as <ItemLink id={ITEMS.POTION_OF_PROLONGED_POWER.id} /> can be very effective (even for healers), especially during shorter encounters.</span>)
          .icon(ITEMS.POTION_OF_PROLONGED_POWER.icon)
          .staticImportance(SUGGESTION_IMPORTANCE.MINOR);
      });
    when(this.usedSecondPotion).isFalse()
      .addSuggestion(suggest => {
        let suggestionText;
        let importance;
        if (!this.neededManaSecondPotion) {
          suggestionText = <span>You forgot to use a potion during combat. Using a potion during combat allows you the benefit of either increasing output through <ItemLink id={ITEMS.POTION_OF_PROLONGED_POWER.id} /> or allowing you to gain mana using <ItemLink id={ITEMS.ANCIENT_MANA_POTION.id}/>, for example.</span>;
          importance = SUGGESTION_IMPORTANCE.MINOR;
        } else {
          suggestionText = <span>You ran out of mana (OOM) during the encounter without using a second potion. Use a second potion such as <ItemLink id={ITEMS.ANCIENT_MANA_POTION.id}/> or if the fight allows <ItemLink id={ITEMS.LEYTORRENT_POTION.id}/> to regenerate some mana.</span>;
          importance = SUGGESTION_IMPORTANCE.REGULAR;
        }
        return suggest(suggestionText)
          .icon(ITEMS.LEYTORRENT_POTION.icon)
          .staticImportance(importance);
      });
  }
}

export default PrePotion;
