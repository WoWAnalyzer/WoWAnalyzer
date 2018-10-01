import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import AbilityTracker from 'parser/core/modules/AbilityTracker';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

const LAG_BUFFER_MS = 100;
const BUFF_DURATION_SEC = 15;

class RimeEfficiency extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  rimeProcs = 0;
  lastGCD = null;
  lastProc = null;
  refreshedRimeProcs = 0;
  expiredRimeProcs = 0;

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.RIME.id){
      return;
    }
    this.rimeProcs += 1;
    this.lastProc = event;
  }

  on_byPlayer_removebuff(event){
    const spellId = event.ability.guid;
    if(spellId !== SPELLS.RIME.id || !this.lastProc){
      return;
    }
    const durationHeld = event.timestamp - this.lastProc.timestamp;
    if(durationHeld > (BUFF_DURATION_SEC * 1000)){
      this.expiredRimeProcs += 1;
    }
  }

  on_byPlayer_refreshbuff(event){
    const spellId = event.ability.guid;
    if(spellId !== SPELLS.RIME.id || !this.lastGCD){
      return;
    }
    const timeSinceGCD = event.timestamp - this.lastGCD.timestamp;
    if(timeSinceGCD < this.lastGCD.duration + LAG_BUFFER_MS){
      return;
    }
    this.refreshedRimeProcs += 1;
  }

  on_byPlayer_globalcooldown(event) {
    this.lastGCD = event;
  }

  get totalWastedProcs(){
    return this.refreshedRimeProcs + this.expiredRimeProcs;
  }

  get wastedProcRate(){
    return this.totalWastedProcs / this.rimeProcs;
  }

  get efficiency(){
    return 1 - this.wastedProcRate;
  }

  get suggestionThresholds() {
    return {
      actual: this.efficiency,
      isLessThan: {
        minor: .95,
        average: .90,
        major: .85,
      },
      style: 'percentage',
      suffix: 'Average',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment> You are wasting <SpellLink id={SPELLS.RIME.id} /> procs. You should be casting <SpellLink id={SPELLS.HOWLING_BLAST.id} /> as soon as possible when you have a Rime proc to avoid wasting it.</React.Fragment>)
          .icon(SPELLS.RIME.icon)
          .actual(`${formatPercentage(this.wastedProcRate)}% of Rime procs were either refreshed and lost or expired without being used`)
          .recommended(`<${recommended} is recommended`);
      });
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(5)}
        icon={<SpellIcon id={SPELLS.RIME.id} />}
        value={`${formatPercentage(this.efficiency)} %`}
        label="Rime Efficiency"
        tooltip={`You wasted ${this.totalWastedProcs} out of ${this.rimeProcs} Rime procs (${formatPercentage(this.wastedProcRate)}%).  ${this.expiredRimeProcs} procs expired without being used and ${this.refreshedRimeProcs} procs were overwritten by new procs.`}
      />
    );
  }
}

export default RimeEfficiency;
