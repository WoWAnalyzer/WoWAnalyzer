import {
  AnyEvent,
  BeginChannelEvent,
  CastEvent,
  DamageEvent,
  EndChannelEvent,
  EventType,
} from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import SPELLS from 'common/SPELLS/classic/mage';

/**
 * Arcane Missiles registers the 'tick' as a cast in logs but not the channeled spell.
 * Add a beginchannel event for the first 'tick' and change the id.
 * Subsequent ids are treated as 'ticks'.
 */

const NEW_ARCANE_MISSILES_TIMEOUT = 5000;
const ARCANE_MISSILES_BOLT_COUNT = 5;

interface ArcaneMissilesBeginChannelEvent extends BeginChannelEvent {
  arcaneMissilesCastEvents: CastEvent[];
  arcaneMissilesDamageEvents: DamageEvent[];
}

function isArcaneMissilesEvent(event: AnyEvent) {
  return (
    (event.type === EventType.Cast || event.type === EventType.Damage) &&
    event.ability?.guid === SPELLS.ARCANE_MISSILES.id
  );
}

function createBeginChannelEvent(event: CastEvent): ArcaneMissilesBeginChannelEvent {
  const beginChannel: ArcaneMissilesBeginChannelEvent = {
    ...event,
    type: EventType.BeginChannel,
    isCancelled: true,
    trigger: event,
    __fabricated: true,
    arcaneMissilesCastEvents: [],
    arcaneMissilesDamageEvents: [],
  };
  return beginChannel;
}

function createEndChannelEvent(
  event: CastEvent,
  beginChannelEvent: ArcaneMissilesBeginChannelEvent,
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

function isNewArcaneMissiles(
  event: CastEvent,
  beginChannelEvent?: ArcaneMissilesBeginChannelEvent,
) {
  if (!beginChannelEvent) {
    return true;
  }
  if (event.timestamp - NEW_ARCANE_MISSILES_TIMEOUT > beginChannelEvent?.timestamp) {
    return true;
  }
  if (beginChannelEvent.arcaneMissilesCastEvents.length >= ARCANE_MISSILES_BOLT_COUNT) {
    return true;
  }
}

// Creates BeginChannel and EndChannel events for all arcane missiles casts by the selected player.
class ArcaneMissilesNormalizer extends EventsNormalizer {
  beginChannelEvent?: ArcaneMissilesBeginChannelEvent;

  normalize(events: AnyEvent[]) {
    const fixedEvents: AnyEvent[] = [];

    events.forEach((event: AnyEvent, index: number) => {
      if (event.type === EventType.Cast && isArcaneMissilesEvent(event)) {
        // Check to see if this is a new arcane missiles cast
        if (isNewArcaneMissiles(event, this.beginChannelEvent)) {
          // This is a new arcane missiles, so inject a BeginChannelEvent
          this.beginChannelEvent = createBeginChannelEvent(event);
          fixedEvents.push(this.beginChannelEvent);
        }

        this.beginChannelEvent?.arcaneMissilesCastEvents.push(event);

        if (
          this.beginChannelEvent &&
          this.beginChannelEvent.arcaneMissilesCastEvents.length === ARCANE_MISSILES_BOLT_COUNT
        ) {
          const endChannelEvent = createEndChannelEvent(event, this.beginChannelEvent);
          fixedEvents.push(endChannelEvent);
        }

        // to fix an interaction with the GCD analyzer, we are going to omit all cast events except the first.
        if (
          event.type === EventType.Cast &&
          this.beginChannelEvent &&
          this.beginChannelEvent.arcaneMissilesCastEvents[0] !== event
        ) {
          return;
        }
      }
      if (event.type === EventType.Damage && isArcaneMissilesEvent(event)) {
        this.beginChannelEvent?.arcaneMissilesDamageEvents.push(event);
      }
      fixedEvents.push(event);
    });
    return fixedEvents;
  }
}

export default ArcaneMissilesNormalizer;
