import type { JSX } from 'react';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { EventType } from 'parser/core/Events';
import Analyzer from 'parser/core/Analyzer';
import GuideSection from 'interface/guide/components/GuideSection';
import CastSummary, { type CastEvaluation } from 'interface/guide/components/CastSummary';
import CastSequence, {
  type CastSequenceEntry,
  type CastInSequence,
} from 'interface/guide/components/CastSequence';
import EventHistory from 'parser/shared/modules/EventHistory';

import ArcaneSurge, { ArcaneSurgeData } from '../analyzers/ArcaneSurge';
import { TipBox } from 'interface/guide/components';
import { formatPercentage } from 'common/format';

const SURGE_PRE_WINDOW = 10000;
const SURGE_POST_WINDOW = 5000; // 7.5 seconds before and after

class ArcaneSurgeGuide extends Analyzer {
  static dependencies = {
    arcaneSurge: ArcaneSurge,
    eventHistory: EventHistory,
  };

  protected arcaneSurge!: ArcaneSurge;
  protected eventHistory!: EventHistory;

  private evaluateArcaneSurgeCast(cast: ArcaneSurgeData): CastEvaluation {
    const activeTimePerf: QualitativePerformance = cast.activeTime
      ? this.arcaneSurge.activeTimeUtil(cast.activeTime)
      : QualitativePerformance.Fail;

    // Fail conditions
    if (!cast.activeTime) {
      return {
        timestamp: cast.cast,
        performance: QualitativePerformance.Fail,
        reason: `No Active Time data found. Please report this!`,
      };
    }

    // Active Time Performance
    if (cast.activeTime) {
      return {
        timestamp: cast.cast,
        performance: activeTimePerf,
        reason: `${formatPercentage(cast.activeTime)}% Active Time`,
      };
    }

    // Fallback for any unexpected edge cases
    return {
      timestamp: cast.cast,
      performance: QualitativePerformance.Fail,
      reason: `Unknown Performance Condition. Please report this.`,
    };
  }

  get guideSubsection(): JSX.Element {
    const arcaneSurge = <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} />;

    const explanation = (
      <>
        <p>
          <b>{arcaneSurge}</b> is your primary damage cooldown and essentially converts all of your
          mana into damage and then gives you a massive damage and mana regeneration buff that lasts
          for 15 seconds. There is not much to play around with this cooldown, but casting it does
          begin your major burn phase, so you should ensure you are ready to execute that burn phase
          uninterupted and should spend as much of its duration casting as possible.
        </p>
        <TipBox type="info">
          While it may seem beneficial to have a high amount of mana before casting {arcaneSurge},
          this is not enough of a meaningful benefit to play around.
        </TipBox>
      </>
    );

    const surgeSequenceEvents: CastSequenceEntry<ArcaneSurgeData>[] =
      this.arcaneSurge.surgeData.map((cast) => {
        const windowStart = cast.cast - SURGE_PRE_WINDOW;
        const windowEnd = cast.cast + SURGE_POST_WINDOW;

        const castEvents = this.eventHistory.getEvents([EventType.Cast], {
          searchBackwards: false,
          startTimestamp: windowStart,
          duration: windowEnd - windowStart,
        });

        const casts: CastInSequence[] = castEvents.map((event) => ({
          timestamp: event.timestamp,
          spellId: event.ability.guid,
          spellName: event.ability.name,
          icon: event.ability.abilityIcon.replace('.jpg', ''),
          performance: undefined,
        }));

        return {
          data: cast,
          start: windowStart,
          end: windowEnd,
          casts,
        };
      });

    return (
      <GuideSection spell={TALENTS.ARCANE_SURGE_TALENT} explanation={explanation}>
        <CastSummary
          spell={TALENTS.ARCANE_SURGE_TALENT}
          casts={this.arcaneSurge.surgeData.map((cast) => this.evaluateArcaneSurgeCast(cast))}
          showBreakdown
        />
        <CastSequence
          spell={TALENTS.ARCANE_SURGE_TALENT}
          sequences={surgeSequenceEvents}
          castTimestamp={(data) => this.owner.formatTimestamp(data.cast)}
          iconSize={40}
        />
      </GuideSection>
    );
  }
}

export default ArcaneSurgeGuide;
