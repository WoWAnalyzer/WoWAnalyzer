import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import { formatThousands } from 'common/format';

import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';

import DemoPets from '../pets/DemoPets';

class NetherPortal extends Analyzer {
  get damage() {
    const petsSummonedByNP = this.demoPets.timeline.filter(pet => pet.summonedBy === SPELLS.NETHER_PORTAL_TALENT.id);
    return petsSummonedByNP
      .map(pet => this.demoPets.getPetDamage(pet.guid, pet.instance))
      .reduce((total, current) => total + current, 0);
  }

  static dependencies = {
    demoPets: DemoPets,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.NETHER_PORTAL_TALENT.id);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`${formatThousands(this.damage)} damage`}
      >
        <BoringSpellValueText spell={SPELLS.NETHER_PORTAL_TALENT}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default NetherPortal;
