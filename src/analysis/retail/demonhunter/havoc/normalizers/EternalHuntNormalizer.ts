import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import { CastEvent, EventType, GetRelatedEvent, RemoveBuffEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';

const ETERNAL_HUNT_APPLICATION = 'EternalHuntApplication';
const ETERNAL_HUNT_CONSUMPTION = 'EternalHuntConsumption';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: ETERNAL_HUNT_APPLICATION,
    linkingEventId: SPELLS.EMPOWERED_EYEBEAM_BUFF.id,
    linkingEventType: EventType.ApplyBuff,
    referencedEventId: TALENTS_DEMON_HUNTER.THE_HUNT_HAVOC_TALENT.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: 100,
    backwardBufferMs: 100,
    anyTarget: true,
    isActive: (c) => c.hasTalent(TALENTS_DEMON_HUNTER.ETERNAL_HUNT_1_HAVOC_TALENT),
  },
  {
    linkRelation: ETERNAL_HUNT_CONSUMPTION,
    linkingEventId: SPELLS.EMPOWERED_EYEBEAM_BUFF.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: [TALENTS_DEMON_HUNTER.EYE_BEAM_TALENT.id, SPELLS.ABYSSAL_GAZE.id],
    referencedEventType: EventType.Cast,
    forwardBufferMs: 4000,
    backwardBufferMs: 4000,
    anyTarget: true,
    isActive: (c) => c.hasTalent(TALENTS_DEMON_HUNTER.ETERNAL_HUNT_1_HAVOC_TALENT),
  },
];

export default class EternalHuntNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getEternalHuntConsumption(event: RemoveBuffEvent): CastEvent | undefined {
  return GetRelatedEvent(
    event,
    ETERNAL_HUNT_CONSUMPTION,
    (e): e is CastEvent => e.type === EventType.Cast,
  );
}
