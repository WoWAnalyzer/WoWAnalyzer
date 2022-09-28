import { AnyEvent, BeginChannelEvent, CastEvent, DamageEvent, EndChannelEvent, EventType, HealEvent } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { PENANCE_DAMAGE, PENANCE_HEALING } from 'analysis/classic/priest/SPELLS';

const NEW_PENANCE_TIMEOUT = 5000;
const PENANCE_BOLT_COUNT = 3;

export interface PenanceLog {
  penanceCastEvents: CastEvent[];
  penanceHealEvents: HealEvent[];
  penanceDamageEvents: DamageEvent[];
}

export interface PenanceBeginChannelEvent extends BeginChannelEvent {
  penanceCastEvents: CastEvent[];
  penanceHealEvents: HealEvent[];
  penanceDamageEvents: DamageEvent[];
}

function isPenanceEvent(event: AnyEvent) {
  return (event.type === EventType.Cast || event.type === EventType.Heal || event.type === EventType.Damage) &&
    (event.ability?.guid === PENANCE_HEALING || event.ability?.guid === PENANCE_DAMAGE);
}

function createBeginChannelEvent(event: CastEvent): PenanceBeginChannelEvent {
  const beginChannel: PenanceBeginChannelEvent = {
    ...event,
    type: EventType.BeginChannel,
    isCancelled: true,
    trigger: event,
    __fabricated: true,
    penanceCastEvents: [],
    penanceHealEvents: [],
    penanceDamageEvents: [],
  };

  return beginChannel;
}

function createEndChannelEvent(event: CastEvent, beginChannelEvent: PenanceBeginChannelEvent): EndChannelEvent {
  beginChannelEvent.isCancelled = false;

  const endChannel: EndChannelEvent = {
    ...event,
    type: EventType.EndChannel,
    beginChannel: beginChannelEvent,
    start: beginChannelEvent.timestamp,
    duration: event.timestamp - beginChannelEvent.timestamp,
    __fabricated: true,
  };

  return endChannel;
}

function isNewPenence(event: CastEvent, beginChannelEvent?: PenanceBeginChannelEvent) {
  if (!beginChannelEvent) {
    return true;
  }
  if (event.timestamp - NEW_PENANCE_TIMEOUT > beginChannelEvent?.timestamp) {
    return true;
  }
  if (beginChannelEvent.penanceCastEvents.length >= PENANCE_BOLT_COUNT) {
    return true;
  }
}

// Creates BeginChannel and EndChannel events for all penance casts by the selected player.
class PenanceNormalizer extends EventsNormalizer {
  beginChannelEvent?: PenanceBeginChannelEvent;

  normalize(events: AnyEvent[]) {
    const fixedEvents: AnyEvent[] = [];

    events.forEach((event: AnyEvent, index: number) => {
      fixedEvents.push(event);

      if (event.type === EventType.Cast && isPenanceEvent(event)) {
        // Check to see if this is a new penance cast
        if (isNewPenence(event, this.beginChannelEvent)) {
          // This is a new penance, so inject a BeginChannelEvent
          this.beginChannelEvent = createBeginChannelEvent(event);
          fixedEvents.push(this.beginChannelEvent);
        }

        this.beginChannelEvent?.penanceCastEvents.push(event);

        if (this.beginChannelEvent && this.beginChannelEvent.penanceCastEvents.length === PENANCE_BOLT_COUNT) {
          const endChannelEvent = createEndChannelEvent(event, this.beginChannelEvent);
          fixedEvents.push(endChannelEvent);
        }
      }

      if (event.type === EventType.Heal && isPenanceEvent(event)) {
        this.beginChannelEvent?.penanceHealEvents.push(event);
      }

      if (event.type === EventType.Damage && isPenanceEvent(event)) {
        this.beginChannelEvent?.penanceDamageEvents.push(event);
      }

    });
    return fixedEvents;
  }
}

export default PenanceNormalizer;
