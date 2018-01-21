import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import ElementalFocus from './ElementalFocus';

class FlameShock extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    elementalFocus: ElementalFocus,
  };

  maelstromSpend = [];

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.FLAME_SHOCK.id) / this.owner.fightDuration;
  }

  get elementalFocusCasts() {
    return this.elementalFocus.spellsCast[SPELLS.FLAME_SHOCK.id] || {buffed: 0, unbuffed: 0, total: 0};
  }

  get avgMalestromSpend() {
    let spend = this.maelstromSpend.reduce((prev, cur) => {
      return prev + cur;
    }, 0);
    spend /= this.maelstromSpend.length || 1;
    return spend;
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.FLAME_SHOCK.id) {
      const resource = event.classResources[0];
      if (resource.type === RESOURCE_TYPES.MAELSTROM.id) {
        const amount = resource.amount;
        const spend = (amount < 20 ? amount : 20);
        this.maelstromSpend.push(spend);
      }
    }
  }

  suggestions(when) {
    const flameShockCasts = this.elementalFocusCasts;
    when(flameShockCasts.unbuffed).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Try to cast <SpellLink id={SPELLS.FLAME_SHOCK.id}/> when you have <SpellLink id={SPELLS.ELEMENTAL_FOCUS.id}/>.</span>)
          .icon(SPELLS.ELEMENTAL_FOCUS.icon)
          .actual(`${flameShockCasts.unbuffed} of ${flameShockCasts.total} spell casts where not buffed.`)
          .recommended(`${recommended} is recommended`)
          .regular(recommended + 1).major(recommended + 2);
      });
    // TODO: suggest better Maelstrom Usage
    when(this.uptime).isLessThan(0.99)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.FLAME_SHOCK.id} /> uptime can be improved.</span>)
          .icon(SPELLS.FLAME_SHOCK.icon)
          .actual(`${formatPercentage(actual)}% uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(recommended - 0.05).major(recommended - 0.15);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.FLAME_SHOCK.id} />}
        value={`${formatPercentage(this.uptime)} %`}
        label="Uptime"
        tooltip = {
          `With an average of ${this.avgMalestromSpend} Maelstrom spend and ${this.elementalFocusCasts.buffed} / ${this.elementalFocusCasts.total} casts with Elemental Focus.`
        }
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default FlameShock;
