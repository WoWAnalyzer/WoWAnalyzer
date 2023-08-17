import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { Expandable, SpellLink } from 'interface';
import { SectionHeader, SubSection } from 'interface/guide';
import { GlobalCooldownEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import ThresholdPerformancePercentage from './shared/ThresholdPerformancePercentage';
import Statistics from 'interface/icons/Statistics';
import getUptimeGraph, { UptimeHistoryEntry } from './shared/getUptimeGraph';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  uptimeHistory: UptimeHistoryEntry[] = [];

  onGCD(event: GlobalCooldownEvent) {
    const super_result = super.onGCD(event);

    this.uptimeHistory.push({
      timestamp: this.owner.currentTimestamp,
      uptimePct: this.activeTimePercentage,
    });

    return super_result;
  }

  get suggestionThresholds() {
    return {
      actual: this.activeTimePercentage,
      isLessThan: {
        minor: 0.95,
        average: 0.85,
        major: 0.75,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
  get guideSubsection() {
    const abcSuggestionThreshold = this.suggestionThresholds;

    return (
      <SubSection title="Always be casting">
        <p>
          As long as you have a target, there is <strong>always</strong> something you can cast as
          an Elemental shaman. This means that you should try to be on global cooldown for as much
          as you possibly can throughout the entire encounter. Any time you are not casting is time
          that you are not doing damage.
        </p>

        <p>
          A key factor to achieving high uptime as a caster is correct positioning and movement.
          Throughout the fight, it is very important that you proactively anticipate where you need
          to stand and/or move for mechanics. Doing this properly will minimize forced downtime of
          having to move longer distances.
        </p>

        <p>
          You spendt{' '}
          <ThresholdPerformancePercentage
            threshold={{
              type: 'gte',
              perfect: abcSuggestionThreshold.isLessThan.minor,
              good: abcSuggestionThreshold.isLessThan.average,
              ok: abcSuggestionThreshold.isLessThan.major,
            }}
            percentage={this.activeTimePercentage}
          />{' '}
          of the encounter in global cooldown.
        </p>

        <small>
          There will be some time where you cannot cast, for example during intermissions. You
          should evaluate your performance based on fight specific mechanics.
        </small>

        <Expandable
          header={
            <SectionHeader>
              <Statistics /> Active time timeline graph
            </SectionHeader>
          }
          element="section"
        >
          {getUptimeGraph(this.uptimeHistory, this.owner.fight.start_time)}
        </Expandable>
      </SubSection>
    );
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your downtime can be improved. If you need to move use{' '}
          <SpellLink spell={SPELLS.FLAME_SHOCK} />, <SpellLink spell={TALENTS.EARTH_SHOCK_TALENT} />{' '}
          or <SpellLink spell={TALENTS.FROST_SHOCK_TALENT} />
        </>,
      )
        .icon('spell_mage_altertime')
        .actual(`${formatPercentage(1 - actual)}% downtime`)
        .recommended(`<${formatPercentage(1 - recommended)}% is recommended`),
    );
  }
}

export default AlwaysBeCasting;
