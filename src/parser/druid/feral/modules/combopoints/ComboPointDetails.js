import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import Tab from 'interface/others/Tab';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import ResourceBreakdown from './ComboPointBreakdown';
import WastedPointsIcon from '../images/feralComboPointIcon.png';
import ComboPointTracker from './ComboPointTracker';


class ComboPointDetails extends Analyzer {
  static dependencies = {
    comboPointTracker: ComboPointTracker,
  };

  get pointsWasted() {
    return this.comboPointTracker.wasted - this.comboPointTracker.unavoidableWaste;
  }

  get pointsWastedPerMinute() {
    return (this.pointsWasted / this.owner.fightDuration) * 1000 * 60;
  }

  get wastingSuggestionThresholds() {
    return {
      actual: this.pointsWastedPerMinute,
      isGreaterThan: {
        minor: 0,
        average: 5,
        major: 10,
      },
      style: 'number',
    };
  }

  get finishersBelowMaxSuggestionThresholds() {
    const maxComboPointCasts = Object.values(this.comboPointTracker.spendersObj).reduce((acc, spell) => acc + spell.spentByCast.filter(cps => cps === 5).length, 0);
    const totalCasts = this.comboPointTracker.spendersCasts;
    const maxComboPointPercent = maxComboPointCasts / totalCasts;
    return {
      actual: maxComboPointPercent,
      isLessThan: {
        minor: 0.95,
        average: 0.90,
        major: 0.85,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.wastingSuggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <>
          You are wasting combo points. Avoid using generators once you reach the maximum.
        </>
      )
        .icon('creatureportrait_bubble')
        .actual(`${actual.toFixed(1)} combo points wasted per minute`)
        .recommended('zero waste is recommended');
    });

    when(this.finishersBelowMaxSuggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <>
          You are casting too many finishers with less that 5 combo points. Apart from <SpellLink id={SPELLS.SAVAGE_ROAR_TALENT.id} /> during the opening of a fight you should always use finishers with a full 5 combo points.
        </>
      )
        .icon('creatureportrait_bubble')
        .actual(`${formatPercentage(actual)}% of finishers were cast with 5 combo points`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        icon={(
        <img
          src={WastedPointsIcon}
          alt="Wasted Combo Points"
        />
      )}
        value={`${this.pointsWastedPerMinute.toFixed(2)}`}
        label="Wasted Combo Points per minute"
        tooltip={`You wasted a total of <b>${this.pointsWasted}</b> combo points. This number does NOT include Primal Fury procs that happened on a point builder used at 4 CPs, because this waste can't be controlled.`}
        position={STATISTIC_ORDER.CORE(6)}
      />
    );
  }

  tab() {
    return {
      title: 'Combo Point usage',
      url: 'combo-points',
      render: () => (
        <Tab>
          <ResourceBreakdown
            tracker={this.comboPointTracker}
            showSpenders
          />
        </Tab>
      ),
    };
 }
}

export default ComboPointDetails;
