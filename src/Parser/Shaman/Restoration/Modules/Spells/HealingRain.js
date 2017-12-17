import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
// dependencies
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';

class HealingRain extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  }

  HealingRainTicks = [];

  get averageHitsPerTick(){
    let totalHits = 0;
    this.HealingRainTicks.forEach(x=>totalHits=totalHits+x.hits);
    return totalHits/this.HealingRainTicks.length;
  }

  suggestions(when) {
    when(this.suggestionThreshold.actual).isLessThan(this.suggestionThreshold.isLessThan.minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Try to always cast <SpellLink id={SPELLS.HEALING_RAIN_CAST.id} /> in areas where players stack. This allows the spell to consitantly hit all 6 possible targets.</span>)
          .icon(SPELLS.HEALING_RAIN_CAST.icon)
          .actual(`${this.suggestionThreshold.actual.actual.toFixed(2)} average targets healed`)
          .recommended(`${this.suggestionThreshold.actual.isLessThan.minor} average targets healed`)
          .regular(this.suggestionThreshold.isLessThan.average).major(this.suggestionThreshold.isLessThan.average);
      });
  }

  get suggestionThreshold(){
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
      if(spellId === SPELLS.HEALING_RAIN_HEAL.id){
        const healingRainTick = this.HealingRainTicks.filter(x=>x.id=== event.timestamp);
        if(healingRainTick.length > 0){
          healingRainTick[0].hits= healingRainTick[0].hits+1;
        }
        else{
          this.HealingRainTicks.push({
            id: event.timestamp,
            hits: 1,
          });
        }
      }
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HEALING_RAIN_HEAL.id} />}
        value={`${this.averageHitsPerTick.toFixed(2)}`}
        label={(
          <dfn data-tip={`The average number of targets healed by Healing Rain out of the maximum amount of 6 targets.`}>
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
