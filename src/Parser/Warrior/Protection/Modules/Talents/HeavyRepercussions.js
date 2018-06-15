import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import Enemies from 'Parser/Core/Modules/Enemies';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import { formatNumber, formatPercentage } from 'common/format';

const HEAVY_REPERCUSSIONS_SHIELD_BLOCK_EXTEND_MS = 1000;
const HEAVY_REPERCUSSIONS_SHIELD_SLAM_DAMAGE_BUFF = 0.3;

class HeavyRepercussions extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
  };

  sbExtended = 0;
  sbCasts = 0;
  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.HEAVY_REPERCUSSIONS_TALENT.id);
  }

  get shieldBlockuptime() {
    return this.combatants.getBuffUptime(SPELLS.SHIELD_BLOCK_BUFF.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.SHIELD_SLAM.id || !this.combatants.selected.hasBuff(SPELLS.SHIELD_BLOCK_BUFF.id)) {
      return;
    }

    this.bonusDmg += calculateEffectiveDamage(event, HEAVY_REPERCUSSIONS_SHIELD_SLAM_DAMAGE_BUFF);
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.SHIELD_SLAM.id) {
      return;
    }

    this.sbCasts += 1;

    if (!this.combatants.selected.hasBuff(SPELLS.SHIELD_BLOCK_BUFF.id)) {
      return;
    }

    this.sbExtended += 1;
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.sbExtended / this.sbCasts,
      isLessThan: {
        minor: 1,
        average: .95,
        major: .85,
      },
      style: 'percent',
    };
  }

  suggestions(when) {
    when(this.uptimeSuggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<React.Fragment>Try and cast <SpellLink id={SPELLS.SHIELD_SLAM.id} />'s during <SpellLink id={SPELLS.SHIELD_BLOCK.id} /> to increase the uptime of <SpellLink id={SPELLS.SHIELD_BLOCK.id} /> and the damage of <SpellLink id={SPELLS.SHIELD_SLAM.id} />.</React.Fragment>)
            .icon(SPELLS.HEAVY_REPERCUSSIONS_TALENT.icon)
            .actual(`${formatPercentage(actual)}% cast during Shield Block`)
            .recommended(`${formatPercentage(recommended)}% is recommended`);
        });
  }

  statistic() {
    const sbExtendedMS = this.sbExtended * HEAVY_REPERCUSSIONS_SHIELD_BLOCK_EXTEND_MS;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HEAVY_REPERCUSSIONS_TALENT.id} />}
        value={`${formatPercentage(sbExtendedMS / (this.shieldBlockuptime - sbExtendedMS))}%`}
        label="more Shield Block uptime"
        tooltip={`
          You casted Shield Slam ${this.sbExtended} times during Shield Block, resulting in additional ${sbExtendedMS / 1000}sec uptime.<br/>
          ${formatNumber(this.bonusDmg)} damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))}%) contributed by casting Shield Slams during Shield Block.
        `}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default HeavyRepercussions;
