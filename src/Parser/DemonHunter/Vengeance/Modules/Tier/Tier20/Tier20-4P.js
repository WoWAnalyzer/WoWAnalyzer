import React from 'react';

import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Analyzer from 'Parser/Core/Analyzer';

import { formatPercentage, formatDuration } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class Tier204PBonus extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.VENG_DH_T20_4P_BONUS.id);
  }

  suggestions(when) {
    const sigilOfVersatilityPercentage = this.combatants.selected.getBuffUptime(SPELLS.VENG_DH_T20_4P_BONUS_BUFF.id) / this.owner.fightDuration;

    when(sigilOfVersatilityPercentage).isLessThan(0.90)
    .addSuggestion((suggest, actual, recommended) => {
      return suggest(<React.Fragment>Try to cast <SpellLink id={SPELLS.SOUL_CLEAVE.id} /> more often. This increases your versatility by applying <SpellLink id={SPELLS.VENG_DH_T20_4P_BONUS_BUFF.id} /> buff. Try to refresh it even if you have just 25 pain available.</React.Fragment>)
        .icon('spell_warlock_soulburn')
        .actual(`${formatPercentage(sigilOfVersatilityPercentage)}% buff total uptime.`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`)
        .regular(recommended - 0.05)
        .major(recommended - 0.15);
    });
  }

  statistic() {
    const sigilOfVersatility = this.combatants.selected.getBuffUptime(SPELLS.VENG_DH_T20_4P_BONUS_BUFF.id);

    const sigilOfVersatilityPercentage = sigilOfVersatility / this.owner.fightDuration;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.VENG_DH_T20_4P_BONUS_BUFF.id} />}
        value={`${formatPercentage(sigilOfVersatilityPercentage)}%`}
        label="Sigil of Versatility buff Uptime"
        tooltip={`The Sigil of Versatility total uptime was ${formatDuration(sigilOfVersatility / 1000)}.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(12);
}

export default Tier204PBonus;
