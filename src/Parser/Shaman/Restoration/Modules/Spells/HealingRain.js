import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
// dependencies
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';

// 50 was too low, 100 was too high
// had no issues with 85ms
const BUFFER_MS = 85;

class HealingRain extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  healingRainTicks = [];

  get averageHitsPerTick() {
    const totalHits = this.healingRainTicks.reduce((total, tick) => total + tick.hits, 0);
    return totalHits / this.healingRainTicks.length;
  }

  suggestions(when) {
    const suggestionThreshold = this.suggestionThreshold;
    when(suggestionThreshold.actual).isLessThan(suggestionThreshold.isLessThan.minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Try to always cast <SpellLink id={SPELLS.HEALING_RAIN_CAST.id} /> in areas where players stack. This allows the spell to consitantly hit all 6 possible targets.</span>)
          .icon(SPELLS.HEALING_RAIN_CAST.icon)
          .actual(`${suggestionThreshold.actual.toFixed(2)} average targets healed`)
          .recommended(`${suggestionThreshold.isLessThan.minor} average targets healed`)
          .regular(suggestionThreshold.isLessThan.average).major(suggestionThreshold.isLessThan.average);
      });
  }

  get suggestionThreshold() {
    return {
      actual: this.averageHitsPerTick,
      isLessThan: {
        minor: 5,
        average: 3,
        major: 2,
      },
      style: 'number',
    };
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HEALING_RAIN_HEAL.id) {
      return;
    }

    const healingRainTick = this.healingRainTicks.find(tick => event.timestamp - BUFFER_MS <= tick.timestamp);
    if (!healingRainTick) {
      this.healingRainTicks.push({
        timestamp: event.timestamp,
        hits: 1,
      });
    } else {
      healingRainTick.hits = healingRainTick.hits + 1;
    }
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HEALING_RAIN_HEAL.id} />}
        value={`${this.averageHitsPerTick.toFixed(2)}`}
        label={(
          <dfn data-tip="The average number of targets healed by Healing Rain out of the maximum amount of 6 targets.">
            Average Healing Rain Targets
          </dfn>
        )}
      />
    );
    //
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default HealingRain;
