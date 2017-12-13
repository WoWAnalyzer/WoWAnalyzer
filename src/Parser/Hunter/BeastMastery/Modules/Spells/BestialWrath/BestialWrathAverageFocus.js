import React from 'react';

import SPELLS from 'common/SPELLS/index';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox from "Main/StatisticBox";
import SpellIcon from "common/SpellIcon";
import { formatNumber } from "common/format";
import SpellLink from "common/SpellLink";

class BestialWrathAverageFocus extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  bestialWrathCasts = 0;
  accumulatedFocusAtBWCast = 0;

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
        value={formatNumber(averageFocusAtBW)}
        label={`Average Focus on cast`}
        tooltip={`You started your average Bestial Wrath window with ${averageFocusAtBW} focus.`}
      />
    );
  }
  suggestions(when) {
    const averageFocusAtBW = formatNumber(this.accumulatedFocusAtBWCast / this.bestialWrathCasts);
    when(averageFocusAtBW).isLessThan(90)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You started your average <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> at {averageFocusAtBW} focus, try and pool a bit more before casting <SpellLink id={SPELLS.BESTIAL_WRATH.id} />. This can be achieved by not casting abilities a few moments before <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> comes off cooldown.</span>)
          .icon(SPELLS.BESTIAL_WRATH.icon)
          .actual(`Average of ${averageFocusAtBW} focus at start of Bestial Wrath`)
          .recommended(`>${recommended} focus is recommended`)
          .regular(recommended - 5)
          .major(recommended - 10);
      });
  }
}

export default BestialWrathAverageFocus;
