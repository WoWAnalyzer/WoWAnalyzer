import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';

import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';
import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class StellarEmpowermentUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.SOUL_OF_THE_FOREST_TALENT_BALANCE.id) ||
      this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_ARCHDRUID.id);
  }

  get suggestionThresholds() {
    const stellarEmpowermentUptime = this.enemies.getBuffUptime(SPELLS.STELLAR_EMPOWERMENT.id) / this.owner.fightDuration;
    return {
      actual: stellarEmpowermentUptime,
      isLessThan: {
        minor: 0.9,
        average: 0.8,
        major: 0.7,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>Your <SpellLink id={SPELLS.STELLAR_EMPOWERMENT.id} /> uptime can be improved. It is recommended to keep it up even on a single target when using <SpellLink id={SPELLS.SOUL_OF_THE_FOREST_TALENT_BALANCE.id} /> or <ItemLink id={ITEMS.SOUL_OF_THE_ARCHDRUID.id} />.</Wrapper>)
        .icon(SPELLS.STELLAR_EMPOWERMENT.icon)
        .actual(`${formatPercentage(actual)}% Stellar Empowerment uptime`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
  }

  statistic() {
    const stellarEmpowermentUptime = this.enemies.getBuffUptime(SPELLS.STELLAR_EMPOWERMENT.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.STELLAR_EMPOWERMENT.id} />}
        value={`${formatPercentage(stellarEmpowermentUptime)} %`}
        label="Stellar Empowerment uptime"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default StellarEmpowermentUptime;