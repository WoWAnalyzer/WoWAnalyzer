import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

class FlameShock extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  badLavaBursts = 0;

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.FLAME_SHOCK.id) / this.owner.fightDuration;
  }

  on_byPlayer_cast(event) {
    if(event.ability.guid !== SPELLS.LAVA_BURST.id) {
      return;
    }

    const target = this.enemies.getEntity(event);
    if(target && !target.hasBuff(SPELLS.FLAME_SHOCK.id)){
      this.badLavaBursts++;
    }
  }

  suggestions(when) {
    when(this.uptime).isLessThan(0.99)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.FLAME_SHOCK.id} /> uptime can be improved.</span>)
          .icon(SPELLS.FLAME_SHOCK.icon)
          .actual(`${formatPercentage(actual)}% uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(recommended - 0.05).major(recommended - 0.15);
      });

    when(this.badLavaBursts).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Make sure to apply <SpellLink id={SPELLS.FLAME_SHOCK.id} /> to your target, so your <SpellLink id={SPELLS.LAVA_BURST.id} /> is guaranteed to critically strike.</span>)
          .icon(SPELLS.LAVA_BURST.icon)
          .actual(`${formatNumber(this.badLavaBursts)} Lava Burst casts without Flame Shock DOT`)
          .recommended(`0 is recommended`)
          .major(recommended+1);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.FLAME_SHOCK.id} />}
        value={`${formatPercentage(this.uptime)} %`}
        label="Uptime"
        tooltip={
          `Flameshock Uptime`
        }
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default FlameShock;
