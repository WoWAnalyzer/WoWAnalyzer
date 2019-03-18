import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import { formatThousands, formatNumber, formatPercentage } from 'common/format';

import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

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

  statistic() {
    const damage = this.damage;
    const dps = damage / this.owner.fightDuration * 1000;

    return (
      <Statistic
        size="small"
        tooltip={(
          <>
            {formatThousands(damage)} damage<br />
            Note that this only counts the direct damage from them, not Implosion damage (if used) from Wild Imps
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.INNER_DEMONS_TALENT}>
          {formatNumber(dps)} DPS <small>{formatPercentage(this.owner.getPercentageOfTotalDamageDone(damage))} % of total</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default InnerDemons;
