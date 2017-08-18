import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import Enemies from 'Parser/Core/Modules/Enemies';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const debug = true;

class SiphonLifeUptime extends Module {
  static dependencies = {
    enemies: Enemies,
  };
  on_initialized() {
    if(!this.owner.error){
      this.active = this.owner.selectedCombatant.hasTalent(SPELLS.SIPHON_LIFE_TALENT.id);
    }
  }
  suggestions(when){
    const siphonLifeUptime = this.enemies.getBuffUptime(SPELLS.SIPHON_LIFE.id) / this.owner.fightDuration;
    //actual = value in when()
    //recommended = value in isLessThan()
    when(siphonLifeUptime).isLessThan(0.85)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Your Siphon Life uptime can be improved. Try to pay more attention to your Siphon Life on the boss, perhaps use some debuff tracker.')
          .icon(SPELLS.SIPHON_LIFE.icon)
          .actual(`${formatPercentage(actual)}% Siphon Life uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(recommended - 0.05).major(recommended - 0.15);
      });
  }
  statistic() {
    const siphonLifeUptime = this.enemies.getBuffUptime(SPELLS.SIPHON_LIFE.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SIPHON_LIFE.id} />}
        value={`${formatPercentage(siphonLifeUptime)} %`}
        label='Siphon Life uptime'
        tooltip={`Siphon Life uptime is how much of time of the fight you have Siphon Life active on the boss. You should try to keep the uptime as close to 100% as possible.`}
      />
    );
  }
}

export default SiphonLifeUptime;
