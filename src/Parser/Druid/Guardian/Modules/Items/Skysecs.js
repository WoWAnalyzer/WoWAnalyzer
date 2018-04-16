import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import { formatPercentage, formatNumber } from 'common/format';

const FRENZIED_REGENERATION_TICKS_PER_CAST = 6;
const SKYSECS_HOLD_TICKS_PER_CAST = 3;
const SKYSECS_HOLD_HP_PER_CAST = 0.12;

/**
 * Healing done by Skysec's hold is often misleading in logs, because it often causes
 * healing from Frenzied Regeneration to overheal where it otherwise wouldn't have.
 * This healing is redundant and should be considered wasted the same way that overhealing
 * normally is.  This module subtracts Frenzied Regeneration overhealing directly caused by
 * Skysec's Hold from the total healing done by Skysec's, and shows the "effective HPS" of the
 * boots.
 */
class SkysecsHold extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  currentCycleFRTicksLeft = 0;
  currentCycleSHTicksLeft = 0;
  potentialHeal = 0;
  currentCycleEffectiveHeal = 0;
  overallEffectiveHeal = 0;
  lastSkysecsTick = 0;
  totalCasts = 0;
  averagePlayerHPs = [];

  on_initialized() {
    this.active = this.combatants.selected.hasFeet(ITEMS.SKYSECS_HOLD.id);
  }

  /**
   * FR healing with SH operates in cycles; two ticks of FR then one tick of SH, repeated 3 times.
   * We only count FR overhealing against SH ticks from the same cycle, since damage and other healing
   * can occur between FR casts (damage and healing can occur within the duration of an FR cast, but
   * the time between ticks is short enough that I consider this to be an acceptable margin of error).
   *
   * FR can also be "double-tapped" by casting it again before all ticks of the previous cast have
   * occurred.  We treat this as an extension of the original cycle, since the remaining FR healing
   * from the first cast is folded into the second.  The heal from SH is not folded in the same way
   * (it's simply reset to 12% of maxHP), so if this occurs we consider the remaining heal from
   * the original cast as wasted.
   */
  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.FRENZIED_REGENERATION.id) {
      this.totalCasts += 1;
      this.averagePlayerHPs.push(event.maxHitPoints);
      // FR always ticks 6 times, even if it's cast again while the current one is still
      // ticking (the remaining heal is added to the new cast)
      if (this.currentCycleFRTicksLeft === 0) {
        this.overallEffectiveHeal += this.currentCycleEffectiveHeal;
        this.currentCycleEffectiveHeal = 0;
        this.potentialHeal += this.lastSkysecsTick * this.currentCycleSHTicksLeft;
      }
      this.currentCycleFRTicksLeft = FRENZIED_REGENERATION_TICKS_PER_CAST;
      this.currentCycleSHTicksLeft = SKYSECS_HOLD_TICKS_PER_CAST;
    }
  }

  on_byPlayer_heal(event) {
    const overheal = event.overheal || 0;
    if (event.ability.guid === SPELLS.SKYSECS_HOLD_HEAL.id) {
      this.currentCycleEffectiveHeal += event.amount;
      this.potentialHeal += event.amount + overheal;
      this.lastSkysecsTick = event.amount + overheal;
      this.currentCycleSHTicksLeft -= 1;
    }

    if (event.ability.guid === SPELLS.FRENZIED_REGENERATION.id) {
      this.currentCycleEffectiveHeal = Math.max(this.currentCycleEffectiveHeal - overheal, 0);
      this.currentCycleFRTicksLeft -= 1;
    }
  }

  get effectiveHeal() {
    return this.overallEffectiveHeal + this.currentCycleEffectiveHeal;
  }

  get efficiency() {
    if (this.potentialHeal === 0) return 0;
    return this.effectiveHeal / this.potentialHeal;
  }

  item() {
    const fightLengthSec = this.owner.fightDuration / 1000;

    // Skysec's heals as a percentage of max HP at the time of the cast, so we average out
    // the HPs over all casts to estimate the HPS
    const averagePlayerHP = this.averagePlayerHPs.reduce((sum, hp) => sum + hp, 0) / this.totalCasts;
    const effectiveHealPerCast = this.efficiency * SKYSECS_HOLD_HP_PER_CAST * averagePlayerHP;
    const effectiveHPS = (effectiveHealPerCast * this.totalCasts) / fightLengthSec;

    return {
      item: ITEMS.SKYSECS_HOLD,
      result: (
        <span>
          <dfn
            data-tip={`
              The heal from Skysec's hold competes directly with the heal from Frenzied Regeneration.  Because of this, any overhealing that Frenzied Regeneration does counts against the healing that Skysec's does (since that overhealing would not have been overhealing if Skysec's was not equipped). <br /><br />

              The effeciency rating is calculated as the amount of "effective healing" (healing that did not affect Frenzied Regeneration) divided by the amount of "potential healing" (all healing and overhealing done by Skysec's, including lost healing due to double-tapping).<br /><br />

              Effective healing: ${formatNumber(this.effectiveHeal)}<br />
              Potential healing: ${formatNumber(this.potentialHeal)}<br />
              Efficiency: ${formatPercentage(this.efficiency)}%<br />
              Effective HPS: ${formatNumber(effectiveHPS)} HPS
            `}
          >
            {formatPercentage(this.efficiency)}% / {formatNumber(effectiveHPS)} HPS
          </dfn>
        </span>
      ),
    };
  }

  suggestions(when) {
    when(this.efficiency).isLessThan(0.9)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <ItemLink id={ITEMS.SKYSECS_HOLD.id} /> efficiency was {formatPercentage(this.efficiency)}%.  Consider using another legendary if you cannot get close to full effectiveness from its extra heal, as this makes <ItemLink id={ITEMS.SKYSECS_HOLD.id} /> a poor legendary.</span>)
          .icon(ITEMS.SKYSECS_HOLD.icon)
          .actual(`${formatPercentage(actual)}% efficiency`)
          .recommended(`>${formatPercentage(recommended, 0)}% is recommended`)
          .regular(recommended - 0.05).major(recommended - 0.1);
      });
  }
}

export default SkysecsHold;
