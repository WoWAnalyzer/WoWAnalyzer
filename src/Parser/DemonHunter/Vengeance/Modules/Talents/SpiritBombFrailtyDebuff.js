import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS/index';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage, formatThousands, formatDuration } from 'common/format';

import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';

class SpiritBombFrailtyDebuff extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    enemies: Enemies,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SPIRIT_BOMB_TALENT.id);
  }

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.FRAILTY_SPIRIT_BOMB_DEBUFF.id) / this.owner.fightDuration;
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.90,
        average: 0.85,
        major: .80,
      },
      style: 'percentage',
    };
  }
  suggestions(when) {
    when(this.uptimeSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>Your <SpellLink id={SPELLS.FRAILTY_SPIRIT_BOMB_DEBUFF.id} /> uptime can be improved. This is easy to maintain and an important source of healing.</React.Fragment>)
          .icon(SPELLS.FRAILTY_SPIRIT_BOMB_DEBUFF.icon)
          .actual(`${formatPercentage(actual)}% Frailty uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {
    const spiritBombUptime = this.enemies.getBuffUptime(SPELLS.FRAILTY_SPIRIT_BOMB_DEBUFF.id);
    const spiritBombDamage = this.abilityTracker.getAbility(SPELLS.SPIRIT_BOMB_DAMAGE.id).damageEffective;

    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(5)}
        icon={<SpellIcon id={SPELLS.SPIRIT_BOMB_TALENT.id} />}
        value={`${formatPercentage(this.uptime)}%`}
        label="Spirit Bomb debuff uptime"
        tooltip={`Total damage was ${formatThousands(spiritBombDamage)}.<br/>
                  Total uptime was ${formatDuration(spiritBombUptime / 1000)}.`}
      />
    );
  }
}

export default SpiritBombFrailtyDebuff;
