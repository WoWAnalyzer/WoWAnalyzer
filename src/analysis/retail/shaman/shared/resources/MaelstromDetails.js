import { formatPercentage } from 'common/format';
import { Icon } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';
import Panel from 'parser/ui/Panel';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

import MaelstromTracker from './MaelstromTracker.js';

const MINOR_THRESHOLD = 0;
const AVERAGE_THRESHOLD = 0.02;
const MAJOR_THRESHOLD = 0.05;

class MaelstromDetails extends Analyzer {
  static dependencies = {
    maelstromTracker: MaelstromTracker,
  };

  get wasted() {
    return this.maelstromTracker.wasted || 0;
  }

  get total() {
    return this.maelstromTracker.wasted + this.maelstromTracker.generated || 0;
  }

  get wastedPerMinute() {
    return (this.wasted / this.owner.fightDuration) * 1000 * 60 || 0;
  }

  get wastedPercent() {
    return this.wasted / this.total || 0;
  }

  get suggestionThresholdsWasted() {
    return {
      actual: this.wastedPercent,
      isGreaterThan: {
        minor: MINOR_THRESHOLD,
        average: AVERAGE_THRESHOLD,
        major: MAJOR_THRESHOLD,
      },
      style: 'percentage',
    };
  }

  get suggestionThresholds() {
    return {
      actual: 1 - this.wastedPercent,
      isLessThan: {
        minor: 1 - MINOR_THRESHOLD,
        average: 1 - AVERAGE_THRESHOLD,
        major: 1 - MAJOR_THRESHOLD,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholdsWasted).addSuggestion((suggest, actual, recommended) =>
      suggest(
        `You overcapped ${this.wasted} Maelstrom. Always prioritize spending it over avoiding the overcap of any other ability.`,
      )
        .icon('spell_shadow_mindflay')
        .actual(`${formatPercentage(actual)}% overcapped Maelstrom`)
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return [
      <StatisticBox
        key="StatisticBox"
        position={STATISTIC_ORDER.CORE(1)}
        icon={<Icon icon="spell_shadow_mindflay" />}
        value={`${formatPercentage(this.wastedPercent)} %`}
        label="Overcapped Maelstrom"
        tooltip={`${this.wasted} out of ${this.total} Maelstrom wasted.`}
      />,
      <Panel key="Panel" title="Maelstrom usage" position={200} pad={false}>
        <ResourceBreakdown tracker={this.maelstromTracker} showSpenders />
      </Panel>,
    ];
  }
}

export default MaelstromDetails;
