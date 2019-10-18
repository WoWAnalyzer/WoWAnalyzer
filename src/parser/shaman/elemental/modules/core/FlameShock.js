import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';

import Enemies from 'parser/shared/modules/Enemies';
import EarlyDotRefreshes from 'parser/shared/modules/earlydotrefreshes/EarlyDotRefreshesInstants';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

const FLAME_SHOCK_DOT = {
  name: "Flame Shock",
  debuffId: SPELLS.FLAME_SHOCK.id,
  castId: SPELLS.FLAME_SHOCK.id,
  duration: 24000,
  movementFiller: true,
};

class FlameShock extends EarlyDotRefreshes {
  static dependencies = {
    enemies: Enemies,
  };

  badLavaBursts = 0;

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.FLAME_SHOCK.id) / this.owner.fightDuration;
  }

  on_byPlayer_damage(event) {
    if(event.ability.guid !== SPELLS.LAVA_BURST.id) {
      return;
    }

    const target = this.enemies.getEntity(event);
    if(target && !target.hasBuff(SPELLS.FLAME_SHOCK.id)){
      this.badLavaBursts++;
    }
  }

  get refreshThreshold() {
    return {
      actual: 0,
      isLessThan: {
        minor: 0.95,
        average: 0.85,
        major: 0.75,
      },
      style: 'percentage',
    };
  }

  get uptimeThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.99,
        average: 0.95,
        major: 0.85,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.uptimeThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<span>Your <SpellLink id={SPELLS.FLAME_SHOCK.id} /> uptime can be improved.</span>)
        .icon(SPELLS.FLAME_SHOCK.icon)
        .actual(`${formatPercentage(actual)}% uptime`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
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
        tooltip="Flame Shock Uptime"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default FlameShock;
