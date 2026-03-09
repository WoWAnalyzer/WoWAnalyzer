import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { EventType } from 'parser/core/Events';
import GuideSection from 'interface/guide/components/GuideSection';
import CastDetail, { type PerCastData } from 'interface/guide/components/CastDetail';
import EventHistory from 'parser/shared/modules/EventHistory';
import {
  SpellSequence,
  type CastSequenceEntry,
  type CastInSequence,
} from 'interface/guide/components/CastSequence';
import DemonicTyrant, { TyrantCastData } from '../features/DemonicTyrant';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

const TYRANT_PRE_WINDOW = 7000;
const TYRANT_POST_WINDOW = 20000;

class DemonicTyrantGuide extends Analyzer {
  static dependencies = {
    demonicTyrant: DemonicTyrant,
    eventHistory: EventHistory,
  };

  protected demonicTyrant!: DemonicTyrant;
  protected eventHistory!: EventHistory;

  get guideSubsection(): JSX.Element {
    const tyrant = <SpellLink spell={SPELLS.SUMMON_DEMONIC_TYRANT} />;

    const explanation = (
      <>
        <b>{tyrant}</b> deals increased damage based on the number of active demons during its
        duration. To maximize its effectiveness, summon as many pets as possible before and during
        the Tyrant window.
        <br />
        <br />
        The primary demons contributing to Tyrant damage are:
        <ul>
          <li>
            <SpellLink spell={SPELLS.CALL_DREADSTALKERS} /> — summons two Dreadstalkers
          </li>
          <li>
            Wild Imps summoned from <SpellLink spell={SPELLS.HAND_OF_GULDAN_CAST} />
          </li>
          <li>
            Imp Gang Bosses summoned by <SpellLink spell={SPELLS.IMPLOSION_CAST} /> or{' '}
            <SpellLink spell={TALENTS.POWER_SIPHON_TALENT} /> with the talent{' '}
            <SpellLink spell={TALENTS.TO_HELL_AND_BACK_TALENT} />
          </li>
        </ul>
        <br />
        During the Tyrant window, aim to cast as many{' '}
        <SpellLink spell={SPELLS.HAND_OF_GULDAN_CAST} /> as possible to summon additional imps and
        increase Tyrant's damage.
      </>
    );
    const tyrantSequenceEvents: CastSequenceEntry<TyrantCastData>[] =
      this.demonicTyrant.tyrantData.map((cast) => {
        const windowStart = cast.cast - TYRANT_PRE_WINDOW;
        const windowEnd = cast.cast + TYRANT_POST_WINDOW;

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
        }));

        return {
          data: cast,
          start: windowStart,
          end: windowEnd,
          casts,
        };
      });

    function rateTyrantWindow(handOfGuldanCasts: number): QualitativePerformance {
      if (handOfGuldanCasts >= 6) {
        return QualitativePerformance.Perfect;
      }
      if (handOfGuldanCasts === 5) {
        return QualitativePerformance.Good;
      }
      if (handOfGuldanCasts >= 3) {
        return QualitativePerformance.Ok;
      }

      return QualitativePerformance.Fail;
    }

    function getTyrantFeedback(
      handOfGuldanCasts: number,
      impsSummoned: number,
      dreadstalkersActive: boolean,
      dreadstalkersTooEarly: boolean,
      casts: CastInSequence[],
      tyrantTimestamp: number,
    ): JSX.Element {
      const feedback: string[] = [];
      const preTyrantCasts = casts.filter((cast) => cast.timestamp < tyrantTimestamp);

      if (handOfGuldanCasts >= 6) {
        feedback.push(
          "Perfect Tyrant window. You maximized Hand of Gul'dan casts during the Tyrant duration.",
        );
      } else if (handOfGuldanCasts === 5) {
        feedback.push(
          "Great Tyrant window. One additional Hand of Gul'dan cast would make this perfect.",
        );
      } else if (handOfGuldanCasts >= 3) {
        feedback.push(
          "Try to cast Hand of Gul'dan more often during Tyrant by saving Demonic Cores for your Tyrant window.",
        );
      } else {
        feedback.push(
          "Too few Hand of Gul'dan casts. Either try pooling Soul Shards or Demonic Core charges before casting Tyrant.",
        );
      }

      const castedImplosion = preTyrantCasts.some(
        (cast) => cast.spellId === SPELLS.IMPLOSION_CAST.id,
      );

      const castedPowerSiphon = preTyrantCasts.some(
        (cast) => cast.spellId === TALENTS.POWER_SIPHON_TALENT.id,
      );

      if (!dreadstalkersActive) {
        feedback.push(
          'Cast Call Dreadstalkers before summoning Demonic Tyrant so they benefit from the damage bonus.',
        );
      } else if (dreadstalkersTooEarly) {
        feedback.push(
          'Call Dreadstalkers was cast too early before Tyrant. Try casting it closer to your Summon Demonic Tyrant window.',
        );
      }

      if (castedImplosion) {
        feedback.push(
          'Avoid casting Implosion before Tyrant, as it removes imps that Tyrant could extend.',
        );
      }

      if (castedPowerSiphon) {
        feedback.push(
          'Power Siphon before Tyrant sacrifices imps that could increase Tyrant damage.',
        );
      }

      if (impsSummoned < 8) {
        feedback.push(
          'Entering Tyrant with more imps already active will significantly increase its damage.',
        );
      }
      return (
        <>
          {feedback.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </>
      );
    }

    const perCastData: PerCastData[] = this.demonicTyrant.tyrantData.map((cast, index) => {
      const sequenceEntry = tyrantSequenceEvents[index];

      return {
        performance: rateTyrantWindow(cast.handOfGuldanCasts),
        timestamp: this.owner.formatTimestamp(cast.cast),
        stats: [
          {
            label: "Hand of Gul'dan Casts",
            value: cast.handOfGuldanCasts,
            tooltip: "Number of Hand of Gul'dan casts during the Tyrant window",
          },
          {
            label: 'Imps Summoned',
            value: cast.impsSummoned,
            tooltip: 'Wild Imps generated during the Tyrant window',
          },
        ],
        details: getTyrantFeedback(
          cast.handOfGuldanCasts,
          cast.impsSummoned,
          cast.dreadstalkersActive,
          cast.dreadstalkersTooEarly,
          sequenceEntry?.casts ?? [],
          cast.cast,
        ),
        additionalContent: sequenceEntry
          ? {
              title: 'Cast Sequence',
              content: <SpellSequence casts={sequenceEntry.casts} iconSize={40} />,
            }
          : undefined,
      };
    });

    return (
      <GuideSection spell={SPELLS.SUMMON_DEMONIC_TYRANT} explanation={explanation}>
        <CastDetail title="Demonic Tyrant Casts" casts={perCastData} />
      </GuideSection>
    );
  }
}

export default DemonicTyrantGuide;
