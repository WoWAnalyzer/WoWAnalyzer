import React from 'react';

import CoreCancelledCasts from 'parser/shared/modules/CancelledCasts';

import { When, ThresholdStyle } from 'parser/core/ParseResults';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Statistic from 'interface/statistics/Statistic';
import BoringValueText from 'interface/statistics/components/BoringValueText';
import CrossIcon from 'interface/icons/Cross';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import { Options } from 'parser/core/Analyzer';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

/**
 * Tracks the amount of cancelled casts in %.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/Pp17Crv6gThLYmdf#fight=8&type=damage-done&source=76
 */
class CancelledCasts extends CoreCancelledCasts {
  constructor(options: Options) {
    super(options);
    this.IGNORED_ABILITIES = [
      //Include the spells that you do not want to be tracked and spells that are castable while casting
      ...CASTS_THAT_ARENT_CASTS,
    ];
  }

  get suggestionThresholds() {
    return {
      actual: 1 - this.cancelledPercentage,
      isLessThan: {
        minor: 0.975,
        average: 0.95,
        major: 0.9,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(<>You cancelled {formatPercentage(this.cancelledPercentage)}% of your spells. While it is expected that you will have to cancel a few casts to react to a boss mechanic or to move, you should try to ensure that you are cancelling as few casts as possible. This is generally done by planning ahead in terms of positioning, and moving while you're casting instant cast spells.</>)
        .icon('inv_misc_map_01')
        .actual(i18n._(t('hunter.marksmanship.suggestions.castsCanceled.efficiency')`${formatPercentage(1 - actual)}% casts cancelled`))
        .recommended(`<${formatPercentage(1 - recommended)}% is recommended`));
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
          <CrossIcon /> {formatPercentage(this.cancelledPercentage)}% <small>casts cancelled</small>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default CancelledCasts;
