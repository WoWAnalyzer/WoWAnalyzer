import SPELLS from 'common/SPELLS';
import { TALENTS_HUNTER } from 'common/TALENTS';
import { MappedEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

const debug = false;
/**
 * Wailing Arrow can begin casting before combat AND has travel time.
 * This means we don't see the begincast event, and might not even see the cast success event - but we will see the damage event.
 * This normalizer can fabricate both begin cast and cast success events for Wailing Arrow if it's necessary.
 */
class WailingArrowPrepullNormalizer extends EventsNormalizer {
  normalize(events: MappedEvent[]) {
    const fixedEvents: any[] = [];
    let lastBeginCastTimestamp: number | null = null;
    let lastCastSuccessTimestamp: number | null = null;
    events.forEach((event) => {
      if (
        (event.type === EventType.BeginCast ||
          event.type === EventType.Cast ||
          event.type === EventType.Damage) &&
        (event.ability.guid === TALENTS_HUNTER.WAILING_ARROW_TALENT.id ||
          event.ability.guid === SPELLS.WAILING_ARROW_DAMAGE.id)
      ) {
        if (event.type === EventType.BeginCast) {
          lastBeginCastTimestamp = event.timestamp;
        }
        if (event.type === EventType.Cast) {
          lastCastSuccessTimestamp = event.timestamp;
          if (!lastBeginCastTimestamp) {
            debug &&
              console.log(
                'Wailing Arrow cast success without a Begin Cast registered',
                (event.timestamp - this.owner.fight.start_time) / 1000,
                'seconds into combat',
              );
            const fabricatedEvent = {
              ...event,
              timestamp: event.timestamp - 1500,
              type: EventType.BeginCast,
              __fabricated: true,
            };
            fixedEvents.push(fabricatedEvent);
            debug && console.log('Real', event);
            debug && console.log('Fabricated', fabricatedEvent);
          }
        }
        if (event.type === EventType.Damage) {
          if (!lastCastSuccessTimestamp) {
            debug &&
              console.log(
                'Wailing Arrow Damage event without a Cast success registered',
                (event.timestamp - this.owner.fight.start_time) / 1000,
                'seconds into combat',
              );
            const fabricatedBeginCastEvent = {
              ...event,
              ability: {
                name: event.ability.name,
                type: event.ability.type,
                abilityIcon: event.ability.abilityIcon,
                guid: TALENTS_HUNTER.WAILING_ARROW_TALENT.id,
              },
              timestamp: this.owner.fight.start_time - 1500,
              type: EventType.BeginCast,
              __fabricated: true,
            };
            const fabricatedCastEvent = {
              ...event,
              ability: {
                name: event.ability.name,
                type: event.ability.type,
                abilityIcon: event.ability.abilityIcon,
                guid: TALENTS_HUNTER.WAILING_ARROW_TALENT.id,
              },
              timestamp: this.owner.fight.start_time,
              type: EventType.Cast,
              __fabricated: true,
            };
            fixedEvents.push(fabricatedBeginCastEvent);
            fixedEvents.push(fabricatedCastEvent);
            debug && console.log('Real', event);
            debug && console.log('Fabricated BeginCast', fabricatedBeginCastEvent);
            debug && console.log('Fabricated Cast', fabricatedCastEvent);
          }
        }
      }
      fixedEvents.push(event);
    });
    return fixedEvents;
  }
}

export default WailingArrowPrepullNormalizer;
