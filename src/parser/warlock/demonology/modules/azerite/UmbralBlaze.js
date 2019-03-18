import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import { formatThousands, formatNumber, formatPercentage } from 'common/format';

import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';

/*
  Umbral Blaze:
    Your Hand of Guldan has a 15% chance to burn its target for X additional Shadowflame damage every 2 sec for 6 sec.
 */
class UmbralBlaze extends Analyzer {
  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.UMBRAL_BLAZE.id);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.UMBRAL_BLAZE_DEBUFF), this.onUmbralBlazeDamage);
  }

  onUmbralBlazeDamage(event) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  get dps() {
    return this.damage / this.owner.fightDuration * 1000;
  }

  statistic() {
    return (
      <AzeritePowerStatistic
        size="small"
        tooltip={`${formatThousands(this.damage)} damage`}
      >
        <BoringSpellValueText spell={SPELLS.UMBRAL_BLAZE}>
          {formatNumber(this.dps)} DPS <small>{formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} % of total</small>
        </BoringSpellValueText>
      </AzeritePowerStatistic>
    );
  }
}

export default UmbralBlaze;
