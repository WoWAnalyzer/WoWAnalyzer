import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

class MoonfireUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.LUNAR_INSPIRATION_TALENT.id);
  }

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.MOONFIRE_FERAL.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.90,
        major: 0.80,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <>
          Your <SpellLink id={SPELLS.MOONFIRE_FERAL.id} /> uptime can be improved. You should refresh the DoT once it has reached its <dfn data-tip={`The last 30% of the DoT's duration. When you refresh during this time you don't lose any duration in the process.`}>pandemic window</dfn>, don't wait for it to wear off. If you're finding keeping track of all the DoTs a challenge you might want to switch talents to <SpellLink id={SPELLS.BLOOD_SCENT_TALENT.id} /> until you've had more practice.
        </>
      )
        .icon(SPELLS.MOONFIRE_FERAL.icon)
        .actual(`${formatPercentage(actual)}% uptime`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
  }

  statistic() {
    const moonfireUptime = this.enemies.getBuffUptime(SPELLS.MOONFIRE_FERAL.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.MOONFIRE_BEAR.id} />}
        value={`${formatPercentage(moonfireUptime)} %`}
        label="Moonfire uptime"
        position={STATISTIC_ORDER.OPTIONAL(2)}
      />
    );
  }
}

export default MoonfireUptime;
