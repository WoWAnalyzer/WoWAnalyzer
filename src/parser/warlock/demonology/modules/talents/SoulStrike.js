import React from 'react';

import Analyzer, { SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import { formatThousands, formatNumber, formatPercentage } from 'common/format';

import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

import SoulShardTracker from '../soulshards/SoulShardTracker';

class SoulStrike extends Analyzer {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
  };

  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SOUL_STRIKE_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.SOUL_STRIKE_DAMAGE), this.handleSoulStrikeDamage);
  }

  handleSoulStrikeDamage(event) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  get dps() {
    return this.damage / this.owner.fightDuration * 1000;
  }

  statistic() {
    const shardsGained = this.soulShardTracker.getGeneratedBySpell(SPELLS.SOUL_STRIKE_SHARD_GEN.id);
    return (
      <Statistic
        size="flexible"
        tooltip={`${formatThousands(this.damage)} damage`}
      >
        <BoringSpellValueText spell={SPELLS.SOUL_STRIKE_TALENT}>
          {formatNumber(this.dps)} DPS <small>{formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} % of total</small> <br />
          {shardsGained} <small>Soul Shards generated</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SoulStrike;
