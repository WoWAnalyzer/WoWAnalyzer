import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage, formatThousands } from 'common/format';

import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

class Doom extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DOOM_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DOOM_TALENT), this.handleDoomDamage);
  }

  handleDoomDamage(event) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.DOOM_TALENT.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<>Your <SpellLink id={SPELLS.DOOM_TALENT.id} /> uptime can be improved. Try to pay more attention to your Doom on the boss, as it is one of your Soul Shard generators.</>)
          .icon(SPELLS.DOOM_TALENT.icon)
          .actual(`${formatPercentage(actual)}% Doom uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`);
      });
  }

  subStatistic() {
    return (
      <>
        <StatisticListBoxItem
          title={<><SpellLink id={SPELLS.DOOM_TALENT.id} /> dmg</>}
          value={this.owner.formatItemDamageDone(this.damage)}
          valueTooltip={`${formatThousands(this.damage)} damage`}
        />
        <StatisticListBoxItem
          title={<><SpellLink id={SPELLS.DOOM_TALENT.id} /> uptime</>}
          value={`${formatPercentage(this.uptime)} %`}
        />
      </>
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default Doom;
