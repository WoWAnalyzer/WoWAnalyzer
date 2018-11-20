import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatThousands } from 'common/format';

import StatisticBox from 'interface/others/StatisticBox';

import DemoPets from '../pets/DemoPets';

class NetherPortal extends Analyzer {
  static dependencies = {
    demoPets: DemoPets,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.NETHER_PORTAL_TALENT.id);
  }

  get damage() {
    const petsSummonedByNP = this.demoPets.timeline.filter(pet => pet.summonedBy === SPELLS.NETHER_PORTAL_TALENT.id);
    return petsSummonedByNP
      .map(pet => this.demoPets.getPetDamage(pet.guid, pet.instance))
      .reduce((total, current) => total + current, 0);
  }

  statistic() {
    const damage = this.damage;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.NETHER_PORTAL_TALENT.id} />}
        value={formatThousands(damage)}
        label="Damage from Nether Portal pets"
        tooltip={this.owner.formatItemDamageDone(damage)}
      />
    );
  }
}
export default NetherPortal;
