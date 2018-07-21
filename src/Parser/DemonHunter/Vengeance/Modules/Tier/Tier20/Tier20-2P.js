import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage, formatDuration } from 'common/format';

import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';

class Tier202PBonus extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasBuff(SPELLS.VENG_DH_T20_2P_BONUS.id);
  }

  suggestions(when) {
    const tormentedPercentage = this.enemies.getBuffUptime(SPELLS.VENG_DH_T20_2P_BONUS_BUFF.id) / this.owner.fightDuration;

    when(tormentedPercentage).isLessThan(0.85)
    .addSuggestion((suggest, actual, recommended) => {
      return suggest(<React.Fragment>Try to consume <SpellLink id={SPELLS.SOUL_FRAGMENT.id} /> more often. This is a great damage reduction by applying <SpellLink id={SPELLS.VENG_DH_T20_2P_BONUS_BUFF.id} /> debuff. Try to refresh it even if you have just one <SpellLink id={SPELLS.SOUL_FRAGMENT.id} /> available.</React.Fragment>)
        .icon('ability_demonhunter_vengefulretreat2')
        .actual(`${formatPercentage(tormentedPercentage)}% debuff total uptime.`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`)
        .regular(recommended - 0.05)
        .major(recommended - 0.15);
    });
  }

  statistic() {
    const tormented = this.enemies.getBuffUptime(SPELLS.VENG_DH_T20_2P_BONUS_BUFF.id);

    const tormentedPercentage = tormented / this.owner.fightDuration;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.VENG_DH_T20_2P_BONUS_BUFF.id} />}
        value={`${formatPercentage(tormentedPercentage)}%`}
        label="Tormented debuff Uptime"
        tooltip={`The Tormented total uptime was ${formatDuration(tormented / 1000)}.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(11);
}

export default Tier202PBonus;
