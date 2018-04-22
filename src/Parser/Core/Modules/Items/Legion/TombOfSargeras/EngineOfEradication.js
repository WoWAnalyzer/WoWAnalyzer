import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import { calculatePrimaryStat } from 'common/stats';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

const BASE_DURATION = 12000;
const ORB_DURATION = 3000;

const MAX_ORBS = 4;
// percent of max orbs collected
const MINOR = 0.95;
const AVERAGE = 0.75;
const MAJOR = 0.50;

/*
 * Engine of Eradication -
 * Equip: Your auto attacks have a chance to increase your Strength or Agility, based on your specialization, by 4,942 for 12 sec, and expel orbs of fel energy. Collecting an orb increases the duration of this effect by 3 sec. (Approximately 1 procs per minute)
 */
class EngineOfEradication extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  applicationDurations = [];
  procAmount = null;
  lastAppliedTimestamp = null;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.ENGINE_OF_ERADICATION.id);
    if(this.active) {
      this.procAmount = calculatePrimaryStat(900, 5424, this.combatants.selected.getItem(ITEMS.ENGINE_OF_ERADICATION.id).itemLevel);
    }
  }

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.DEMONIC_VIGOR.id) {
      this.lastAppliedTimestamp = event.timestamp;
    }
  }

  on_toPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.DEMONIC_VIGOR.id) {
      const procUptime = event.timestamp - this.lastAppliedTimestamp;
      this.applicationDurations.push(procUptime);
      this.lastAppliedTimestamp = null;
    }
  }

  get uptime() {
    const completedProcDuration = this.applicationDurations.reduce((acc, dur) => acc + dur, 0);
    const inProgressDuration = this.lastAppliedTimestamp ? this.owner.currentTimestamp - this.lastAppliedTimestamp : 0;
    return completedProcDuration + inProgressDuration;
  }

  get uptimePercent() {
    return this.uptime / this.owner.fightDuration;
  }

  get averageProcDuration() {
    const completedProcDuration = this.applicationDurations.reduce((acc, dur) => acc + dur, 0);
    return completedProcDuration / this.applicationDurations.length;
  }

  get averageOrbsCollected() {
    return (this.averageProcDuration - BASE_DURATION) / ORB_DURATION;
  }

  get averageStatGain() {
    return this.uptimePercent * this.procAmount;
  }

  item() {
    return {
      item: ITEMS.ENGINE_OF_ERADICATION,
      result: (
        <dfn data-tip={`This is the stat gain from procs averaged over the fight's duration.
        <ul>
        <li>Uptime: <b>${formatPercentage(this.uptimePercent)}%</b></li>
        <li>Avg Orbs collected: <b>${this.averageOrbsCollected.toFixed(1)}</b></li>
        </ul>
        `}>
        {this.averageStatGain.toFixed(0)} average {this.combatants.selected.spec.primaryStat}
        </dfn>
      ),
    };
  }

  suggestions(when) {
    const percentOrbsCollected = this.averageOrbsCollected / MAX_ORBS;
    when(percentOrbsCollected).isLessThan(MINOR)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>You didn't collect all your orbs from Engine of Eradication's proc, <SpellLink id={SPELLS.DEMONIC_VIGOR.id} />. Maximize the proc uptime by collecting all orbs whenever possible.</React.Fragment>)
        .icon(ITEMS.ENGINE_OF_ERADICATION.icon)
        .actual(`You averaged ${this.averageOrbsCollected.toFixed(1)} orbs per proc, or ${formatPercentage(percentOrbsCollected, 0)}% of the total possible.`)
        .recommended(`Always collecting all ${MAX_ORBS} is recommended.`)
        .regular(AVERAGE).major(MAJOR);
      });
  }
}

export default EngineOfEradication;
