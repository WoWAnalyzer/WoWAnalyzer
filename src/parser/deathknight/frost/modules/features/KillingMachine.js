import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

const LAG_BUFFER_MS = 100;
const BUFF_DURATION_SEC = 10;

class KillingMachineEfficiency extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  kmProcs = 0;
  lastGCD = null;
  lastProc = null;
  refreshedKMProcs = 0;
  expiredKMProcs = 0;

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.KILLING_MACHINE.id){
      return;
    }
    this.kmProcs += 1;
    this.lastProc = event;
  }

  on_byPlayer_removebuff(event){
    const spellId = event.ability.guid;
    if(spellId !== SPELLS.KILLING_MACHINE.id || !this.lastProc){
      return;
    }
    const durationHeld = event.timestamp - this.lastProc.timestamp;
    if(durationHeld > (BUFF_DURATION_SEC * 1000)){
      this.expiredKMProcs += 1;
    }
  }

  on_byPlayer_refreshbuff(event){
    const spellId = event.ability.guid;
    if(spellId !== SPELLS.KILLING_MACHINE.id || !this.lastGCD){
      return;
    }
    const timeSinceGCD = event.timestamp - this.lastGCD.timestamp;
    if(timeSinceGCD < this.lastGCD.duration + LAG_BUFFER_MS){
      return;
    }
    this.refreshedKMProcs += 1;
  }

  on_byPlayer_globalcooldown(event) {
    this.lastGCD = event;
  }

  get totalWastedProcs(){
    return this.refreshedKMProcs + this.expiredKMProcs;
  }

  get wastedProcRate(){
    return this.totalWastedProcs / this.kmProcs;
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
        return suggest(<> You are wasting <SpellLink id={SPELLS.KILLING_MACHINE.id} /> procs. You should be casting <SpellLink id={SPELLS.OBLITERATE_CAST.id} /> or <SpellLink id={SPELLS.FROSTSCYTHE_TALENT.id} /> within 1 or 2 GCDs of gaining a Killing Machine proc to avoid wasting it.  See one of the guides in the sidebar for more information on when another ability takes precedence over spending Killing Machine</>)
          .icon(SPELLS.KILLING_MACHINE.icon)
          .actual(`${formatPercentage(this.wastedProcRate)}% of Killing Machine procs were either refreshed and lost or expired without being used`)
          .recommended(`>${recommended}% is recommended`);
      });
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(5)}
        icon={<SpellIcon id={SPELLS.KILLING_MACHINE.id} />}
        value={`${formatPercentage(this.efficiency)} %`}
        label="Killing Machine Efficiency"
        tooltip={`You wasted ${this.totalWastedProcs} out of ${this.kmProcs} Killing Machine procs (${formatPercentage(this.wastedProcRate)}%).  ${this.expiredKMProcs} procs expired without being used and ${this.refreshedKMProcs} procs were overwritten by new procs.`}
      />
    );
  }
}

export default KillingMachineEfficiency;
