import React from 'react';

import CoreCancelledCasts from 'parser/shared/modules/CancelledCasts';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Statistic from 'interface/statistics/Statistic';
import BoringValueText from 'interface/statistics/components/BoringValueText';
import CrossIcon from 'interface/icons/Cross';

/**
 * Tracks the amount of cancelled casts in %.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/Pp17Crv6gThLYmdf#fight=8&type=damage-done&source=76
 */

class CancelledCasts extends CoreCancelledCasts {

  constructor(options: any) {
    super(options);
    this.IGNORED_ABILITIES = [
      //Include the spells that you do not want to be tracked and spells that are castable while casting
      SPELLS.EXPLOSIVE_SHOT_DAMAGE.id,
    ];
  }

  get suggestionThresholds() {
    return {
      actual: this.cancelledPercentage,
      isGreaterThan: {
        minor: 0.025,
        average: 0.05,
        major: 0.1,
      },
      style: 'percentage',
    };
  }
  suggestions(when: any) {
    when(this.suggestionThresholds).addSuggestion((suggest: any, actual: any, recommended: any) => {
        return suggest(<>You cancelled {formatPercentage(this.cancelledPercentage)}% of your spells. While it is expected that you will have to cancel a few casts to react to a boss mechanic or to move, you should try to ensure that you are cancelling as few casts as possible. This is generally done by planning ahead in terms of positioning, and moving while you're casting instant cast spells.</>)
          .icon('inv_misc_map_01')
          .actual(`${formatPercentage(actual)}% casts cancelled`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {
    const tooltipText = Object.values(this.cancelledSpellList).map(cancelledSpell => (
        <li key={cancelledSpell.spellName}>
          {cancelledSpell.spellName}: {cancelledSpell.amount}
        </li>
      ));

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(14)}
        size="flexible"
        tooltip={(
          <>
            You started casting a total of {this.totalCasts} spells with a cast timer. You cancelled {this.castsCancelled} of those casts.
            <ul>
              {tooltipText}
            </ul>
          </>
        )}
      >
        <BoringValueText label="Cancelled Casts">
          <CrossIcon /> {formatPercentage(this.cancelledPercentage)}% <small>Casts Cancelled</small>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default CancelledCasts;
