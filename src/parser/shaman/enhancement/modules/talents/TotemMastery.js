import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'parser/core/Analyzer';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

const BUFF_TOTEM_RESONANCE_SPELL_ID = 262419;
const BUFF_TOTEM_EMBER_SPELL_ID = 262398;
const BUFF_TOTEM_TAILWIND_SPELL_ID = 262401;

class TotemMastery extends Analyzer {
  casts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.TOTEM_MASTERY_TALENT_ELEMENTAL.id);
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.minUptime,
      isLessThan: {
        minor: 0.99,
        average: 0.94,
        major: 0.85,
      },
      style: 'percentage',
    };
  }

  get minUptime() {
    return Math.min(
      this.selectedCombatant.getBuffUptime(BUFF_TOTEM_RESONANCE_SPELL_ID),
      this.selectedCombatant.getBuffUptime(BUFF_TOTEM_EMBER_SPELL_ID),
      this.selectedCombatant.getBuffUptime(BUFF_TOTEM_TAILWIND_SPELL_ID)
    ) / this.owner.fightDuration;
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.TOTEM_MASTERY_TALENT_ENHANCEMENT.id) {
      this.casts += 1;
    }
  }

  suggestions(when) {
    when(this.uptimeSuggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<span>Your <SpellLink id={SPELLS.TOTEM_MASTERY_TALENT_ENHANCEMENT.id} /> uptime can be improved. Try to place the totems better.</span>)
        .icon(SPELLS.TOTEM_MASTERY_TALENT_ENHANCEMENT.icon)
        .actual(`${formatPercentage(actual)}% uptime`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.TOTEM_MASTERY_TALENT_ENHANCEMENT.id} />}
        value={`${formatPercentage(this.minUptime)} %`}
        label="Uptime"
        tooltip={`With ${this.casts} infight cast${this.casts > 1 ? 's' : ''}.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default TotemMastery;
