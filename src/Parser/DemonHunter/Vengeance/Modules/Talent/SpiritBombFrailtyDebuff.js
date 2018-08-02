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

  suggestions(when) {
    const spiritBombUptimePercentage = this.enemies.getBuffUptime(SPELLS.FRAILTY_SPIRIT_BOMB_DEBUFF.id) / this.owner.fightDuration;

    when(spiritBombUptimePercentage).isLessThan(0.90)
    .addSuggestion((suggest, actual, recommended) => {
      return suggest(<React.Fragment>Try to cast <SpellLink id={SPELLS.SPIRIT_BOMB_TALENT.id} /> more often. This is your core healing ability by applying <SpellLink id={SPELLS.FRAILTY_SPIRIT_BOMB_DEBUFF.id} /> debuff. Try to refresh it even if you have just one <SpellLink id={SPELLS.SOUL_FRAGMENT.id} /> available.</React.Fragment>)
        .icon('inv_icon_shadowcouncilorb_purple')
        .actual(`${formatPercentage(spiritBombUptimePercentage)}% debuff total uptime.`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`)
        .regular(recommended - 0.05)
        .major(recommended - 0.15);
    });
  }

  statistic() {
    const spiritBombUptime = this.enemies.getBuffUptime(SPELLS.FRAILTY_SPIRIT_BOMB_DEBUFF.id);

    const spiritBombUptimePercentage = spiritBombUptime / this.owner.fightDuration;

    const spiritBombDamage = this.abilityTracker.getAbility(SPELLS.SPIRIT_BOMB_DAMAGE.id).damageEffective;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SPIRIT_BOMB_TALENT.id} />}
        value={`${formatPercentage(spiritBombUptimePercentage)}%`}
        label="Spirit Bomb debuff uptime"
        tooltip={`Total damage was ${formatThousands(spiritBombDamage)}.<br/>
                  Total uptime was ${formatDuration(spiritBombUptime / 1000)}.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default SpiritBombFrailtyDebuff;
