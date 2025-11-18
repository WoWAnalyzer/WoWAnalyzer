import { formatPercentage } from 'common/format';
import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import { SpellLink } from 'interface';
import { ThresholdStyle } from 'parser/core/ParseResults';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { SubSection } from 'interface/guide';
import PerformanceStrong from 'interface/PerformanceStrong';
import ActiveTimeGraph from 'parser/ui/ActiveTimeGraph';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get suggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.1,
        average: 0.2,
        major: 0.3,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  position = STATISTIC_ORDER.CORE(1);

  get guideSubsection(): JSX.Element {
    const explanation = (
      <>
        Maintaining high uptime is crucial for maximizing DPS as a Demonology Warlock. Try to always
        be casting something - there should be minimal downtime between spell casts. When you need
        to move, use instant abilities like <SpellLink spell={SPELLS.DEMONBOLT} /> (with{' '}
        <SpellLink spell={SPELLS.DEMONIC_CORE_BUFF} />) or utilize{' '}
        <SpellLink spell={SPELLS.DEMONIC_CIRCLE} /> and{' '}
        <SpellLink spell={TALENTS.BURNING_RUSH_TALENT} /> to minimize movement downtime.
      </>
    );

    return (
      <SubSection title="Always Be Casting">
        {explanation}
        <p>
          Active Time:{' '}
          <PerformanceStrong performance={this.DowntimePerformance}>
            {formatPercentage(this.activeTimePercentage, 1)}%
          </PerformanceStrong>
        </p>
        <ActiveTimeGraph
          activeTimeSegments={this.activeTimeSegments}
          fightStart={this.owner.fight.start_time}
          fightEnd={this.owner.fight.end_time}
        />
      </SubSection>
    );
  }
}

export default AlwaysBeCasting;
