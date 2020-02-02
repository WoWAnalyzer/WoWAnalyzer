import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

const LAG_BUFFER_MS = 100;
const BUFF_DURATION_MS = 10000;

class KillingMachineEfficiency extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  kmProcs = 0;
  lastGCD = null;
  lastProc = null;
  refreshedKMProcs = 0;
  expiredKMProcs = 0;

  constructor(...args) {
    super(...args);
    
    this.addEventListener(Events.GlobalCooldown, this.globalCooldown);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.KILLING_MACHINE), this.onApplyBuff);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.KILLING_MACHINE), this.onRemoveBuff);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.KILLING_MACHINE), this.onRefreshBuff);
    
  }

  onApplyBuff(event) {
    this.kmProcs += 1;
    this.lastProc = event;
  }

  onRemoveBuff(event){
    const durationHeld = event.timestamp - this.lastProc.timestamp;
    if(durationHeld > (BUFF_DURATION_MS)){
      this.expiredKMProcs += 1;
    }
  }

  onRefreshBuff(event){
    const timeSinceGCD = event.timestamp - this.lastGCD.timestamp;
    if(timeSinceGCD < this.lastGCD.duration + LAG_BUFFER_MS){
      return;
    }
    this.refreshedKMProcs += 1;
  }

  globalCooldown(event) {
    this.lastGCD = event;
  }

  get totalWastedProcs(){
    return this.refreshedKMProcs + this.expiredKMProcs;
  }

  get wastedProcRate(){
    return this.totalWastedProcs / this.kmProcs;
  }

  get totalProcs(){
    return this.kmProcs + this.refreshedKMProcs;
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
        return suggest(<React.Fragment> You wasted <SpellLink id={SPELLS.KILLING_MACHINE.id} /> procs. You should be casting <SpellLink id={SPELLS.OBLITERATE_CAST.id} /> or <SpellLink id={SPELLS.FROSTSCYTHE_TALENT.id} /> within 1 or 2 GCDs of gaining a Killing Machine proc to avoid wasting it.  See one of the guides in the sidebar for more information on when another ability takes precedence over spending Killing Machine</React.Fragment>)
          .icon(SPELLS.KILLING_MACHINE.icon)
          .actual(`${formatPercentage(this.wastedProcRate)}% of Killing Machine procs were either refreshed and lost or expired without being used`)
          .recommended(`<${formatPercentage(1-recommended)}% is recommended`);
      });
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(5)}
        icon={<SpellIcon id={SPELLS.KILLING_MACHINE.id} />}
        value={`${formatPercentage(this.efficiency)} %`}
        label="Killing Machine Efficiency"
        tooltip={`You wasted ${this.totalWastedProcs} out of ${this.totalProcs} Killing Machine procs (${formatPercentage(this.wastedProcRate)}%).  ${this.expiredKMProcs} procs expired without being used and ${this.refreshedKMProcs} procs were overwritten by new procs.`}
      />
    );
  }
}

export default KillingMachineEfficiency;
