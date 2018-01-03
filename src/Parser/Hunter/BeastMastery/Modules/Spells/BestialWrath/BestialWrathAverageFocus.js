import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox from "Main/StatisticBox";
import SpellIcon from "common/SpellIcon";
import { formatNumber } from "common/format";
import SpellLink from "common/SpellLink";
import STATISTIC_ORDER from 'Main/STATISTIC_ORDER';
import Wrapper from 'common/Wrapper';

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
  statisticOrder = STATISTIC_ORDER.CORE(9);

  get averageFocusAtBestialWrathCast() {
    return formatNumber(this.accumulatedFocusAtBWCast / this.bestialWrathCasts);
  }
  get focusOnBestialWrathCastThreshold() {
    if (this.combatants.selected.hasTalent(SPELLS.KILLER_COBRA_TALENT.id)) {
      return {
        actual: this.averageFocusAtBestialWrathCast,
        isLessThan: {
          minor: 95,
          average: 85,
          major: 75,
        },
        style: 'number',
      };
    }
    else {
      return {
        actual: this.averageFocusAtBestialWrathCast,
        isLessThan: {
          minor: 85,
          average: 75,
          major: 65,
        },
        style: 'number',
      };
    }
  }

  suggestions(when) {
    const {
      isLessThan: {
        minor,
        average,
        major,
      },
    } = this.focusOnBestialWrathCastThreshold;
    when(this.averageFocusAtBestialWrathCast).isLessThan(minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>You started your average <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> at {this.averageFocusAtBestialWrathCast} focus, try and pool a bit more before casting <SpellLink id={SPELLS.BESTIAL_WRATH.id} />. This can be achieved by not casting abilities a few moments before <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> comes off cooldown.</Wrapper>)
          .icon(SPELLS.BESTIAL_WRATH.icon)
          .actual(`Average of ${this.averageFocusAtBestialWrathCast} focus at start of Bestial Wrath`)
          .recommended(`>${recommended} focus is recommended`)
          .regular(average)
          .major(major);
      });
  }

}

export default BestialWrathAverageFocus;
