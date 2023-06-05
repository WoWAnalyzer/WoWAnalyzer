import SPELLS from 'common/SPELLS/demonhunter';
import {
  ApplyBuffEvent,
  CastEvent,
  EventType,
  GetRelatedEvents,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import TALENTS from 'common/TALENTS/demonhunter';

const UNBOUND_CHAOS_BUFFER = 100;

const UNBOUND_CHAOS_APPLICATION = 'UnboundChaosApplication';
const UNBOUND_CHAOS_CONSUMPTION = 'UnboundChaosConsumption';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: UNBOUND_CHAOS_CONSUMPTION,
    referencedEventId: SPELLS.FEL_RUSH_CAST.id,
    referencedEventType: EventType.Cast,
    linkingEventId: SPELLS.UNBOUND_CHAOS_BUFF.id,
    linkingEventType: EventType.RemoveBuff,
    forwardBufferMs: UNBOUND_CHAOS_BUFFER,
    backwardBufferMs: UNBOUND_CHAOS_BUFFER,
    anyTarget: true,
    isActive: (c) => c.hasTalent(TALENTS.UNBOUND_CHAOS_TALENT),
  },
  {
    linkRelation: UNBOUND_CHAOS_APPLICATION,
    referencedEventId: SPELLS.IMMOLATION_AURA.id,
    referencedEventType: EventType.Cast,
    linkingEventId: SPELLS.UNBOUND_CHAOS_BUFF.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    forwardBufferMs: UNBOUND_CHAOS_BUFFER,
    backwardBufferMs: UNBOUND_CHAOS_BUFFER,
    anyTarget: true,
    isActive: (c) => c.hasTalent(TALENTS.UNBOUND_CHAOS_TALENT),
  },
];

export default class UnboundChaosNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getUnboundChaosApplication(
  event: ApplyBuffEvent | RefreshBuffEvent,
): CastEvent | undefined {
  return GetRelatedEvents(event, UNBOUND_CHAOS_APPLICATION)
    .filter((e): e is CastEvent => e.type === EventType.Cast)
    .at(0);
}

export function getUnboundChaosConsumption(event: RemoveBuffEvent): CastEvent | undefined {
  return GetRelatedEvents(event, UNBOUND_CHAOS_CONSUMPTION)
    .filter((e): e is CastEvent => e.type === EventType.Cast)
    .at(0);
}
