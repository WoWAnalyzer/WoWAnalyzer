import type { JSX } from 'react';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { EventType } from 'parser/core/Events';
import Analyzer from 'parser/core/Analyzer';
import GuideSection from 'interface/guide/components/GuideSection';
import { type CastEvaluation } from 'interface/guide/components/CastSummary';
import {
  SpellSequence,
  type CastSequenceEntry,
  type CastInSequence,
} from 'interface/guide/components/CastSequence';
import CastDetail, { type PerCastData } from 'interface/guide/components/CastDetail';
import EventHistory from 'parser/shared/modules/EventHistory';

import ArcaneSurge, { ArcaneSurgeData } from '../analyzers/ArcaneSurge';

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
    // Fail conditions (highest priority)
    if (!cast.touchActive) {
      return {
        timestamp: cast.cast,
        performance: QualitativePerformance.Fail,
        reason: `Touch of the Magi was not active on the Arcane Surge target.`,
      };
    }

    //Good
    if (cast.touchActive) {
      return {
        timestamp: cast.cast,
        performance: QualitativePerformance.Good,
        reason: `Touch of the Magi was active on the Surge target.`,
      };
    }

    // Fallback for any unexpected edge cases
    return {
      timestamp: cast.cast,
      performance: QualitativePerformance.Ok,
      reason: `Unexpected Result. You should report this.`,
    };
  }

  get guideSubsection(): JSX.Element {
    const arcaneSurge = <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} />;
    const touchOfTheMagi = <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} />;

    const explanation = (
      <>
        <p>
          <b>{arcaneSurge}</b> is your primary damage cooldown and will essentially convert all of
          your mana into damage and then gives you a massive mana regeneration buff to refill your
          mana. There is not much for you to play around with this cooldown, but you should cast
          {arcaneSurge} while {touchOfTheMagi} is active on the target to increase {arcaneSurge}s
          damage.
        </p>
        <p>
          <b>Note</b>: While it may seem beneficial to have a high amount of mana before casting{' '}
          {arcaneSurge}, this is not enough of a meaningful benefit to play around.
        </p>
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

    const perCastData: PerCastData[] = this.arcaneSurge.surgeData.map((cast, index) => {
      const evaluation = this.evaluateArcaneSurgeCast(cast);
      const sequenceEntry = surgeSequenceEvents[index];

      return {
        performance: evaluation.performance,
        timestamp: this.owner.formatTimestamp(cast.cast),
        stats: [
          {
            value: cast.touchActive ? 'Yes' : 'No',
            label: 'TOTM Active',
            tooltip: <>Touch of the Magi Debuff on Target.</>,
          },
        ],
        details: evaluation.reason,
        additionalContent: sequenceEntry
          ? {
              title: 'Cast Sequence',
              content: <SpellSequence casts={sequenceEntry.casts} iconSize={40} />,
            }
          : undefined,
      };
    });

    return (
      <GuideSection spell={TALENTS.ARCANE_SURGE_TALENT} explanation={explanation}>
        <CastDetail title="Arcane Surge Casts" casts={perCastData} />
      </GuideSection>
    );
  }
}

export default ArcaneSurgeGuide;
