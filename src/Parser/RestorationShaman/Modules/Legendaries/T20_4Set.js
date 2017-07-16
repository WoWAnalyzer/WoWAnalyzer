import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

// It seems some ticks of healing rain were logged slightly later than the healing end time. So add a tolerance time to catch these ticks.
const TOLERANCE = 50;
const HEALING_RAIN_DURATION = 10 * 1000 + TOLERANCE;
const T20_4SET_HEALING_INCREASE = 0.5;

class Restoration_Shaman_T20_4Set extends Module {
  healing = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasBuff(SPELLS.RESTORATION_SHAMAN_T20_4SET_BONUS_BUFF.id);
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HEALING_RAIN_CAST.id) {
      return;
    }

    if (!this.owner.selectedCombatant.hasBuff(SPELLS.RESTORATION_SHAMAN_T20_4SET_BONUS_BUFF.id, event.timestamp)) {
      return;
    }

    // Mark the timestamp of a healing rain cast with T20 4 set buff. Then we can check a healing rain heal is buffed or not by checking the time gap between it and the latest buffed cast. Since a player can only keep one healing rain, mark the latest cast is safe.
    this.latestBuffedCast = event.timestamp;

    // Since the order of heal and cast events were not guaranteed when they were logged in the same timestamp, we need to cover the situation that heal event comes before cast.
    if (this.latestUnbuffedEvent && this.latestUnbuffedEvent.timestamp === this.latestBuffedCast) {
      this.healing += calculateEffectiveHealing(this.latestUnbuffedEvent, T20_4SET_HEALING_INCREASE);
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (!(spellId === SPELLS.HEALING_RAIN_HEAL.id)) {
      return;
    }

    if (this.latestBuffedCast === undefined || event.timestamp - this.latestBuffedCast > HEALING_RAIN_DURATION) {
      // Cache the latest unbuffed healing rain heal event.
      this.latestUnbuffedEvent = event;
      return;
    }

    this.healing += calculateEffectiveHealing(event, T20_4SET_HEALING_INCREASE);
  }

}

export default Restoration_Shaman_T20_4Set;
