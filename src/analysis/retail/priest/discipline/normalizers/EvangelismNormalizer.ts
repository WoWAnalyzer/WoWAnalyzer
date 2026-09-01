import { AnyEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { TALENTS_PRIEST } from 'common/TALENTS';

const BUFFER = 10; // ms to check if Radiance was triggered by Evangelism

/** Normalizes Power Word: Radiance cast events which occur at the same timestamp as Evangelism.
 * When PW:R is triggered by casting Evangelism, it creates a BeginCast event and a Cast event at the same timestamp.
 * We need to convert the PW:R Cast event to a FreeCast to not trigger the ability cooldown and
 * delete the PW:R BeginCast to not trigger the GCD.
 */

// FIXME: Convering PW:R to FreeCast causes those casts to not be counted in the statistics view. However, they are counted in WCL as casts of the ability,
//  so this may cause confusion when reviewing # of casts and CPM.

class EvangelismNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]) {
    const fixedEvents: AnyEvent[] = [];
    const radianceId = TALENTS_PRIEST.POWER_WORD_RADIANCE_TALENT.id;
    const evangId = TALENTS_PRIEST.EVANGELISM_TALENT.id;
    const relevantIds = [radianceId, evangId];
    let deletedEvents = 0;

    events.forEach((event: AnyEvent, index: number) => {
      // Ignore all events that are not Cast/BeginCast
      fixedEvents.push(event);
      if (event.type !== EventType.Cast && event.type !== EventType.BeginCast) {
        return;
      }

      // Ignore all Cast/BeginCast events that are not Evangelism or PW:Radiance
      const spellId = event.ability.guid;
      if (!relevantIds.includes(spellId)) {
        return;
      }

      // When we find an Evangelism, we loop backwards until we find the preceding PW:Radiance events at the same timestamp.
      // The Cast event is converted to a FreeCast and the BeginCast event is removed from the FixedEvents.
      // Keep track of the number of deletedEvents to not create counting errors when deleting further events past the first.
      if (spellId == evangId) {
        console.log('For ' + event.ability.name + ' at timestamp ' + event.timestamp / 1000);
        for (let loopIndex = index; loopIndex >= 0; loopIndex--) {
          const eventToCheck = events[loopIndex];
          if (eventToCheck.type !== EventType.Cast && eventToCheck.type !== EventType.BeginCast) {
            continue;
          }
          if (eventToCheck.ability.guid !== radianceId) {
            continue;
          }
          if (Math.abs(eventToCheck.timestamp - event.timestamp) > BUFFER) {
            break;
          }
          if (eventToCheck.type === EventType.Cast) {
            //convert to freecast
            fixedEvents.splice(loopIndex - deletedEvents, 1, {
              ...eventToCheck,
              type: EventType.FreeCast,
              __modified: true,
            });
            continue;
          }
          if (eventToCheck.type === EventType.BeginCast) {
            //drop cast
            fixedEvents.splice(loopIndex - deletedEvents, 1);
            deletedEvents++;
            break;
          }
        }
      }
    });
    return fixedEvents;
  }
}
export default EvangelismNormalizer;
