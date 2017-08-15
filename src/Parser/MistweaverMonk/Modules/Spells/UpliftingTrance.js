// Based on Clearcasting Implementation done by @Blazyb
import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const UT_DURATION = 20000;
const debug = false;

class UpliftingTrance extends Module {
  UTProcsTotal = 0;
  lastUTProcTime = 0;
  consumedUTProc = 0;
  overwrittenUTProc = 0;
  nonUTVivify = 0;
  tftVivCast = 0;

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.UPLIFTING_TRANCE_BUFF.id === spellId) {
      this.lastUTProcTime = event.timestamp;
      debug && console.log('UT Proc Applied');
      this.UTProcsTotal++;
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.UPLIFTING_TRANCE_BUFF.id === spellId) {
      // Captured Overwritten UT Buffs for use in wasted buff calculations
      this.lastUTProcTime = event.timestamp;
      debug && console.log('UT Proc Overwritten');
      this.UTProcsTotal++;
      this.overwrittenUTProc++;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (SPELLS.VIVIFY.id !== spellId) {
      return;
    }
    // Checking to see if non-UT'ed Viv is casted
    if(this.lastUTProcTime !== event.timestamp) {
      if(this.lastUTProcTime === null/* && !this.owner.selectedCombatant.hasBuff(SPELLS.THUNDER_FOCUS_TEA.id)*/) {
        // No UT Proc with Vivify
        this.nonUTVivify++;
        return;
      }
      const utTimeframe = this.lastUTProcTime + UT_DURATION;
      if(event.timestamp > utTimeframe/* && !this.owner.selectedCombatant.hasBuff(SPELLS.THUNDER_FOCUS_TEA.id)*/) {
        this.nonUTVivify++;
      } else {
        this.consumedUTProc++;
        debug && console.log('UT Proc Consumed / Timestamp: ' + event.timestamp);
        this.lastUTProcTime = null;
      }
    }
  }

  suggestions(when) {
    const unusedUTProcs = 1 - (this.consumedUTProc / this.UTProcsTotal);
    when(unusedUTProcs).isGreaterThan(.3)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.UPLIFTING_TRANCE_BUFF.id} /> procs should be used as soon as you get them so they are not overwritten. While some will be overwritten due to the nature of the spell interactions, holding <SpellLink id={SPELLS.UPLIFTING_TRANCE_BUFF.id} /> procs is not optimal.</span>)
          .icon(SPELLS.UPLIFTING_TRANCE_BUFF.icon)
          .actual(`${formatPercentage(unusedUTProcs)}% Unused Uplifting Trance procs`)
          .recommended(`<${formatPercentage(recommended)}% wasted UT Buffs is recommended`)
          .regular(recommended + .1).major(recommended + .2);
    });
  }

  statistic() {
    const unusedUTProcs = 1 - (this.consumedUTProc / this.UTProcsTotal);
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.UPLIFTING_TRANCE_BUFF.id} />}
        value={`${formatPercentage(unusedUTProcs)}%`}
        label={(
          <dfn data-tip={`You got total <b>${this.UTProcsTotal} uplifting trance procs</b> and <b>used ${this.consumedUTProc}</b> of them. ${this.nonUTVivify} of your vivify's were used without an uplifting trance procs.`}>
            Unused Procs
          </dfn>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default UpliftingTrance;
