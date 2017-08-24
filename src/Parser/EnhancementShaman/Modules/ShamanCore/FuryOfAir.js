import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class FuryOfAir extends Module {
  furyUptime = 0;
  maelstromUsed = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasTalent(SPELLS.FURY_OF_AIR_TALENT.id);
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    console.log("on_byPlayer_applybuff");
    console.log(event);
    if (spellId === SPELLS.FURY_OF_AIR.id) {
      console.log(event);
      this.maelstromUsed += 3;
    }
  }

  suggestions(when) {
    const furyofairUptime = this.owner.selectedCombatant.getBuffUptime(SPELLS.FURY_OF_AIR.id) / this.owner.fightDuration;

    this.active &&
    when(furyofairUptime).isLessThan(.95)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(`Try to make sure the Fury of Air is always up, when it drops you should refresh it as soon as possible`)
          .icon(SPELLS.FURY_OF_AIR.icon)
          .actual(`${formatPercentage(furyofairUptime)}% uptime`)
          .recommended(`${(formatPercentage(recommended))}% is recommended`)
          .regular(recommended).major(recommended - 0.5);
      });
  }

  statistic() {
    const furyofairUptime = this.owner.selectedCombatant.getBuffUptime(SPELLS.FURY_OF_AIR.id) / this.owner.fightDuration;
    return (
      this.active && (<StatisticBox
        icon={<SpellIcon id={SPELLS.FURY_OF_AIR.id} />}
        value={`${formatPercentage(furyofairUptime)} %`}
        label="Fury of Air Uptime"
        tooltip={`One of your highest priorities, get as close to 100% as possible`}
      />)
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(6);
}

export default FuryOfAir;
