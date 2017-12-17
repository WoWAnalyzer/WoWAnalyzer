// Based on Clearcasting Implementation done by @Blazyb
import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const UT_DURATION = 20000;
const debug = false;

class UpliftingTrance extends Analyzer {
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
      this.UTProcsTotal += 1;
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.UPLIFTING_TRANCE_BUFF.id === spellId) {
      // Captured Overwritten UT Buffs for use in wasted buff calculations
      this.lastUTProcTime = event.timestamp;
      debug && console.log('UT Proc Overwritten');
      this.UTProcsTotal += 1;
      this.overwrittenUTProc += 1;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (SPELLS.VIVIFY.id !== spellId) {
      return;
    }
    // Checking to see if non-UT'ed Viv is casted
    if (this.lastUTProcTime !== event.timestamp) {
      if (this.lastUTProcTime === null) {
        // No UT Proc with Vivify
        this.nonUTVivify += 1;
        return;
      }
      const utTimeframe = this.lastUTProcTime + UT_DURATION;
      if (event.timestamp > utTimeframe) {
        this.nonUTVivify += 1;
      } else {
        this.consumedUTProc += 1;
        debug && console.log(`UT Proc Consumed / Timestamp: ${event.timestamp}`);
        this.lastUTProcTime = null;
      }
    }
  }

  get unusedUTProcs() {
    return 1 - (this.consumedUTProc / this.UTProcsTotal);
  }

  get suggestionThresholds() {
    return {
      actual: this.unusedUTProcs,
      isGreaterThan: {
        minor: 0.3,
        average: 0.4,
        major: 0.5,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.unusedUTProcs).isGreaterThan(0.3)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.UPLIFTING_TRANCE_BUFF.id} /> procs should be used as soon as you get them so they are not overwritten. While some will be overwritten due to the nature of the spell interactions, holding <SpellLink id={SPELLS.UPLIFTING_TRANCE_BUFF.id} /> procs is not optimal.</span>)
          .icon(SPELLS.UPLIFTING_TRANCE_BUFF.icon)
          .actual(`${formatPercentage(this.unusedUTProcs)}% Unused Uplifting Trance procs`)
          .recommended(`<${formatPercentage(recommended)}% wasted UT Buffs is recommended`)
          .regular(recommended + 0.1).major(recommended + 0.2);
      });
  }

  statistic() {
    const unusedUTProcsPerc = 1 - (this.consumedUTProc / this.UTProcsTotal);
    const unusedUTProc = this.UTProcsTotal - this.consumedUTProc;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.UPLIFTING_TRANCE_BUFF.id} />}
        value={`${formatPercentage(unusedUTProcsPerc)}%`}
        label={(
          <dfn data-tip={`${this.nonUTVivify} of your vivify's were used without an uplifting trance procs.`}>
            Unused Procs
          </dfn>
        )}
        footer={(
          <div className="statistic-bar">
            <div
              className="stat-healing-bg"
              style={{ width: `${this.consumedUTProc / this.UTProcsTotal * 100}%` }}
              data-tip={`You consumed a total of ${this.consumedUTProc} procs.`}
            >
              <img src="/img/healing.png" alt="Healing" />
            </div>
            
            <div
              className="remainder stat-overhealing-bg"
              data-tip={`You missed a total of ${unusedUTProc} procs.`}
            >
              <img src="/img/overhealing.png" alt="Overhealing" />
            </div>
          </div>
        )}
        footerStyle={{ overflow: 'hidden' }}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(15);
}

export default UpliftingTrance;
