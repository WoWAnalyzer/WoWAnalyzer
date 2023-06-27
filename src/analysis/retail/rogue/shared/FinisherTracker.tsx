import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { SpendResourceEvent } from 'parser/core/Events';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import * as React from 'react';

import ComboPointTracker from './ComboPointTracker';

const MINOR_THRESHOLD = 0.05;
const AVERAGE_THRESHOLD = 0.1;
const MAJOR_THRESHOLD = 0.2;

class FinisherTracker extends Analyzer {
  get maximumComboPoints(): number {
    return this.comboPointTracker.maxResource;
  }

  get totalFinisherCount(): number {
    return this.comboPointTracker.spendersCasts;
  }

  get finisherInefficiency(): number {
    return this.inefficientFinisherCount / this.totalFinisherCount;
  }

  get suggestionThresholds(): NumberThreshold {
    return {
      actual: this.finisherInefficiency,
      isGreaterThan: {
        minor: MINOR_THRESHOLD,
        average: AVERAGE_THRESHOLD,
        major: MAJOR_THRESHOLD,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  static dependencies = {
    comboPointTracker: ComboPointTracker,
  };
  protected comboPointTracker!: ComboPointTracker;
  inefficientFinisherCount = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.SpendResource.by(SELECTED_PLAYER), this.onSpendResource);
  }

  /**
   * IMPLEMENTME
   * This is where logic is implemented for deciding how many combo points should be used for finishers.
   * @returns {number}  The minimum number of combo points for finishers; CP spends less than this number are considered inefficient.
   */
  recommendedFinisherPoints(): number {
    const points = this.maximumComboPoints;
    return points;
  }

  /**
   * IMPLEMENTME
   * Return spec specific suggestion text or JSX node here.
   */
  extraSuggestion(): React.ReactElement | string {
    return '';
  }

  /**
   * IMPLEMENTME
   * This can be overridden to change the suggestion icon to be something relevant to the spec.
   */
  suggestionIcon(): string {
    return SPELLS.EVISCERATE.icon;
  }

  onSpendResource(event: SpendResourceEvent) {
    const spent = event.resourceChange;
    if (event.resourceChangeType !== RESOURCE_TYPES.COMBO_POINTS.id) {
      return;
    }

    if (spent < this.recommendedFinisherPoints()) {
      this.inefficientFinisherCount += 1;
    }
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <React.Fragment>
          Try to use your finishers at {this.maximumComboPoints} combo points.{' '}
          {this.extraSuggestion()}
        </React.Fragment>,
      )
        .icon(this.suggestionIcon())
        .actual(
          `${formatPercentage(actual)}% (${this.inefficientFinisherCount} out of ${
            this.totalFinisherCount
          }) inefficient casts`,
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default FinisherTracker;
