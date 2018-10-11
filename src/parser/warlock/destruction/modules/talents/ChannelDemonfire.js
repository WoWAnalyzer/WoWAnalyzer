import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage, formatThousands } from 'common/format';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

class ChannelDemonfire extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.CHANNEL_DEMONFIRE_TALENT.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.CHANNEL_DEMONFIRE_DAMAGE.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  get dps() {
    return this.damage / this.owner.fightDuration * 1000;
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={SPELLS.CHANNEL_DEMONFIRE_TALENT.id}>Channel Demonfire gain</SpellLink>}
        value={`${formatThousands(this.dps)} DPS`}
        valueTooltip={`Your Channel Demonfire contributed ${formatThousands(this.damage)} total damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))}%).`}
      />
    );
  }
}

export default ChannelDemonfire;
