import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatThousands } from 'common/format';

import StatisticBox from 'interface/others/StatisticBox';

import DemoPets from '../pets/DemoPets';
import PETS from '../pets/PETS';

// random pets that can be summoned from Inner Demons/Nether Portal. Does NOT include Wild Imps summoned by Inner Demons, those are not random
const RANDOM_PET_GUIDS = Object.values(PETS).filter(pet => pet.isRandom).map(pet => pet.guid);

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
    const otherPetsSummonedByID = this.demoPets.timeline.filter(pet => RANDOM_PET_GUIDS.includes(pet.guid) && pet.summonedBy === SPELLS.INNER_DEMONS_TALENT.id);
    const other = otherPetsSummonedByID
      .map(pet => this.demoPets.getPetDamage(pet.guid, pet.instance))
      .reduce((total, current) => total + current, 0);
    return wildImps + other;
  }

  statistic() {
    const damage = this.damage;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.INNER_DEMONS_TALENT.id} />}
        value={formatThousands(damage)}
        label="Damage from Inner Demons pets"
        tooltip={`${this.owner.formatItemDamageDone(damage)}<br />
                  Note that this only counts the direct damage from them, not Implosion damage (if used) from Wild Imps`}
      />
    );
  }
}

export default InnerDemons;
