import Module from 'Main/Parser/Module';
import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from 'Main/Parser/Constants';

export const SACRED_DAWN_TRAIT_ID = 238132;
const SACRED_DAWN_BUFF_SPELL_ID = 243174;
const SACRED_DAWN_HEALING_INCREASE = 0.1;

class SacredDawn extends Module {
  healing = 0;

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (ABILITIES_AFFECTED_BY_HEALING_INCREASES.indexOf(spellId) === -1) {
      return;
    }
    if (!this.owner.selectedCombatant.hasBuff(SACRED_DAWN_BUFF_SPELL_ID)) {
      return;
    }
    // TODO: Look for buff on `event.targetID` instead of player

    const amount = event.amount;
    const absorbed = event.absorbed || 0;
    const overheal = event.overheal || 0;
    const raw = amount + absorbed + overheal;
    const healingIncreaseFactor = 1 + SACRED_DAWN_HEALING_INCREASE;
    const healingIncrease = raw - raw / healingIncreaseFactor;

    const effectiveHealing = Math.max(0, healingIncrease - overheal);

    this.healing += effectiveHealing;
  }

  // Beacon transfer is included in `ABILITIES_AFFECTED_BY_HEALING_INCREASES`
}

export default SacredDawn;
