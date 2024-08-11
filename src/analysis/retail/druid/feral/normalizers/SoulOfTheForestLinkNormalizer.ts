import SPELLS from 'common/SPELLS';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { CastEvent, EventType, GetRelatedEvents, ResourceChangeEvent } from 'parser/core/Events';
import { FINISHER_IDS } from 'analysis/retail/druid/feral/constants';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';

const BUFFER_MS = 50;

/** Link from Soul of the Forest energize to the cast that procced it */
const PROCCED_BY = 'SotfProccedBy';
/** Link from cast to the Soul of the Forest energize it caused */
const PROCCED_SOTF = 'ProccedSotf';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: PROCCED_BY,
    reverseLinkRelation: PROCCED_SOTF,
    linkingEventId: SPELLS.SOUL_OF_THE_FOREST_FERAL_ENERGY.id,
    linkingEventType: EventType.ResourceChange,
    referencedEventId: FINISHER_IDS,
    referencedEventType: EventType.Cast,
    forwardBufferMs: BUFFER_MS,
    backwardBufferMs: BUFFER_MS,
    anyTarget: true, // cast on target, energize on self
  },
];

export default class SoulOfTheForestLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.SOUL_OF_THE_FOREST_FERAL_TALENT);
  }
}

export function getSotfEnergize(event: CastEvent): ResourceChangeEvent | undefined {
  const events: ResourceChangeEvent[] = GetRelatedEvents(
    event,
    PROCCED_SOTF,
    (e): e is ResourceChangeEvent => e.type === EventType.ResourceChange,
  );
  return events.pop();
}
