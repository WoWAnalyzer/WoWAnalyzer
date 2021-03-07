import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import React from 'react';

import GuardianOfElune from './GuardianOfElune';

class FrenziedRegenGoEProcs extends Analyzer {
  static dependencies = {
    guardianOfElune: GuardianOfElune,
  };
  statisticOrder = STATISTIC_ORDER.CORE(8);

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.GUARDIAN_OF_ELUNE_TALENT.id);
  }

  statistic() {
    const nonGoEFRegen = this.guardianOfElune.nonGoEFRegen;
    const GoEFRegen = this.guardianOfElune.GoEFRegen;
    if (nonGoEFRegen + GoEFRegen === 0) {
      return null;
    }
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.FRENZIED_REGENERATION.id} />}
        value={`${formatPercentage(nonGoEFRegen / (nonGoEFRegen + GoEFRegen))}%`}
        label="Unbuffed Frenzied Regen"
        tooltip={
          <>
            You cast <strong>{nonGoEFRegen + GoEFRegen}</strong> total{' '}
            {SPELLS.FRENZIED_REGENERATION.name} and <strong>{GoEFRegen}</strong> were buffed by 20%.
          </>
        }
      />
    );
  }
}

export default FrenziedRegenGoEProcs;
