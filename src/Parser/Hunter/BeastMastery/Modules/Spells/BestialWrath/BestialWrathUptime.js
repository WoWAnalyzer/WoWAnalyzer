import React from 'react';

import SPELLS from 'common/SPELLS/index';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox from "Main/StatisticBox";
import SpellIcon from "common/SpellIcon";
import { formatPercentage, formatNumber } from "common/format";
import Icon from "common/Icon";
import SpellLink from "../../../../../../common/SpellLink";

class BestialWrathUptime extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  bestialWrathCasts = 0;
  accumulatedFocusAtBWCast = 0;

  get percentUptime() {
    //This calculates the uptime over the course of the encounter of Bestial Wrath
    const uptime = this.combatants.selected.getBuffUptime(SPELLS.BESTIAL_WRATH.id) / this.owner.fightDuration;
    return uptime;
  }

  on_byPlayer_cast(event) {
    const buffId = event.ability.guid;
    if (buffId !== SPELLS.BESTIAL_WRATH.id) {
      return;
    }
    this.bestialWrathCasts += 1;
    this.accumulatedFocusAtBWCast += event.classResources[0]['amount'] || 0;
  }
  statistic() {
    const averageFocusAtBW = formatNumber(this.accumulatedFocusAtBWCast / this.bestialWrathCasts);
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.BESTIAL_WRATH.id} />}
        value={(
          <span>
          {formatPercentage(this.percentUptime)}{`%`}
            <br/>
            {averageFocusAtBW}{'  '}
            <Icon
              icon='ability_hunter_focusfire'
              alt='Average Focus At Trueshot Cast'
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            />
          </span>
        )}
        label={`Bestial Wrath information`}
        tooltip={`You started your average Bestial Wrath window with ${averageFocusAtBW} focus, and you had an overall uptime of ${formatPercentage(this.percentUptime)}% on Bestial Wrath.`}
      />
    );
  }
  suggestions(when) {
    const averageFocusAtBW = formatNumber(this.accumulatedFocusAtBWCast / this.bestialWrathCasts);
    when(averageFocusAtBW).isLessThan(90)
      .addSuggestion((suggest, actual, recommended) => {
      return suggest(<span>You started your average <SpellLink id={SPELLS.BESTIAL_WRATH.id}/> at {averageFocusAtBW} focus, try and pool a bit more before casting <SpellLink id={SPELLS.BESTIAL_WRATH.id}/>. This can be achieved by not casting abilities a few moments before <SpellLink id={SPELLS.BESTIAL_WRATH.id}/> comes off cooldown.</span>)
        .icon(SPELLS.BESTIAL_WRATH.icon)
        .actual(`Average of ${averageFocusAtBW} focus at start of Bestial Wrath`)
        .recommended(`>${recommended} focus is recommended`)
        .regular(recommended-5)
        .major(recommended-10);
      });
  }
}

export default BestialWrathUptime;
