import React from 'react';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Events from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

/**
 * Example Report: https://www.warcraftlogs.com/reports/1HRhNZa2cCkgK9AV#fight=48&type=summary&source=10
 */
class Felblade extends Analyzer{

  furyGain = 0;
  furyWaste = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FELBLADE_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.FELBLADE_PAIN_GENERATION), this.onEnergizeEvent);
  }

  onEnergizeEvent(event) {
    this.furyGain += event.resourceChange;
    this.furyWaste += event.waste;
  }

  get furyPerMin() {
    return ((this.furyGain - this.furyWaste) / (this.owner.fightDuration/60000)).toFixed(2);
  }

  statistic(){
    this.effectiveFuryGain = this.furyGain - this.furyWaste;
    return (
      <TalentStatisticBox
        talent={SPELLS.FELBLADE_TALENT.id}
        position={STATISTIC_ORDER.OPTIONAL(6)}
        value={`${this.furyPerMin} fury per min`}
        tooltip={`
          ${this.effectiveFuryGain} Effective fury gained<br />
          ${this.furyGain} Total fury gained<br />
          ${this.furyWaste} Fury wasted
        `}
      />
    );
  }
}
export default Felblade;
