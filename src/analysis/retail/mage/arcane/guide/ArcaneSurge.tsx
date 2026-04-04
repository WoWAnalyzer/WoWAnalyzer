import type { JSX } from 'react';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import { SpellSeq } from 'parser/ui/SpellSeq';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { EventType } from 'parser/core/Events';
import Analyzer from 'parser/core/Analyzer';
import { evaluateQualitativePerformanceByThreshold } from 'parser/ui/QualitativePerformance';
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

  manaUtil(manaPercent: number) {
    const thresholds = this.arcaneSurge.arcaneSurgeManaThresholds.isLessThan;
    return evaluateQualitativePerformanceByThreshold({
      actual: manaPercent,
      isGreaterThan: {
        perfect: thresholds.minor,
        good: thresholds.average,
        ok: thresholds.major,
        fail: 0,
      },
    });
  }

  private evaluateArcaneSurgeCast(cast: ArcaneSurgeData): CastEvaluation {
    const mana = cast.mana || 0;
    const manaPerf = this.manaUtil(mana) as QualitativePerformance;

    // Fail conditions (highest priority)
    if (manaPerf === QualitativePerformance.Fail) {
      return {
        timestamp: cast.cast,
        performance: QualitativePerformance.Fail,
        reason: `Low Mana. Use Evocation to top off your mana before your Burn Phase.`,
      };
    }

    // Performance based on Mana
    if (cast.mana) {
      return {
        timestamp: cast.cast,
        performance: manaPerf,
        reason: `${manaPerf} Usage: ${formatPercentage(cast.mana, 1)}% Mana`,
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

    const explanation = (
      <>
        <b>{arcaneSurge}</b> is your primary damage cooldown and will essentially convert all of
        your mana into damage and then will give you a massive mana regeneration buff to refill your
        mana. Because of this, there are a few things that you should do to ensure you maximize the
        amount of damage that {arcaneSurge} does:
        <ul>
          <li>
            Apparently nothing matters here ... Leaving this as placeholder for now and will revisit
          </li>
        </ul>
        When incorporating the above items, your spell sequence will look like this:{' '}
        <SpellSeq
          spells={[
            TALENTS.EVOCATION_TALENT,
            TALENTS.ARCANE_MISSILES_TALENT,
            SPELLS.ARCANE_ORB,
            TALENTS.ARCANE_SURGE_TALENT,
          ]}
        />
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
            value: `${formatPercentage(cast.mana || 0, 0)}%`,
            label: 'Mana',
            tooltip: <>Mana percentage at cast time</>,
          },
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
