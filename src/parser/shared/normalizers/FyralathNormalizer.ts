import SPELLS from 'common/SPELLS';
import { AnyEvent, BeginChannelEvent, EndChannelEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import InsertableEventsWrapper from 'parser/core/InsertableEventsWrapper';

/**
 * Normalizes Rage of Fyr'alath casts to include BeginChannel and EndChannel events.
 */
export class FyralathNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]) {
    const eventsInserter = new InsertableEventsWrapper(events);

    events.forEach((event, index) => {
      if (event.type === EventType.Cast && event.ability.guid === SPELLS.RAGE_OF_FYRALATH_1.id) {
        const beginChannel: BeginChannelEvent = {
          type: EventType.BeginChannel,
          ability: event.ability,
          timestamp: event.timestamp,
          sourceID: event.sourceID,
          isCancelled: false,
          trigger: event,
          targetIsFriendly: event.targetIsFriendly,
          sourceIsFriendly: event.sourceIsFriendly,
          targetID: event.targetID,
        };

        eventsInserter.addAfterEvent(beginChannel, event);

        let latest = null;

        for (let i = index + 1; i < events.length; i = i + 1) {
          const nextEvent = events[i];

          // We've ran out of events
          if (nextEvent === null) {
            if (latest == null) {
              // Take last event as latest
              latest = events[events.length - 1];
            }
            break;
          }

          // If we have done this for 3 seconds , we can assume it's the end of the channel
          if (nextEvent.timestamp - beginChannel.timestamp > 3000) {
            if (latest == null) {
              // Take last event as latest
              latest = nextEvent;
            }
            break;
          }

          // Include all damage events from the Fyralath Cast
          if (
            nextEvent.type === EventType.Damage &&
            (nextEvent.ability.guid === SPELLS.RAGE_OF_FYRALATH_DAMAGE_1.id ||
              nextEvent.ability.guid === SPELLS.RAGE_OF_FYRALATH_DAMAGE_2.id)
          ) {
            latest = nextEvent;
            continue;
          }

          // When you eat the debuffs off the enemies, you gain a buff that increases the
          // damage of the final explosion. After the final explosion, the buff is removed.
          // This should be the main trigger to end the channel, all above are fallbacks.
          if (
            nextEvent.type === EventType.RemoveBuff &&
            nextEvent.ability.guid === SPELLS.RAGE_OF_FYRALATH_BUFF.id
          ) {
            latest = nextEvent;
            continue;
          }
        }

        if (latest) {
          const endChannel: EndChannelEvent = {
            type: EventType.EndChannel,
            ability: beginChannel.ability,
            timestamp: latest.timestamp,
            sourceID: beginChannel.sourceID,
            start: beginChannel.timestamp,
            duration: latest.timestamp - beginChannel.timestamp,
            beginChannel,
            trigger: latest,
          };

          eventsInserter.addAfterEvent(endChannel, latest);
        }
      }
    });

    return eventsInserter.build();
  }
}
