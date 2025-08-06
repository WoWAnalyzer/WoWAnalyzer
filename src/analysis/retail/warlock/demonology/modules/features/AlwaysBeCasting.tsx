import { defineMessage } from '@lingui/core/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import { SpellLink } from 'interface';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
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

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay
          between casting spells. Even if you have to move, try casting something instant. Make good
          use of your <SpellLink spell={SPELLS.DEMONIC_CIRCLE} /> or{' '}
          <SpellLink spell={TALENTS.BURNING_RUSH_TALENT} /> when you can.
        </>,
      )
        .icon('spell_mage_altertime')
        .actual(
          defineMessage({
            id: 'warlock.demonology.suggestions.alwaysBeCasting.downtime',
            message: `${formatPercentage(actual)}% downtime`,
          }),
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
  }

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
