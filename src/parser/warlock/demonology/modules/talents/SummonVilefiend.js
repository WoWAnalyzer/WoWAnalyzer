import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import { formatThousands, formatNumber, formatPercentage } from 'common/format';

import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

import PETS from '../pets/PETS';
import DemoPets from '../pets/DemoPets';

class SummonVilefiend extends Analyzer {
  static dependencies = {
    demoPets: DemoPets,
  };

  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SUMMON_VILEFIEND_TALENT.id);
  }

  statistic() {
    const damage = this.demoPets.getPetDamage(PETS.VILEFIEND.guid);
    const dps = damage / this.owner.fightDuration * 1000;

    return (
      <Statistic
        size="small"
        tooltip={`${formatThousands(damage)} damage`}
      >
        <BoringSpellValueText spell={SPELLS.SUMMON_VILEFIEND_TALENT}>
          {formatNumber(dps)} DPS <small>{formatPercentage(this.owner.getPercentageOfTotalDamageDone(damage))} % of total</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SummonVilefiend;
