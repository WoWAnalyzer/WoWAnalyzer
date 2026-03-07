import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
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

const TYRANT_PRE_WINDOW = 8000;
const TYRANT_POST_WINDOW = 12000;

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
        <b>{tyrant}</b> is Demonology's primary cooldown. The goal is to build a strong demon setup
        before casting it and then spend globals efficiently during the window.
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
          performance: QualitativePerformance.Ok,
        }));

        return {
          data: cast,
          start: windowStart,
          end: windowEnd,
          casts,
        };
      });

    const perCastData: PerCastData[] = this.demonicTyrant.tyrantData.map((cast, index) => {
      const sequenceEntry = tyrantSequenceEvents[index];

      return {
        performance: QualitativePerformance.Ok,
        timestamp: this.owner.formatTimestamp(cast.cast),
        stats: [],
        details: 'Spell sequence around Demonic Tyrant.',
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
