import SPELLS from 'common/SPELLS';
import { EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

const MAX_DELAY = 17500;
const CBT_DELAY = 15000;
const debug = false;

/*
 * Cloudburst Totem had some weird behaviour (even if it rarely happens),
 * because of that you can have a cast event without heal events.
 * This happens if everyone in range is at 100% HP, it will just not heal at all.
 *
 * That throws off the CooldownThroughputTracker, gathering all events
 * until the CBT after that explodes and giving results that are completely wrong.
 *
 * This Normalizer creates a 100% overhealed healing event where the heal would have been,
 * if no healing events happened within 20 seconds after casting the totem.
 */

class CloudburstNormalizer extends EventsNormalizer {
  fabricatedEvent = null;

  normalize(events) {
    const fixedEvents = [];
    events.forEach((event, eventIndex) => {
      if (this.fabricatedEvent) {
        if (event.timestamp >= this.fabricatedEvent.timestamp) {
          fixedEvents.push(this.fabricatedEvent);
          this.fabricatedEvent = null;
        }
      }

      fixedEvents.push(event);

      if (
        event.type === EventType.Cast &&
        event.ability.guid === SPELLS.CLOUDBURST_TOTEM_TALENT.id
      ) {
        const castTimestamp = event.timestamp;
        let recallTimestamp = null;

        // Look ahead through the events to see if there is an CLOUDBURST_TOTEM_HEAL within a 20 second period
        for (
          let nextEventIndex = eventIndex + 1;
          nextEventIndex < events.length - 1;
          nextEventIndex += 1
        ) {
          const nextEvent = events[nextEventIndex];

          if (nextEvent.timestamp - castTimestamp > MAX_DELAY) {
            // No CLOUDBURST_TOTEM_HEAL found within the period, meaning this cast wasn't able to find targets and did not have any healing events -> create a 100% overheal event
            const newTimestamp =
              (recallTimestamp &&
                (recallTimestamp - event.timestamp > CBT_DELAY
                  ? event.timestamp + CBT_DELAY
                  : recallTimestamp)) ||
              event.timestamp + CBT_DELAY;

            debug &&
              this.log(
                `No Cloudburst heal found for cast at ${this.owner.formatTimestamp(
                  event.timestamp,
                )}`,
              );
            this.fabricatedEvent = {
              timestamp: newTimestamp,
              type: EventType.Heal,
              sourceID: event.sourceID,
              targetID: event.sourceID,
              sourceIsFriendly: true,
              targetIsFriendly: true,
              ability: {
                abilityIcon: SPELLS.CLOUDBURST_TOTEM_HEAL.icon,
                guid: SPELLS.CLOUDBURST_TOTEM_HEAL.id,
                name: SPELLS.CLOUDBURST_TOTEM_HEAL.name,
                type: 8,
              },
              amount: 0,
              overheal: 1,
              hitType: 1,
              hitPoints: event.maxHitPoints,
              maxHitPoints: event.maxHitPoints,
              __fabricated: true,
            };
            break;
          } else if (
            nextEvent.type === EventType.Cast &&
            (nextEvent.ability.guid === SPELLS.CLOUDBURST_TOTEM_RECALL.id ||
              nextEvent.ability.guid === SPELLS.CLOUDBURST_TOTEM_TALENT.id)
          ) {
            recallTimestamp = nextEvent.timestamp;
            continue;
          } else if (
            nextEvent.type === EventType.Heal &&
            nextEvent.ability.guid === SPELLS.CLOUDBURST_TOTEM_HEAL.id
          ) {
            // CLOUDBURST_TOTEM_HEAL found, this was fine
            break;
          }
        }
      }
    });

    return fixedEvents;
  }
}
export default CloudburstNormalizer;
