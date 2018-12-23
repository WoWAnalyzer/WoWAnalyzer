import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatThousands } from 'common/format';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

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

  subStatistic() {
    const damage = this.damage;
    return (
      <StatisticListBoxItem
        title={<><SpellLink id={SPELLS.NETHER_PORTAL_TALENT.id} /> dmg</>}
        value={this.owner.formatItemDamageDone(damage)}
        valueTooltip={`${formatThousands(damage)} damage`}
      />
    );
  }
}
export default NetherPortal;
