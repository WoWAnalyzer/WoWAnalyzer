import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const BUFF_TOTEM_RESONANCE_SPELL_ID = 202188;
const BUFF_TOTEM_EMBER_SPELL_ID = 210657;
const BUFF_TOTEM_TAILWIND_SPELL_ID = 210660;

class TotemMastery extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  casts = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.TOTEM_MASTERY_TALENT.id);
  }

  get minUptime() {
    return Math.min(
      this.combatants.selected.getBuffUptime(BUFF_TOTEM_RESONANCE_SPELL_ID),
      this.combatants.selected.getBuffUptime(BUFF_TOTEM_EMBER_SPELL_ID),
      this.combatants.selected.getBuffUptime(BUFF_TOTEM_TAILWIND_SPELL_ID)
    ) / this.owner.fightDuration;
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.TOTEM_MASTERY_TALENT.id) {
      this.casts += 1;
    }
  }

  suggestions(when) {
    when(this.minUptime).isLessThan(0.99)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.TOTEM_MASTERY_TALENT.id} /> uptime can be improved. Try to place the totems better.</span>)
          .icon(SPELLS.TOTEM_MASTERY_TALENT.icon)
          .actual(`${formatPercentage(actual)}% uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(recommended - 0.05).major(recommended - 0.15);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.TOTEM_MASTERY_TALENT.id} />}
        value={`${formatPercentage(this.minUptime)} %`}
        label="Uptime"
        tooltip={`With ${this.casts} infight cast${this.casts > 1 ? 's' : ''}.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default TotemMastery;
