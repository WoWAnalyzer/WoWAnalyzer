import { formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import { Section, SubSection } from 'interface/guide';
import { ThresholdStyle } from 'parser/core/ParseResults';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import ActiveTimeGraph from 'parser/ui/ActiveTimeGraph';
import Gauge from 'parser/ui/Gauge';
import PerformanceStrong from 'interface/PerformanceStrong';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TALENTS from 'common/TALENTS/warlock';
import SPELLS from 'common/SPELLS/warlock';
import CancelledCasts from './CancelledCasts';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static dependencies = {
    ...CoreAlwaysBeCasting.dependencies,
    cancelledCasts: CancelledCasts,
  };
  protected cancelledCasts!: CancelledCasts;

  position = STATISTIC_ORDER.CORE(6);

  get suggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.1,
        average: 0.15,
        major: 0.2,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(10)}
        tooltip={
          <>
            <p>
              Downtime is available time not used to cast anything (including not having your GCD
              rolling). This can be caused by delays between casting spells, latency, cast
              interrupting or just simply not casting anything (e.g. due to movement/stunned).
            </p>
            <ul>
              <li>
                You spent <strong>{formatPercentage(this.activeTimePercentage)}%</strong> of your
                time casting something.
              </li>
              <li>
                You spent <strong>{formatPercentage(this.downtimePercentage)}%</strong> of your time
                casting nothing at all.
              </li>
            </ul>
          </>
        }
      >
        <div className="pad">
          <label>Active time</label>
          <Gauge value={this.activeTimePercentage} />
        </div>
      </Statistic>
    );
  }

  get guideSubsection() {
    return (
      <SubSection>
        <p>
          <b>
            Continuously casting throughout a fight is one of the most important things you can do
            as an Affliction Warlock.
          </b>{' '}
          Your damage comes almost entirely from DoTs ticking and spending Soul Shards on Unstable
          Affliction — both of which require you to be actively casting to maintain. Every moment
          you spend not casting is lost damage that cannot be recovered.
        </p>
        <p>
          When you must move, plan ahead: refresh DoTs early and use instant-cast spells like{' '}
          <SpellLink spell={SPELLS.AGONY} />, <SpellLink spell={SPELLS.CORRUPTION_CAST} />, and
          instant <SpellLink spell={SPELLS.SHADOW_BOLT_AFFLI} />s from{' '}
          <SpellLink spell={TALENTS.NIGHTFALL_TALENT} /> procs to keep the GCD rolling. Reduce how
          much you need to move manually by making use of{' '}
          <SpellLink spell={TALENTS.DEMONIC_GATEWAY_TALENT} />,{' '}
          <SpellLink spell={TALENTS.DEMONIC_CIRCLE_TALENT} />, and{' '}
          <SpellLink spell={TALENTS.BURNING_RUSH_TALENT} /> to quickly reposition. Avoid cancelling
          casts whenever possible — a cancelled cast is a wasted GCD.
        </p>
        <p>
          Active Time:{' '}
          <PerformanceStrong performance={this.DowntimePerformance}>
            {formatPercentage(this.activeTimePercentage, 1)}%
          </PerformanceStrong>{' '}
          Cancelled Casts:{' '}
          <PerformanceStrong performance={this.cancelledCasts.cancelledPerformance}>
            {formatPercentage(this.cancelledCasts.canceled, 1)}%
          </PerformanceStrong>
        </p>
        <Section title="Active Time Graph">
          <ActiveTimeGraph
            activeTimeSegments={this.activeTimeSegments}
            fightStart={this.owner.fight.start_time}
            fightEnd={this.owner.fight.end_time}
          />
        </Section>
      </SubSection>
    );
  }
}

export default AlwaysBeCasting;
