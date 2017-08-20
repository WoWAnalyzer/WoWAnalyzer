import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';
import Module from 'Parser/Core/Module';

import { formatPercentage, formatNumber } from 'common/format';

/**
 * Healing done by Skysec's hold is often misleading in logs, because it often causes
 * healing from Frenzied Regeneration to overheal where it otherwise wouldn't have.
 * This healing is redundant and should be considered wasted the same way that overhealing
 * normally is.  This module subtracts Frenzied Regeneration overhealing directly caused by
 * Skysec's Hold from the total healing done by Skysec's, and shows the "effective HPS" of the
 * boots.
 */
class SkysecsHold extends Module {
  currentCycleFRTicksLeft = 0;
  currentCycleSHTicksLeft = 0;
  potentialHeal = 0;
  currentCycleEffectiveHeal = 0;
  overallEffectiveHeal = 0;
  lastSkysecsTick = 0;
  totalCasts = 0;
  averagePlayerHPs = [];
  efficiency = 1;

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
      this.currentCycleFRTicksLeft = 6;
      this.currentCycleSHTicksLeft = 3;
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

  item() {
    const effectiveHeal = this.overallEffectiveHeal + this.currentCycleEffectiveHeal;
    this.efficiency = effectiveHeal / this.potentialHeal;

    const fightLengthSec = (this.owner.fight.end_time - this.owner.fight.start_time) / 1000;

    // Skysec's heal
    const averagePlayerHP = this.averagePlayerHPs.reduce((sum, hp) => sum + hp, 0) / this.totalCasts;
    const effectiveHealPerCast = this.efficiency * 0.12 * averagePlayerHP;
    const effectiveHPS = (effectiveHealPerCast * this.totalCasts) / fightLengthSec;

    return {
      item: ITEMS.SKYSECS_HOLD,
      result: (
        <span>
          <dfn
            data-tip={`
              The heal from Skysec's hold competes directly with the heal from Frenzied Regeneration.  Because of this, any overhealing that Frenzied Regeneration does counts against the healing that Skysec's does (since that overhealing would not have been overhealing if Skysec's was not equipped). <br /><br />

              The effeciency rating is calculated as the amount of "effective healing" (healing that did not affect Frenzied Regeneration) divided by the amount of "potential healing" (all healing and overhealing done by Skysec's, including lost healing due to double-tapping).<br /><br />

              Effective healing: ${formatNumber(effectiveHeal)}<br />
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
        return suggest(<span>You should not use <ItemLink id={ITEMS.SKYSECS_HOLD.id} /> if you cannot get close to full effectiveness from its extra heal.</span>)
          .icon(ITEMS.SKYSECS_HOLD.icon)
          .actual(`${formatPercentage(this.efficiency)}% Skysec's Hold efficiency`)
          .recommended(`>90% is recommended`)
          .regular(0.85).major(0.8);
      });
  }
}

export default SkysecsHold;
