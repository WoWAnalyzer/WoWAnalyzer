import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import { formatThousands } from 'common/format';
import SpellLink from 'common/SpellLink';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

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
      <StatisticListBoxItem
        title={<><SpellLink id={SPELLS.SUMMON_VILEFIEND_TALENT.id} /> damage</>}
        value={formatThousands(damage)}
        valueTooltip={this.owner.formatItemDamageDone(damage)}
      />
    );
  }
}

export default SummonVilefiend;
