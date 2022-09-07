import SPELLS from 'common/SPELLS';
import { AnyEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

const MAX_DELAY = 200;

/*
 * The Incarnation: Tree of Life talent can show strangely in events.
 * a 'cast' with INCARNATION_TREE_OF_LIFE_TALENT id shows up on activating the talent, BUT ALSO ON REAQUIRING THE FORM DURING THE BUFF.
 * This can casue Incarnation cast events to show up in places we don't expect, and can throw off tracking and cast efficiency.
 *
 * Incarnation produces two buffs. The INCARNATION_TREE_OF_LIFE_TALENT id buff tracks if the player is in Incarnation form (as opposed to the other druid forms)
 * The INCARNATION_TOL_ALLOWED id buff tracks if the player is ALLOWED to assume Incarnation form, this is applied both by the talent and the legendary.
 * We can discern real casts from form reassumption by checking for proximity to application of INCARNATION_TOL_ALLOWED.
 * Casts that happen just before application of INCARNATION_TOL_ALLOWED are real, all others are form reassumption.
 *
 * This Normalizer deletes all the form reassumption events. Form can still be tracked using the INCARNATION_TREE_OF_LIFE_TALENT buff.
 */
class TreeOfLifeNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]) {
    const fixedEvents: AnyEvent[] = [];
    events.forEach((event, eventIndex) => {
      fixedEvents.push(event);

      if (
        event.type === EventType.Cast &&
        event.ability.guid === SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id
      ) {
        const castTimestamp = event.timestamp;

        // Look ahead through the events to see if there is an INCARNATION_TOL_ALLOWED application within a brief buffer period
        for (
          let nextEventIndex = eventIndex;
          nextEventIndex < events.length - 1;
          nextEventIndex += 1
        ) {
          const nextEvent = events[nextEventIndex];
          if (nextEvent.timestamp - castTimestamp > MAX_DELAY) {
            // No INCARNATION_TOL_ALLOWED application found within buffer, meaining this is a form reassumption: delete the event
            fixedEvents.pop();
            break;
          } else if (
            nextEvent.type === EventType.ApplyBuff &&
            nextEvent.ability.guid === SPELLS.INCARNATION_TOL_ALLOWED.id
          ) {
            // INCARNATION_TOL_ALLOWED application found, this cast event stays
            break;
          }
        }
      }
    });

    return fixedEvents;
  }
}
export default TreeOfLifeNormalizer;
