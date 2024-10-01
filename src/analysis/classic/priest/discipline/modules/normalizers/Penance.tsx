import {
  AnyEvent,
  BeginChannelEvent,
  CastEvent,
  EndChannelEvent,
  EventType,
} from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import PrePullCooldowns from 'parser/shared/normalizers/PrePullCooldowns';
import SPELLS from 'common/SPELLS/classic/priest';

/**
 * Penance registers the healing or damage 'tick' as a cast in logs but not the channeled spell
 */

const NEW_PENANCE_TIMEOUT = 3500;
const PENANCE_BOLT_COUNT = 3;

interface PenanceBeginChannelEvent extends BeginChannelEvent {
  penanceCastEvents: CastEvent[];
}

function isPenanceEvent(event: AnyEvent) {
  return (
    event.type === EventType.Cast &&
    (event.ability?.guid === SPELLS.PENANCE_HEALING.id ||
      event.ability?.guid === SPELLS.PENANCE_DAMAGE.id)
  );
}

function createBeginChannelEvent(event: CastEvent): PenanceBeginChannelEvent {
  const beginChannel: PenanceBeginChannelEvent = {
    ...event,
    type: EventType.BeginChannel,
    isCancelled: true,
    trigger: event,
    __fabricated: true,
    penanceCastEvents: [],
  };
  return beginChannel;
}

function createEndChannelEvent(
  event: CastEvent,
  beginChannelEvent: PenanceBeginChannelEvent,
): EndChannelEvent {
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

function isNewPenance(event: CastEvent, beginChannelEvent?: PenanceBeginChannelEvent) {
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
  static dependencies = {
    ...EventsNormalizer.dependencies,
    // To normalize fabricated pre-pull events
    prePullCooldowns: PrePullCooldowns,
  };

  beginChannelEvent?: PenanceBeginChannelEvent;

  normalize(events: AnyEvent[]) {
    const fixedEvents: AnyEvent[] = [];

    events.forEach((event: AnyEvent, index: number) => {
      if (event.type === EventType.Cast && isPenanceEvent(event)) {
        // Check to see if this is a new penance cast
        if (isNewPenance(event, this.beginChannelEvent)) {
          // This is a new penance, so inject a BeginChannelEvent
          this.beginChannelEvent = createBeginChannelEvent(event);
          fixedEvents.push(this.beginChannelEvent);
        }

        this.beginChannelEvent?.penanceCastEvents.push(event);

        if (
          this.beginChannelEvent &&
          this.beginChannelEvent.penanceCastEvents.length === PENANCE_BOLT_COUNT
        ) {
          const endChannelEvent = createEndChannelEvent(event, this.beginChannelEvent);
          fixedEvents.push(endChannelEvent);
        }
        // To fix an interaction with the GCD analyzer, omit all cast events except the first.
        if (
          event.type === EventType.Cast &&
          this.beginChannelEvent &&
          this.beginChannelEvent.penanceCastEvents[0] !== event
        ) {
          return;
        }
      }
      fixedEvents.push(event);
    });
    return fixedEvents;
  }
}

export default PenanceNormalizer;
