import React from 'react';

import SPELLS from 'common/SPELLS';
import UptimeIcon from 'interface/icons/Uptime';
import { SpellLink } from 'interface';
import { formatNumber, formatPercentage } from 'common/format';

import Enemies from 'parser/shared/modules/Enemies';
import EarlyDotRefreshesAnalyzer from 'parser/shared/modules/earlydotrefreshes/EarlyDotRefreshes';
import badRefreshSuggestion from 'parser/shared/modules/earlydotrefreshes/EarlyDotRefreshesSuggestionByCount';

import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { DamageEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import Events from 'parser/core/Events';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

import { t } from '@lingui/macro';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';

class FlameShock extends EarlyDotRefreshesAnalyzer {
  static dependencies = {
    ...EarlyDotRefreshesAnalyzer.dependencies,
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  static dots = [{
    name: "Flame Shock",
    debuffId: SPELLS.FLAME_SHOCK.id,
    castId: SPELLS.FLAME_SHOCK.id,
    duration: 18000,
    movementFiller: true,
  }]

  badLavaBursts = 0;

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.FLAME_SHOCK.id) / this.owner.fightDuration;
  }

  get refreshThreshold() {
    const casts: any = this.casts;
    return {
      spell: SPELLS.FLAME_SHOCK,
      count: casts[SPELLS.FLAME_SHOCK.id].badCasts,
      actual: this.badCastsPercent(SPELLS.FLAME_SHOCK.id),
      isGreaterThan: {
        minor: 0.10,
        average: 0.20,
        major: 0.30,
      },
      style: ThresholdStyle.PERCENTAGE,
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
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  constructor(options: Options){
    super(options);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.LAVA_BURST), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    const target = this.enemies.getEntity(event);
    if(target && !target.hasBuff(SPELLS.FLAME_SHOCK.id)){
      this.badLavaBursts += 1;
    }
  }

  suggestions(when: When) {
    when(this.uptimeThreshold).addSuggestion((suggest, actual, recommended) => suggest(<span>Your <SpellLink id={SPELLS.FLAME_SHOCK.id} /> uptime can be improved.</span>)
        .icon(SPELLS.FLAME_SHOCK.icon)
        .actual(t({
      id: "shaman.elemental.suggestions.flameShock.uptime",
      message: `${formatPercentage(actual)}% uptime`
    }))
        .recommended(`>${formatPercentage(recommended)}% is recommended`));

    when(this.badLavaBursts).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => suggest(<span>Make sure to apply <SpellLink id={SPELLS.FLAME_SHOCK.id} /> to your target, so your <SpellLink id={SPELLS.LAVA_BURST.id} /> is guaranteed to critically strike.</span>)
          .icon(SPELLS.LAVA_BURST.icon)
          .actual(t({
      id: "shaman.elemental.suggestions.flameShock.efficiency",
      message: `${formatNumber(this.badLavaBursts)} Lava Burst casts without Flame Shock DOT`
    }))
          .recommended(`0 is recommended`)
          .major(recommended+1));

    badRefreshSuggestion(when, this.refreshThreshold);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        tooltip="Flame Shock Uptime"
        >
        <BoringSpellValueText spell={SPELLS.FLAME_SHOCK}>
          <>
            <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FlameShock;
