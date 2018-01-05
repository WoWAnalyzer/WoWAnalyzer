import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import StatisticBox from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

/*
 * Your Sentinel watches over the target area for 18 sec, applying Hunter's Mark to all enemies every 6 sec.
 */
const MS_BUFFER = 100;

const SENTINEL_DURATION = 18000;

const TIME_BETWEEN_TICKS = 6000;

const TICKS_PER_CAST = 4;

class Sentinel extends Analyzer {
  static dependencies = {
    combatants: Combatants,

  };
  damage = 0;
  applyDebuffTimestamp = null;
  sentinelCasts = 0;
  sentinelTicks = 0;
  appliedDebuffsFromSentinel = 0;
  wastedApplications = 0;
  wastedTicks = 0;
  lastBadTickTimestamp = 0;
  lastSentinelCastTimestamp = 0;
  lostTicksFromCombatEnd = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.SENTINEL_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SENTINEL_TICK.id && spellId !== SPELLS.SENTINEL_TALENT.id) {
      return;
    }
    if (spellId === SPELLS.SENTINEL_TALENT.id) {
      this.lastSentinelCastTimestamp = event.timestamp;
      this.sentinelCasts++;
    }
    if (spellId === SPELLS.SENTINEL_TICK.id) {
      this.applyDebuffTimestamp = event.timestamp;
      this.sentinelTicks++;
    }
  }
  on_byPlayer_applydebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HUNTERS_MARK_DEBUFF.id) {
      return;
    }
    if (event.timestamp < this.applyDebuffTimestamp + MS_BUFFER && event.timestamp >= this.applyDebuffTimestamp) {
      this.appliedDebuffsFromSentinel++;
    }
  }
  on_byPlayer_refreshdebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HUNTERS_MARK_DEBUFF.id) {
      return;
    }
    if (event.timestamp < this.applyDebuffTimestamp + MS_BUFFER && event.timestamp >= this.applyDebuffTimestamp) {
      this.wastedApplications++;
      if (this.lastBadTickTimestamp !== event.timestamp) {
        this.wastedTicks++;
        this.lastBadTickTimestamp = event.timestamp;
      }
    }
  }

  get debuffsPerCast() {
    return (this.appliedDebuffsFromSentinel / this.sentinelCasts).toFixed(1);
  }
  get totalPossibleTicks() {
    return (this.sentinelCasts * TICKS_PER_CAST) - this.lostTicksFromCombatEnd;
  }
  get buggedTicks() {
    return this.totalPossibleTicks - this.sentinelTicks;
  }
  get goodTicks() {
    return this.totalPossibleTicks - this.buggedTicks - this.wastedTicks;
  }

  on_finished() {
    console.log("fight: ", this.owner.fight.end_time);
    console.log("lastCastTimestamp : ", this.lastSentinelCastTimestamp);
    if (this.lastSentinelCastTimestamp > (this.owner.fight.end_time - SENTINEL_DURATION)) {
      const timeLostOnSentinel = this.owner.fight.end_time - this.lastSentinelCastTimestamp;
      this.lostTicksFromCombatEnd = Math.floor(timeLostOnSentinel / TIME_BETWEEN_TICKS);
    }
  }
  
  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SENTINEL_TALENT.id} />}
        value={`${this.goodTicks}/${this.totalPossibleTicks}`}
        label={`flawless ticks + ${this.buggedTicks} bugged`}
        tooltip={`You applied Hunter's Mark with Sentinel ${this.appliedDebuffsFromSentinel} times spread over ${this.sentinelCasts} casts of Sentinel. This gives an average of ${this.debuffsPerCast} debuffs per cast. <br/> You wasted ${this.wastedApplications} possible applications with Sentinel ticking on targets who already had Hunter's Mark debuff. </br> Out of ${this.totalPossibleTicks} possible ticks: <ul><li>${this.goodTicks} ticks were good ticks where no target already had Hunter's Mark when it ticked.</li><li>${this.wastedTicks} ticks had one or more targets already with Hunter's Mark on them.</li><li>${this.buggedTicks} ticks bugged and didn't happen.</li></ul>`}
        footer={(
          <div className="statistic-bar">
            <div
              className="stat-health-bg"
              style={{ width: `${(100 - formatPercentage((this.wastedTicks + this.buggedTicks) / this.totalPossibleTicks))}%` }}
              data-tip={`<b>${100 - formatPercentage((this.wastedTicks + this.buggedTicks) / this.totalPossibleTicks)}%</b> of your Sentinel ticks happened while none of the targets had a hunter's mark on them, good job!`}
            >
            </div>
            <div
              className="DeathKnight-bg"
              style={{ width: `${formatPercentage(this.wastedApplications / this.totalPossibleTicks)}%` }}
              data-tip={`<b>${formatPercentage(this.wastedApplications / this.totalPossibleTicks)}%</b> of your Sentinel ticks happened while one of the targets already a hunter's mark on them.`}
            >
            </div>
            <div
              className="Druid-bg"
              style={{ width: `${formatPercentage(this.buggedTicks / this.totalPossibleTicks)}%` }}
              data-tip={`<b>${formatPercentage(this.buggedTicks / this.totalPossibleTicks)}%</b> of your expected Sentinel ticks bugged and didn't happen.`}
            >
            </div>
          </div>
        )}
        footerStyle={{ overflow: 'hidden' }}
      />
    );
  }
}

export default Sentinel;
