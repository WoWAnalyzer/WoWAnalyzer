import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatThousands } from 'common/format';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

class ChannelDemonfire extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.CHANNEL_DEMONFIRE_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CHANNEL_DEMONFIRE_DAMAGE), this.onCDFdamage);
  }

  onCDFdamage(event) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<><SpellLink id={SPELLS.CHANNEL_DEMONFIRE_TALENT.id} /> damage</>}
        value={this.owner.formatItemDamageDone(this.damage)}
        valueTooltip={`${formatThousands(this.damage)} damage`}
      />
    );
  }
}

export default ChannelDemonfire;
