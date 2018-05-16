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
  ssBuffRefreshed = 0;
  nextShieldSlamBuffed = false;
  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.HEAVY_REPERCUSSIONS_TALENT.id);
  }

  get shieldBlockuptime() {
    return this.combatants.getBuffUptime(SPELLS.SHIELD_BLOCK_BUFF.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.SHIELD_SLAM.id || !this.nextShieldSlamBuffed ) {
      return;
    }

    this.bonusDmg += calculateEffectiveDamage(event, HEAVY_REPERCUSSIONS_SHIELD_SLAM_DAMAGE_BUFF);
    this.nextShieldSlamBuffed = false;
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.SHIELD_BLOCK.id && this.nextShieldSlamBuffed) {
      this.ssBuffRefreshed += 1;
      return;
    }

    if (event.ability.guid === SPELLS.SHIELD_BLOCK.id) {
      this.nextShieldSlamBuffed = true;
      return;
    }

    if (event.ability.guid !== SPELLS.SHIELD_SLAM.id || !this.combatants.selected.hasBuff(SPELLS.SHIELD_BLOCK_BUFF.id)) {
      return;
    }

    this.sbExtended += 1;
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.ssBuffRefreshed,
      isGreaterThan: {
        minor: 0,
        average: 4,
        major: 8,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.uptimeSuggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<React.Fragment>You refreshed <SpellLink id={SPELLS.HEAVY_REPERCUSSIONS_TALENT.id} />'s damage buff for <SpellLink id={SPELLS.SHIELD_SLAM.id} /> {actual} times. Make sure to weave <SpellLink id={SPELLS.SHIELD_SLAM.id} />'s between your <SpellLink id={SPELLS.SHIELD_BLOCK.id} /> casts to maximize your damage.</React.Fragment>)
            .icon(SPELLS.HEAVY_REPERCUSSIONS_TALENT.icon)
            .actual(`${actual} times refreshed`)
            .recommended(`${recommended} recommended`);
        });
  }

  statistic() {
    const sbExtendedMS = this.sbExtended * HEAVY_REPERCUSSIONS_SHIELD_BLOCK_EXTEND_MS;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HEAVY_REPERCUSSIONS_TALENT.id} />}
        value={`${formatPercentage(sbExtendedMS / (this.shieldBlockuptime - sbExtendedMS))}%`}
        label={`more Shield Block uptime`}
        tooltip={`
          You casted Shield Slam ${this.sbExtended} times during Shield Block, resulting in additional ${sbExtendedMS / 1000}sec uptime.<br/>
          ${formatNumber(this.bonusDmg)} damage contributed by casting buffed Shield Slams<br/>
          ${this.ssBuffRefreshed > 0 ? `You casted Shield Block ${this.ssBuffRefreshed} times while having the damage bonus for Shield Block already up.` : ``}
        `}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default HeavyRepercussions;
