import React from 'react';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';

import GuardianOfElune from './GuardianOfElune';

class IronFurGoEProcs extends Analyzer {
  static dependencies = {
    guardianOfElune: GuardianOfElune,
  };
  statisticOrder = STATISTIC_ORDER.CORE(9);

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.GUARDIAN_OF_ELUNE_TALENT.id);
  }

  statistic() {
    const nonGoEIronFur = this.guardianOfElune.nonGoEIronFur;
    const GoEIronFur = this.guardianOfElune.GoEIronFur;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.IRONFUR.id} />}
        value={`${formatPercentage(nonGoEIronFur / (nonGoEIronFur + GoEIronFur))}%`}
        label="Unbuffed Ironfur"
        tooltip={<>You cast <strong>{nonGoEIronFur + GoEIronFur}</strong> total {SPELLS.IRONFUR.name} and <strong>{GoEIronFur}</strong> were buffed by 2s.</>}
      />
    );
  }
}

export default IronFurGoEProcs;
