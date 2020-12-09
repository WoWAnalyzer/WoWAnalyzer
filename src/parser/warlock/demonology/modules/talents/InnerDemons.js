import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import { formatThousands } from 'common/format';

import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';

import DemoPets from '../pets/DemoPets';
import PETS from '../pets/PETS';
import { isRandomPet } from '../pets/helpers';

class InnerDemons extends Analyzer {
  get damage() {
    const wildImps = this.demoPets.getPetDamage(PETS.WILD_IMP_INNER_DEMONS.guid);
    const otherPetsSummonedByID = this.demoPets.timeline.filter(pet => isRandomPet(pet.guid) && pet.summonedBy === SPELLS.INNER_DEMONS_TALENT.id);
    const other = otherPetsSummonedByID
      .map(pet => this.demoPets.getPetDamage(pet.guid, pet.instance))
      .reduce((total, current) => total + current, 0);
    return wildImps + other;
  }

  static dependencies = {
    demoPets: DemoPets,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.INNER_DEMONS_TALENT.id);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={(
          <>
            {formatThousands(this.damage)} damage<br />
            Note that this only counts the direct damage from them, not Implosion damage (if used) from Wild Imps
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.INNER_DEMONS_TALENT}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default InnerDemons;
