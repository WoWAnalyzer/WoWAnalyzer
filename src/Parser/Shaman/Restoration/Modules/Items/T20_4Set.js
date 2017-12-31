import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import ItemHealingDone from 'Main/ItemHealingDone';

// It seems some ticks of healing rain were logged slightly later than the healing end time. So add a tolerance time to catch these ticks.
const TOLERANCE = 50;
const HEALING_RAIN_DURATION = 10 * 1000 + TOLERANCE;
const T20_4SET_HEALING_INCREASE = 0.5;

class Restoration_Shaman_T20_4Set extends Analyzer {
  healing = 0;

  on_initialized() {
    this.active = this.owner.modules.combatants.selected.hasBuff(SPELLS.RESTORATION_SHAMAN_T20_4SET_BONUS_BUFF.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HEALING_RAIN_CAST.id) {
      return;
    }

    if (!this.owner.modules.combatants.selected.hasBuff(SPELLS.RESTORATION_SHAMAN_T20_4SET_BONUS_BUFF.id, event.timestamp)) {
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

  suggestions(when) {
    const healingRain = this.owner.modules.abilityTracker.getAbility(SPELLS.HEALING_RAIN_CAST.id);
    const has4PT20 = this.owner.modules.combatants.selected.hasBuff(SPELLS.RESTORATION_SHAMAN_T20_4SET_BONUS_BUFF.id);
    const unbuffedHealingRainsPercentage = has4PT20 && ((healingRain.casts - healingRain.withT20Buff) / healingRain.casts);
    if (has4PT20) {
      when(unbuffedHealingRainsPercentage).isGreaterThan(0)
        .addSuggestion((suggest, actual, recommended) =>
          suggest(<span><SpellLink id={SPELLS.RESTORATION_SHAMAN_T20_4SET_BONUS_BUFF.id} /> buffed <SpellLink id={SPELLS.HEALING_RAIN_CAST.id} /> can make for some very efficient healing, consider ensure casting them with <SpellLink id={SPELLS.RESTORATION_SHAMAN_T20_4SET_BONUS_BUFF.id} />.</span>)
            .icon(SPELLS.HEALING_RAIN_CAST.icon)
            .actual(`${formatPercentage(unbuffedHealingRainsPercentage)}% healing rains were casted without T20 4set bonus buff.`)
            .recommended(`${recommended} is recommended`)
            .regular(recommended + 0.15).major(recommended + 0.3)
        );
    }
  }

  item() {
    return {
      id: `spell-${SPELLS.RESTORATION_SHAMAN_T20_4SET_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.RESTORATION_SHAMAN_T20_4SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.RESTORATION_SHAMAN_T20_4SET_BONUS_BUFF.id} />,
      result: <ItemHealingDone amount={this.healing} />,
    };
  }
}

export default Restoration_Shaman_T20_4Set;
