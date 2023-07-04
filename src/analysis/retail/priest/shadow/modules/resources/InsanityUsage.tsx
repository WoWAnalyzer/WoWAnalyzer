import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/priest';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Panel } from 'interface';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';
import { SpellLink } from 'interface';
import { ResourceLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import BoringResourceValue from 'parser/ui/BoringResourceValue';
import Statistic from 'parser/ui/Statistic';

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
      actual: this.wasted,
      isGreaterThan: {
        minor: 50,
        average: 100,
        major: 150,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You wasted {formatPercentage(this.wastePercentage)}%{' '}
          <ResourceLink id={RESOURCE_TYPES.INSANITY.id} /> by overcapping at max insanity. Since{' '}
          <SpellLink spell={TALENTS.DEVOURING_PLAGUE_TALENT} /> is your main source of damage and
          the damage stacks from early refreshing, you should always use{' '}
          <SpellLink spell={TALENTS.DEVOURING_PLAGUE_TALENT} /> when at risk of overcapping.
        </>,
      )
        .icon(TALENTS.DEVOURING_PLAGUE_TALENT.icon)
        .actual(
          t({
            id: 'priest.shadow.suggestions.insanity.usage',
            message: `You wasted ${this.wasted} of your Insanity due to overcapping.`,
          }),
        )
        .recommended(`Less than ${recommended} is recommended.`),
    );
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

  tab() {
    return {
      title: 'Insanity',
      url: 'insanity-usage',
      render: () => (
        <Panel>
          <ResourceBreakdown tracker={this.insanityTracker} showSpenders />
        </Panel>
      ),
    };
  }
}

export default InsanityUsage;
