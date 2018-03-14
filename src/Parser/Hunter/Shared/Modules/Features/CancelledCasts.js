import React from 'react';

import CoreCancelledCasts from 'Parser/Core/Modules/CancelledCasts';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Icon from 'common/Icon';
import Wrapper from 'common/Wrapper';

class CancelledCasts extends CoreCancelledCasts {
  static IGNORED_ABILITIES = [
    //Include the spells that you do not want to be tracked and spells that are castable while casting
    SPELLS.EXPLOSIVE_SHOT_DETONATION.id,
    SPELLS.WINDBURST_MOVEMENT_SPEED.id,
    SPELLS.CYCLONIC_BURST_IMPACT_TRAIT.id,
    SPELLS.CYCLONIC_BURST_TRAIT.id,
    SPELLS.GOLGANNETHS_VITALITY_RAVAGING_STORM.id,
  ];

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
  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>You cancelled {formatPercentage(this.cancelledPercentage)}% of your spells. While it is expected that you will have to cancel a few casts to react to a boss mechanic or to move, you should try to ensure that you are cancelling as few casts as possible. This is generally done by planning ahead in terms of positioning, and moving while you're casting instant cast spells.</Wrapper>)
          .icon('inv_misc_map_01')
          .actual(`${formatPercentage(actual)}% casts cancelled`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {
    const tooltipText = Object.keys(this.cancelledSpellList).map(cancelledSpell =>
      `<li>
        ${this.cancelledSpellList[cancelledSpell].spellName}: ${this.cancelledSpellList[cancelledSpell].amount}
      </li>`
    ).join(' ');

    return (
      <StatisticBox
        icon={<Icon icon="inv_misc_map_01" />}
        value={`${formatPercentage(this.cancelledPercentage)}%`}
        label={`Cancelled Casts`}
        tooltip={`You started casting a total of ${this.totalCasts} spells with a cast timer. You cancelled ${this.castsCancelled} of those casts. <ul>${tooltipText}</ul>`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(10);
}

export default CancelledCasts;
