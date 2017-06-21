import SPELLS from 'common/SPELLS_OTHERS';

import Module from 'Parser/Core/Module';

const debug = false;

const PRE_POTIONS = [
  SPELLS.POTION_OF_PROLONGED_POWER.id,
  SPELLS.POTION_OF_DEADLY_GRACE.id,
  SPELLS.POTION_OF_THE_OLD_WAR.id,
];

const SECOND_POTIONS = [
  SPELLS.POTION_OF_PROLONGED_POWER.id,
  SPELLS.POTION_OF_DEADLY_GRACE.id,
  SPELLS.POTION_OF_THE_OLD_WAR.id,
  SPELLS.ANCIENT_MANA_POTION.id,
  SPELLS.LEYTORRENT_POTION.id,
];

const DURATION = 30000;
const DURATION_PROLONGED = 60000;
const ANCIENT_MANA_POTION_AMOUNT = 152000;

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

    if (event.classResources && event.classResources[0]) {
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
}

export default PrePotion;
