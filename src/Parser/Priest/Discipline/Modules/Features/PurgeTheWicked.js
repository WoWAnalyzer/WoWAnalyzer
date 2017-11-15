import React from 'react';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';

import SuggestionThresholds from '../../SuggestionThresholds';

class PurgeTheWicked extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  dotSpell;

  on_initialized() {
    if(this.owner.modules.combatants.selected.hasTalent(SPELLS.PURGE_THE_WICKED_TALENT.id)) {
      this.dotSpell = SPELLS.PURGE_THE_WICKED_BUFF;
    } else {
      this.dotSpell = SPELLS.SHADOW_WORD_PAIN;
    }
  }

  get uptime() {
    return this.enemies.getBuffUptime(this.dotSpell.id) / this.owner.fightDuration;
  }

  suggestions(when) {
    const uptime = this.uptime || 0;

    when(uptime).isLessThan(SuggestionThresholds.PURGE_THE_WICKED_UPTIME.minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={this.dotSpell.id} /> uptime can be improved.</span>)
          .icon(this.dotSpell.icon)
          .actual(`${formatPercentage(uptime)}% uptime`)
          .recommended(`>${Math.round(formatPercentage(recommended))}% is recommended`)
          .regular(SuggestionThresholds.PURGE_THE_WICKED_UPTIME.regular).major(SuggestionThresholds.PURGE_THE_WICKED_UPTIME.major);
      });
  }

  statistic() {
    const uptime = this.uptime || 0;

    return (
      <StatisticBox
        icon={<SpellIcon id={this.dotSpell.id} />}
        value={`${formatPercentage(uptime)} %`}
        label={`${this.dotSpell.name} Uptime`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(10);

}

export default PurgeTheWicked;
