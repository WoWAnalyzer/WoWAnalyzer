import SPELLS from 'common/SPELLS';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { AnyEvent, CastEvent, EventType, GetRelatedEvents } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const UNHINGED_BLOODTHIRST = 'Unhinged-Bloodthirst';
const RAVAGER_DAMAGE_BUFFER_MS = 5; // triggered bloodthirst *should* be at the exact same timestamp, but give some wiggle room
const BLADESTORM_DAMAGE_BUFFER_MS = 100; // bloodthirst cast is anywhere from ~5-100ms before the bladestorm damage tick

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: UNHINGED_BLOODTHIRST,
    linkingEventId: [SPELLS.BLOODBATH.id, SPELLS.BLOODTHIRST.id],
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.RAVAGER_DAMAGE.id,
    referencedEventType: EventType.Damage,
    forwardBufferMs: RAVAGER_DAMAGE_BUFFER_MS,
    backwardBufferMs: RAVAGER_DAMAGE_BUFFER_MS,
    anyTarget: true,
  },
  {
    linkRelation: UNHINGED_BLOODTHIRST,
    linkingEventId: [SPELLS.BLOODBATH.id, SPELLS.BLOODTHIRST.id],
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.BLADESTORM_DAMAGE.id,
    referencedEventType: EventType.Damage,
    forwardBufferMs: BLADESTORM_DAMAGE_BUFFER_MS,
    backwardBufferMs: BLADESTORM_DAMAGE_BUFFER_MS,
    anyTarget: true,
  },
];

function isUnhingedBloodthirst(event: CastEvent): boolean {
  return GetRelatedEvents(event, UNHINGED_BLOODTHIRST).length > 0;
}

class UnhingedBloodthirstNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }

  normalize(rawEvents: AnyEvent[]): AnyEvent[] {
    const events = super.normalize(rawEvents);

    events.forEach((event, index) => {
      if (event.type === EventType.Cast && isUnhingedBloodthirst(event)) {
        events.splice(index, 1); // remove original cast event
        (event as AnyEvent).type = EventType.FreeCast;
        event.__modified = true;
        events.push(event); // add freecast event
      }
    });
    return events;
  }
}

export default UnhingedBloodthirstNormalizer;
