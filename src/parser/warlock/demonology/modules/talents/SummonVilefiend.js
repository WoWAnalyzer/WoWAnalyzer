import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import { formatThousands } from 'common/format';
import STATISTIC_CATEGORY from 'interface/STATISTIC_CATEGORY';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';

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
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`${formatThousands(damage)} damage`}
      >
        <BoringSpellValueText spell={SPELLS.SUMMON_VILEFIEND_TALENT}>
          <ItemDamageDone amount={damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SummonVilefiend;
