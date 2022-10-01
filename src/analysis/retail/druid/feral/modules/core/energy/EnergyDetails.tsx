import { Icon, Panel, Tooltip } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';

import EnergyTracker from 'analysis/retail/druid/feral/modules/core/energy/EnergyTracker';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { formatDuration, formatPercentage } from 'common/format';
import StatisticBox from 'parser/ui/StatisticBox';

class EnergyDetails extends Analyzer {
  static dependencies = {
    energyTracker: EnergyTracker,
  };

  energyTracker!: EnergyTracker;

  // TODO make this an energy capped timeline, and make a general statistic usable by all
  statistic() {
    const timeAtCap = this.energyTracker.timeAtCap;
    const percentAtCap = this.energyTracker.percentAtCap;
    const gainWaste = this.energyTracker.gainWaste;

    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(2)}
        icon={<Icon icon="spell_shadow_shadowworddominate" alt="Capped Energy" />}
        value={`${formatPercentage(percentAtCap)}%`}
        label="Time with capped energy"
        tooltip={
          <>
            Although it can be beneficial to wait and let your energy pool ready to be used at the
            right time, you should still avoid letting it reach the cap.
            <br />
            You spent <b>{formatPercentage(percentAtCap)}%</b> of the fight at capped energy,
            causing you to miss out on <b>{this.owner.getPerMinute(gainWaste).toFixed(0)}</b> energy
            per minute from regeneration.
          </>
        }
        footer={
          <div className="statistic-box-bar">
            <Tooltip
              content={`Not at capped energy for ${formatDuration(
                this.owner.fightDuration - timeAtCap,
              )}`}
            >
              <div className="stat-healing-bg" style={{ width: `${(1 - percentAtCap) * 100}%` }}>
                <img src="/img/sword.png" alt="Uncapped Energy" />
              </div>
            </Tooltip>

            <Tooltip content={`At capped energy for ${formatDuration(timeAtCap)}`}>
              <div className="remainder DeathKnight-bg">
                <img src="/img/overhealing.png" alt="Capped Energy" />
              </div>
            </Tooltip>
          </div>
        }
      />
    );
  }

  tab() {
    return {
      title: 'Energy usage',
      url: 'energy-usage',
      render: () => (
        <Panel>
          <ResourceBreakdown tracker={this.energyTracker} showSpenders />
        </Panel>
      ),
    };
  }
}

export default EnergyDetails;
