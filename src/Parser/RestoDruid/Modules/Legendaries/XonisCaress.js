import Module from 'Main/Parser/Module';

export const XONIS_CARESS_ITEM_ID = 144242;
const XONIS_CARESS_HEAL_ID = 235040;

class XonisCaress extends Module {
  healing = 0;

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === XONIS_CARESS_HEAL_ID) {
      this.healing += event.amount;
      return;
    }
  }
}

export default XonisCaress;
