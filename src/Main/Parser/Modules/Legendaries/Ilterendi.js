import Module from 'Main/Parser/Module';
import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from 'Main/Parser/Constants';

export const ILTERENDI_ITEM_ID = 137046;
const LEGENDARY_ILTERENDI_BUFF_SPELL_ID = 207589;
const LEGENDARY_ILTERENDI_HEALING_INCREASE = 0.15;

class Ilterendi extends Module {
  healing = 0;

  on_heal(event) {
    if (this.owner.byPlayer(event)) {
      this.processForIlterendiHealing(event);
    }
  }
  processForIlterendiHealing(event) {
    const spellId = event.ability.guid;
    if (ABILITIES_AFFECTED_BY_HEALING_INCREASES.indexOf(spellId) === -1) {
      return;
    }
    if (!this.owner.modules.buffs.hasBuff(LEGENDARY_ILTERENDI_BUFF_SPELL_ID)) {
      return;
    }

    const amount = event.amount;
    const absorbed = event.absorbed || 0;
    const overheal = event.overheal || 0;
    const raw = amount + absorbed + overheal;
    const healingIncreaseFactor = 1 + LEGENDARY_ILTERENDI_HEALING_INCREASE;
    const healingIncrease = raw - raw / healingIncreaseFactor;

    const effectiveHealing = Math.max(0, healingIncrease - overheal);

    this.healing += effectiveHealing;
  }
}

export default Ilterendi;
