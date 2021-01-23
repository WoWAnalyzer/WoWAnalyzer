import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Statistic from 'parser/ui/Statistic';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import BoringResourceValue from 'parser/ui/BoringResourceValue';
import { ResourceLink } from 'interface';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

import InsanityTracker from './InsanityTracker';

class InsanityUsage extends Analyzer {
  static dependencies = {
    insanityTracker: InsanityTracker,
  };
  protected insanityTracker!: InsanityTracker;

  get wasted() {
    return this.insanityTracker.wasted || 0;
  }

  get total() {
    return this.insanityTracker.wasted + this.insanityTracker.generated || 0;
  }

  get wastePercentage() {
    return this.wasted / this.total;
  }

  get suggestionThresholds() {
    return {
      actual: this.wastePercentage,
      isGreaterThan: {
        minor: 0,
        average: 0.02,
        major: 0.04,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds)
    .addSuggestion((suggest, actual, recommended) => suggest(<>You wasted {this.wasted} <ResourceLink id={RESOURCE_TYPES.INSANITY.id} /> by overcapping at max insanity. Since <SpellLink id={SPELLS.DEVOURING_PLAGUE.id} /> is your main source of damage and the damage stacks from early refreshing, you should always use <SpellLink id={SPELLS.DEVOURING_PLAGUE.id} /> when at risk of overcapping.</>)
    .icon(SPELLS.DEVOURING_PLAGUE.icon)
    .actual(
      t({
        id:'priest.shadow.suggestions.insanity.usage',
        message: `You wasted ${formatPercentage(actual)}% of your Insanity due to overcapping.`
      })
    )
    .recommended(`${recommended}% is recommended.`));
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        tooltip={`You wasted ${this.wasted} out of ${this.total} Insanity due to overcapping.`}
      >
        <BoringResourceValue
          resource={RESOURCE_TYPES.INSANITY}
          value={`${formatPercentage(this.wastePercentage)}%`}
          label="Wasted Insanity"
        />
      </Statistic>
    );
  }
}

export default InsanityUsage;
