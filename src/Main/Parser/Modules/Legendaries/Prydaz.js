import Module from 'Main/Parser/Module';
import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from 'Main/Parser/Constants';

export const PRYDAZ_ITEM_ID = 132444;
const PRYDAZ_HEAL_SPELL_ID = 207472;

class Prydaz extends Module {
  healing = 0;

  on_absorbed(event) {
    if (this.owner.byPlayer(event)) {
      const spellId = event.ability.guid;
      if (spellId === PRYDAZ_HEAL_SPELL_ID) {
        this.healing += event.amount;
      }
    }
  }
}

export default Prydaz;
