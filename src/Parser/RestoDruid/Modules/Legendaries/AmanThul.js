import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

export const SHOULDERS_MAX_TICKS = 3;

class AmanThul extends Module {
  targetBonusTicks = {};
  bonusTicks = 0;

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    // add bonus tick if it was a 100% overheal and we haven't reached the limit yet for the target
    if (SPELLS.REJUVENATION.id === spellId || SPELLS.REJUVENATION_GERMINATION.id === spellId) {
      if (event.overheal && event.amount === 0
      && typeof this.targetBonusTicks[event.targetID] !== "undefined"
      && this.targetBonusTicks[event.targetID][spellId] < SHOULDERS_MAX_TICKS) {
        this.targetBonusTicks[event.targetID][spellId] += 1;
        this.bonusTicks += 1;
      }
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if (SPELLS.REJUVENATION.id === spellId || SPELLS.REJUVENATION_GERMINATION.id === spellId) {
      if (typeof this.targetBonusTicks[event.targetID] === "undefined") {
        this.targetBonusTicks[event.targetID] = {};
      }

      // reset the bonus ticks counter for this target
      this.targetBonusTicks[event.targetID][spellId] = 0;
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;

    if (SPELLS.REJUVENATION.id === spellId || SPELLS.REJUVENATION_GERMINATION.id === spellId) {
      if (typeof this.targetBonusTicks[event.targetID] === "undefined") {
        this.targetBonusTicks[event.targetID] = {};
      }

      // reset the bonus ticks counter for this target
      this.targetBonusTicks[event.targetID][spellId] = 0;
    }
  }
}

export default AmanThul;
