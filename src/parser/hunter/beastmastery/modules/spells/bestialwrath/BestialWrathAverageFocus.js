import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer from 'parser/core/Analyzer';
import StatisticBox from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';
import SpellLink from 'common/SpellLink';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

/**
 * Sends you and your pet into a rage, increasing all damage you both deal by 25% for 15 sec.
 * Bestial Wrath's remaining cooldown is reduced by 12 sec each time you use Barbed Shot
 *
 * Example log: https://www.warcraftlogs.com/reports/pdm6qYNZ2ktMXDRr#fight=7&type=damage-done&source=8
 */

class BestialWrathAverageFocus extends Analyzer {
  bestialWrathCasts = 0;
  accumulatedFocusAtBWCast = 0;

  on_byPlayer_cast(event) {
    const buffId = event.ability.guid;
    if (buffId !== SPELLS.BESTIAL_WRATH.id) {
      return;
    }
    this.bestialWrathCasts += 1;
    this.accumulatedFocusAtBWCast += event.classResources[0].amount || 0;
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(14)}
        icon={<SpellIcon id={SPELLS.BESTIAL_WRATH.id} />}
        value={this.averageFocusAtBestialWrathCast}
        label="Average Focus on cast"
        tooltip={`You started your average Bestial Wrath window with ${this.averageFocusAtBestialWrathCast} focus.`}
      />
    );
  }

  get averageFocusAtBestialWrathCast() {
    return formatNumber(this.accumulatedFocusAtBWCast / this.bestialWrathCasts);
  }
  get focusOnBestialWrathCastThreshold() {
    if (this.selectedCombatant.hasTalent(SPELLS.KILLER_COBRA_TALENT.id)) {
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
    when(this.focusOnBestialWrathCastThreshold).addSuggestion((suggest, actual, recommended) => {
      return suggest(<>You started your average <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> at {this.averageFocusAtBestialWrathCast} focus, try and pool a bit more before casting <SpellLink id={SPELLS.BESTIAL_WRATH.id} />. This can be achieved by not casting abilities a few moments before <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> comes off cooldown.</>)
        .icon(SPELLS.BESTIAL_WRATH.icon)
        .actual(`Average of ${this.averageFocusAtBestialWrathCast} focus at start of Bestial Wrath`)
        .recommended(`>${recommended} focus is recommended`);
    });
  }
}

export default BestialWrathAverageFocus;
