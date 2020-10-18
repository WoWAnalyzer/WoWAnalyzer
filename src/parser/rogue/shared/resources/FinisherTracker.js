import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import Events from 'parser/core/Events';

import ComboPointTracker from './ComboPointTracker';

const MINOR_THRESHOLD = 0.05;
const AVERAGE_THRESHOLD = 0.1;
const MAJOR_THRESHOLD = 0.2;

class FinisherTracker extends Analyzer {
  static dependencies = {
    comboPointTracker: ComboPointTracker,
  };

  inefficientFinisherCount = 0;

  /**
   * IMPLEMENTME
   * This is where logic is implemented for deciding how many combo points should be used for finishers.
   * @returns {number}  The minimum number of combo points for finishers; CP spends less than this number are considered inefficient.
   */
  recommendedFinisherPoints(){
    const points = this.maximumComboPoints;
    return points;
  }

  /**
   * IMPLEMENTME
   * Return spec specific suggestion text or JSX node here.
   */
  extraSuggestion(){
    return '';
  }

  /**
   * IMPLEMENTME
   * This can be overridden to change the suggestion icon to be something relevant to the spec.
   */
  suggestionIcon(){
    return SPELLS.EVISCERATE.icon;
  }

  constructor(options){
    super(options);
    this.addEventListener(Events.SpendResource.by(SELECTED_PLAYER), this.onSpendResource);
  }

  onSpendResource(event) {
    const spent = event.resourceChange;
    if (event.resourceChangeType !== RESOURCE_TYPES.COMBO_POINTS.id) {
      return;
    }

    if(spent < this.recommendedFinisherPoints()){
      this.inefficientFinisherCount += 1;
    }
  }

  get maximumComboPoints(){
    return this.comboPointTracker.maxResource;
  }

  get totalFinisherCount(){
    return this.comboPointTracker.spendersCasts;
  }

  get finisherInefficiency(){
    return this.inefficientFinisherCount / this.totalFinisherCount;
  }

  get suggestionThresholds() {
    return {
      actual: this.finisherInefficiency,
      isGreaterThan: {
        minor: MINOR_THRESHOLD,
        average: AVERAGE_THRESHOLD,
        major: MAJOR_THRESHOLD,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(<React.Fragment>Try to use your finishers at {this.maximumComboPoints} combo points. {this.extraSuggestion()}</React.Fragment>)
        .icon(this.suggestionIcon())
        .actual(i18n._(t('rogue.shared.suggestions.finishers.efficiency')`${formatPercentage(actual)}% (${this.inefficientFinisherCount} out of ${this.totalFinisherCount}) inefficient casts`))
        .recommended(`<${formatPercentage(recommended)}% is recommended`));
  }
}

export default FinisherTracker;
