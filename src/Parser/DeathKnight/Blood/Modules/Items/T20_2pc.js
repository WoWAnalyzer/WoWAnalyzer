import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

class T20_2pc extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  get uptime() {
    return this.combatants.getBuffUptime(SPELLS.GRAVEWARDEN.id) / this.owner.fightDuration;
  }

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.BLOOD_DEATH_KNIGHT_T20_2SET_BONUS_BUFF.id);
  }

  item() {
    return {
      id: `spell-${SPELLS.BLOOD_DEATH_KNIGHT_T20_2SET_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.BLOOD_DEATH_KNIGHT_T20_2SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.BLOOD_DEATH_KNIGHT_T20_2SET_BONUS_BUFF.id} icon={false} />,
      result: <span><SpellLink id={SPELLS.BLOOD_DEATH_KNIGHT_T20_2SET_BONUS_BUFF.id}>Gravewarden</SpellLink> {formatPercentage((this.uptime) || 0)} % uptime</span>,
    };
  }
  suggestions(when) {
    when(this.uptime).isLessThan(0.90)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span><SpellLink id={SPELLS.BLOOD_DEATH_KNIGHT_T20_2SET_BONUS_BUFF.id}> Gravewarden </SpellLink> happens when you hit an enemy with <SpellLink id={SPELLS.BLOOD_BOIL.id}/>.  Uptime may be lower when there are no enemies in range, like Kil'jaeden's intermissions.</span>)
          .icon(SPELLS.GRAVEWARDEN.icon)
          .actual(`${formatPercentage(actual)}% Gravewarden uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(recommended - 0.05).major(recommended - 0.1);
      });
  }

}

export default T20_2pc;
