import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import { formatThousands, formatNumber, formatPercentage } from 'common/format';

import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

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
    const dps = damage / this.owner.fightDuration * 1000;

    return (
      <Statistic
        size="small"
        tooltip={`${formatThousands(damage)} damage`}
      >
        <BoringSpellValueText spell={SPELLS.NETHER_PORTAL_TALENT}>
          {formatNumber(dps)} DPS <small>{formatPercentage(this.owner.getPercentageOfTotalDamageDone(damage))} % of total</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
export default NetherPortal;
