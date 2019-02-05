import React from 'react';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Events from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

/**
 * Example Report: https://www.warcraftlogs.com/reports/GdDhNAZgp2X3PbVC#fight=31&type=summary&source=10
 */
const MAX_FURY = 120;
class BlindFury extends Analyzer{

  gained = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BLIND_FURY_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EYE_BEAM), this.onEyeBeamsCast);
  }

  //Since this will always max out your fury, we only care how much did you gain.
  onEyeBeamsCast(event) {
    this.gained += (MAX_FURY - (event.classResources[0].amount - event.classResources[0].cost));
  }

  get furyPerMin() {
    return (this.gained / (this.owner.fightDuration/60000)).toFixed(2);
  }

  statistic(){
    return (
      <TalentStatisticBox
        talent={SPELLS.BLIND_FURY_TALENT.id}
        position={STATISTIC_ORDER.OPTIONAL(6)}
        value={`${this.furyPerMin} fury per min`}
        tooltip={`Since this will always max out your fury on cast, wasted and totals do not matter. Only the amount effectively gained. <br /><br />
                  ${this.gained} Effective fury gained<br />
        `}
      />
    );
  }
}
export default BlindFury;
