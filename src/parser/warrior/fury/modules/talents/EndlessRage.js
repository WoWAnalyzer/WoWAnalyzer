import React from 'react';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import Analyzer from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';

class EndlessRage extends Analyzer {
  rageGen = 0;
    
  constructor(...args) {
    super(...args);

    this.active = this.selectedCombatant.hasTalent(SPELLS.ENDLESS_RAGE_TALENT.id);

    if(!this.active) {
      return;
    }

    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.ENDLESS_RAGE_ENERGISE), this.onPlayerBuff);
  }

  onPlayerBuff(event) {
    this.rageGen += event.resourceChange;
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.ENDLESS_RAGE_TALENT.id}
        value={`${this.rageGen} rage generated`}
        label="Endless Rage"
      />
    );
  }
}

export default EndlessRage;