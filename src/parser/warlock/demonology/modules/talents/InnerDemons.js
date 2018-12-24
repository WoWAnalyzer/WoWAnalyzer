import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatThousands } from 'common/format';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

import DemoPets from '../pets/DemoPets';
import PETS from '../pets/PETS';
import { isRandomPet } from '../pets/helpers';

class InnerDemons extends Analyzer {
  static dependencies = {
    demoPets: DemoPets,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.INNER_DEMONS_TALENT.id);
  }

  get damage() {
    const wildImps = this.demoPets.getPetDamage(PETS.WILD_IMP_INNER_DEMONS.guid);
    const otherPetsSummonedByID = this.demoPets.timeline.filter(pet => isRandomPet(pet.guid) && pet.summonedBy === SPELLS.INNER_DEMONS_TALENT.id);
    const other = otherPetsSummonedByID
      .map(pet => this.demoPets.getPetDamage(pet.guid, pet.instance))
      .reduce((total, current) => total + current, 0);
    return wildImps + other;
  }

  subStatistic() {
    const damage = this.damage;
    return (
      <StatisticListBoxItem
        title={<><SpellLink id={SPELLS.INNER_DEMONS_TALENT.id} /> dmg</>}
        value={this.owner.formatItemDamageDone(damage)}
        valueTooltip={`${formatThousands(damage)} damage<br />
                  Note that this only counts the direct damage from them, not Implosion damage (if used) from Wild Imps`}
      />
    );
  }
}

export default InnerDemons;
