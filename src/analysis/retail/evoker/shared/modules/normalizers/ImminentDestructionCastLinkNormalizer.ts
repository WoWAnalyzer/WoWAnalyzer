import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import { Options } from 'parser/core/Analyzer';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  CastEvent,
  EventType,
  GetRelatedEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';

const IMMINENT_DESTRUCTION_CONSUME = 'ImminentDestructionConsume';
const BUFFER = 40;

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: IMMINENT_DESTRUCTION_CONSUME,
    reverseLinkRelation: IMMINENT_DESTRUCTION_CONSUME,
    linkingEventId: [
      SPELLS.IMMINENT_DESTRUCTION_DEV_BUFF.id,
      SPELLS.IMMINENT_DESTRUCTION_AUG_BUFF.id,
    ],
    linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    referencedEventId: [
      SPELLS.PYRE.id,
      SPELLS.PYRE_DENSE_TALENT.id,
      SPELLS.DISINTEGRATE.id,
      TALENTS.ERUPTION_TALENT.id,
    ],
    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: BUFFER,
    backwardBufferMs: BUFFER,
    maximumLinks: 1,
  },
];

class ImminentDestructionCastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS.IMMINENT_DESTRUCTION_AUGMENTATION_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.IMMINENT_DESTRUCTION_DEVASTATION_TALENT);
  }
}

export function getImminentDestructionConsumeEvent(
  event: RemoveBuffEvent | RemoveBuffStackEvent,
): CastEvent | undefined {
  return GetRelatedEvent<CastEvent>(event, IMMINENT_DESTRUCTION_CONSUME);
}

export default ImminentDestructionCastLinkNormalizer;
