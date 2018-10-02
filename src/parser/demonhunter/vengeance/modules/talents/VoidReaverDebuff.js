import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import Enemies from 'parser/core/modules/Enemies';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';

class VoidReaverDebuff extends Analyzer {
//WCL: https://www.warcraftlogs.com/reports/LaMfJFHk2dY98gTj/#fight=20&type=auras&spells=debuffs&hostility=1&ability=268178
  static dependencies = {
    enemies: Enemies,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.VOID_REAVER_TALENT.id);
  }

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.VOID_REAVER_DEBUFF.id) / this.owner.fightDuration;
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.90,
        average: 0.80,
        major: .70,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.uptimeSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>Your <SpellLink id={SPELLS.VOID_REAVER_DEBUFF.id} /> uptime can be improved.</React.Fragment>)
          .icon(SPELLS.VOID_REAVER_TALENT.icon)
          .actual(`${formatPercentage(actual)}% Void Reaver uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(5)}
        icon={<SpellIcon id={SPELLS.VOID_REAVER_TALENT.id} />}
        value={`${formatPercentage(this.uptime)} %`}
        label="Void Reaver uptime"
      />
    );
  }
}

export default VoidReaverDebuff;
