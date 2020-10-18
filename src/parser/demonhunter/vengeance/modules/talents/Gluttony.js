import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Events from 'parser/core/Events';

//WCL https://www.warcraftlogs.com/reports/rz6WxLbAmTgnFXQP/#fight=3&source=3
class Gluttony extends Analyzer {

  buffCasts = 0;
  metaCast = 0;


  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.GLUTTONY_TALENT.id);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.METAMORPHOSIS_TANK), this.onApplyBuff);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.METAMORPHOSIS_TANK), this.onCast);
  }

  onApplyBuff(event) {
    this.buffCasts += 1;
  }

  onCast(event) {
    this.metaCast += 1;
  }


  get gluttonyProcs(){
    return this.buffCasts - this.metaCast;
  }


  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.GLUTTONY_TALENT.id}
        position={STATISTIC_ORDER.CORE(7)}
        value={`${this.gluttonyProcs}`}
        label="Gluttony procs"
      />
    );
  }
}

export default Gluttony;
