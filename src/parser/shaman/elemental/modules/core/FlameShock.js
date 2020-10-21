import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';

import Enemies from 'parser/shared/modules/Enemies';
import EarlyDotRefreshesAnalyzer from 'parser/shared/modules/earlydotrefreshes/EarlyDotRefreshes';
import badRefreshSuggestion from 'parser/shared/modules/earlydotrefreshes/EarlyDotRefreshesSuggestionByCount';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/Analyzer';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

class FlameShock extends EarlyDotRefreshesAnalyzer {
  static dependencies = {
    ...EarlyDotRefreshesAnalyzer.dependencies,
    enemies: Enemies,
  };

  static dots = [{
    name: "Flame Shock",
    debuffId: SPELLS.FLAME_SHOCK.id,
    castId: SPELLS.FLAME_SHOCK.id,
    duration: 24000,
    movementFiller: true,
  }]

  badLavaBursts = 0;

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.FLAME_SHOCK.id) / this.owner.fightDuration;
  }

  get refreshThreshold() {
    return {
      spell: SPELLS.FLAME_SHOCK,
      count: this.casts[SPELLS.FLAME_SHOCK.id].badCasts,
      actual: this.badCastsPercent(SPELLS.FLAME_SHOCK.id),
      isGreaterThan: {
        minor: 0.10,
        average: 0.20,
        major: 0.30,
      },
      style: 'percentage',
    };
  }

  get uptimeThreshold() {
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

  constructor(options){
    super(options);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.LAVA_BURST), this.onDamage);
  }

  onDamage(event) {
    const target = this.enemies.getEntity(event);
    if(target && !target.hasBuff(SPELLS.FLAME_SHOCK.id)){
      this.badLavaBursts += 1;
    }
  }

  suggestions(when) {
    when(this.uptimeThreshold).addSuggestion((suggest, actual, recommended) => suggest(<span>Your <SpellLink id={SPELLS.FLAME_SHOCK.id} /> uptime can be improved.</span>)
        .icon(SPELLS.FLAME_SHOCK.icon)
        .actual(i18n._(t('shaman.elemental.suggestions.flameShock.uptime')`${formatPercentage(actual)}% uptime`))
        .recommended(`>${formatPercentage(recommended)}% is recommended`));

    when(this.badLavaBursts).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => suggest(<span>Make sure to apply <SpellLink id={SPELLS.FLAME_SHOCK.id} /> to your target, so your <SpellLink id={SPELLS.LAVA_BURST.id} /> is guaranteed to critically strike.</span>)
          .icon(SPELLS.LAVA_BURST.icon)
          .actual(i18n._(t('shaman.elemental.suggestions.flameShock.efficiency')`${formatNumber(this.badLavaBursts)} Lava Burst casts without Flame Shock DOT`))
          .recommended(`0 is recommended`)
          .major(recommended+1));

    badRefreshSuggestion(when, this.refreshThreshold);
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
