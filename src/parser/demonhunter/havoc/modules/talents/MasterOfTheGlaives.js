import React from 'react';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox from 'parser/ui/TalentStatisticBox';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Events from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

/**
 * Example Report: https://www.warcraftlogs.com/reports/QDMVJtvnBz43NZLk/#fight=2&source=1
 */

class MasterOfTheGlaives extends Analyzer {

  slows = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MASTER_OF_THE_GLAIVE_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.MASTER_OF_THE_GLAIVE_DEBUFF), this.countingSlows);
  }

  countingSlows(event) {
    this.slows += 1;
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.MASTER_OF_THE_GLAIVE_TALENT.id}
        position={STATISTIC_ORDER.OPTIONAL(6)}
        value={<>{this.slows} <small>slows provided</small></>}
      />
    );
  }
}

export default MasterOfTheGlaives;
