import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Enemies from 'parser/shared/modules/Enemies';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { formatNumber, formatPercentage } from 'common/format';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';

const HEAVY_REPERCUSSIONS_SHIELD_BLOCK_EXTEND_MS = 1000;
const HEAVY_REPERCUSSIONS_SHIELD_SLAM_DAMAGE_BUFF = 0.3;

class HeavyRepercussions extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  sbExtended = 0;
  sbCasts = 0;
  bonusDmg = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.HEAVY_REPERCUSSIONS_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_SLAM), this.onSlamDamage);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_SLAM), this.onSlamCast);
  }

  get shieldBlockuptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.SHIELD_BLOCK_BUFF.id);
  }

  onSlamDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.SHIELD_BLOCK_BUFF.id)) {
      return;
    }
    this.bonusDmg += calculateEffectiveDamage(event, HEAVY_REPERCUSSIONS_SHIELD_SLAM_DAMAGE_BUFF);
  }

  onSlamCast(event: CastEvent) {
    this.sbCasts += 1;
    if (!this.selectedCombatant.hasBuff(SPELLS.SHIELD_BLOCK_BUFF.id)) {
      return;
    }
    this.sbExtended += 1;
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.sbExtended / this.sbCasts,
      isLessThan: {
        minor: .9,
        average: .85,
        major: .80,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.uptimeSuggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => suggest(<>Try and cast <SpellLink id={SPELLS.SHIELD_SLAM.id} />'s during <SpellLink id={SPELLS.SHIELD_BLOCK.id} /> to increase the uptime of <SpellLink id={SPELLS.SHIELD_BLOCK.id} /> and the damage of <SpellLink id={SPELLS.SHIELD_SLAM.id} />.</>)
            .icon(SPELLS.HEAVY_REPERCUSSIONS_TALENT.icon)
            .actual(`${formatPercentage(actual)}% cast during Shield Block`)
            .recommended(`${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    const sbExtendedMS = this.sbExtended * HEAVY_REPERCUSSIONS_SHIELD_BLOCK_EXTEND_MS;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HEAVY_REPERCUSSIONS_TALENT.id} />}
        value={`${formatPercentage(sbExtendedMS / (this.shieldBlockuptime - sbExtendedMS))}%`}
        label="more Shield Block uptime"
        tooltip={(
          <>
            You casted Shield Slam {this.sbExtended} times during Shield Block, resulting in additional {sbExtendedMS / 1000}sec uptime.<br />
            {formatNumber(this.bonusDmg)} damage ({formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))}%) contributed by casting Shield Slams during Shield Block.
          </>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default HeavyRepercussions;
