import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import { formatThousands, formatNumber, formatPercentage } from 'common/format';

import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

class BilescourgeBombers extends Analyzer {
  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BILESCOURGE_BOMBERS_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BILESCOURGE_BOMBERS_DAMAGE), this.handleBilescourgeDamage);
  }

  handleBilescourgeDamage(event) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  get dps() {
    return this.damage / this.owner.fightDuration * 1000;
  }

  statistic() {
    return (
      <Statistic
        size="small"
        tooltip={`${formatThousands(this.damage)} damage`}
      >
        <BoringSpellValueText spell={SPELLS.BILESCOURGE_BOMBERS_TALENT}>
          {formatNumber(this.dps)} DPS <small>{formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} % of total</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BilescourgeBombers;
