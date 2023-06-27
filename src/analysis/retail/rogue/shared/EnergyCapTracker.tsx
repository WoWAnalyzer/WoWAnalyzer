import { formatDuration, formatPercentage } from 'common/format';
import { Icon } from 'interface';
import { Tooltip } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

import EnergyTracker from 'analysis/retail/rogue/shared/EnergyTracker';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

class EnergyCapTracker extends Analyzer {
  static dependencies = {
    ...Analyzer.dependencies,
    // Needed for the `resourceCost` prop of events
    energyTracker: EnergyTracker,
  };

  protected energyTracker!: EnergyTracker;

  get wastedPercent() {
    return this.energyTracker.rateWaste / 1; //this.naturalRegen || 0;
  }

  get suggestionThresholds() {
    return {
      actual: 1 - this.wastedPercent,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You're allowing your energy to reach its cap. While at its maximum value you miss out on
          the energy that would have regenerated. Although it can be beneficial to let energy pool
          ready to be used at the right time, try to spend some before it reaches the cap.
        </>,
      )
        .icon('spell_shadow_shadowworddominate')
        .actual(`${actual.toFixed(1)} regenerated energy lost per minute due to being capped.`)
        .recommended(`<${recommended} is recommended.`),
    );
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(1)}
        icon={<Icon icon="spell_shadow_shadowworddominate" alt="Capped Energy" />}
        value={`${formatPercentage(this.wastedPercent)} %`}
        label="Wasted energy from being capped"
        tooltip={
          <>
            Although it can be beneficial to wait and let your energy pool ready to be used at the
            right time, you should still avoid letting it reach the cap.
            <br />
            You spent <strong>{formatPercentage(this.energyTracker.percentAtCap)}%</strong> of the
            fight at capped energy, causing you to miss out on a total of{' '}
            <strong>{this.energyTracker.rateWaste.toFixed(0)}</strong> energy from regeneration.
          </>
        }
        footer={
          <div className="statistic-box-bar">
            <Tooltip
              content={`Not at capped energy for ${formatDuration(
                this.owner.fightDuration - this.energyTracker.timeAtCap,
              )}`}
            >
              <div
                className="stat-healing-bg"
                style={{ width: `${(1 - this.energyTracker.percentAtCap) * 100}%` }}
              >
                <img src="/img/sword.png" alt="Uncapped Energy" />
              </div>
            </Tooltip>

            <Tooltip
              content={`At capped energy for ${formatDuration(this.energyTracker.timeAtCap)}`}
            >
              <div className="remainder DeathKnight-bg">
                <img src="/img/overhealing.png" alt="Capped Energy" />
              </div>
            </Tooltip>
          </div>
        }
      />
    );
  }
}

export default EnergyCapTracker;
