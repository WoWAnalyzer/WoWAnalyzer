import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class BoneShieldUptime extends Analyzer {

  static dependencies = {
    combatants: Combatants,
  };

  get uptime() {
    return this.combatants.selected.getBuffUptime(SPELLS.BONE_SHIELD.id) / this.owner.fightDuration;
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.94,
        average: 0.84,
        major: .74,
      },
      style: 'percentage',
    };
  }


  statistic() {

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.BONE_SHIELD.id} />}
        value={`${formatPercentage(this.uptime)}%`}
        label="Bone Shield Uptime"
        tooltip="Important to maintain. Provides damage reduction and haste buff while you have at least one charge."
      />

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default BoneShieldUptime;
