import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatThousands } from 'common/format';

import StatisticBox from 'interface/others/StatisticBox';

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
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SUMMON_VILEFIEND_TALENT.id} />}
        value={formatThousands(damage)}
        label="Vilefiend damage"
        tooltip={this.owner.formatItemDamageDone(damage)}
      />
    );
  }
}

export default SummonVilefiend;
