import { AnyEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { PRESCIENCE_APPLY_REMOVE_LINK } from './CastLinkNormalizer';
import Combatants from 'parser/shared/modules/Combatants';

/** This normalizer removes the applybuff and removebuff from unwanted target
 * This is targets like light's hammer and pets; these only inherit the buff from
 * the main target - which only makes analysis harder.
 * This also fixes when the log sometimes applies the buff a second time, right
 * before it removes it, seen here:
 * https://www.warcraftlogs.com/reports/xPazJHL8ApcZv6dh#fight=last&type=auras&pins=0%24Separate%24%23244F4B%24casts%240%240.0.0.Any%24186387984.0.0.Evoker%24true%240.0.0.Any%24false%24409311&source=249&ability=410089&view=events&start=11179569&end=11237544 */

class PrescienceNormalizer extends EventsNormalizer {
  static dependencies = {
    ...EventsNormalizer.dependencies,
    combatants: Combatants,
  };
  protected combatants!: Combatants;
  normalize(events: AnyEvent[]): AnyEvent[] {
    const fixedEvents: AnyEvent[] = [];
    const targetStatus: { [key: number]: boolean } = {};
    events.forEach((event: AnyEvent, idx: number) => {
      const linkedEvents = event._linkedEvents?.find(
        (x) => x.relation === PRESCIENCE_APPLY_REMOVE_LINK,
      );
      if (linkedEvents) {
        if (
          (event.type === EventType.ApplyBuff ||
            event.type === EventType.RemoveBuff ||
            event.type === EventType.RefreshBuff) &&
          this.combatants.players[event.targetID]
        ) {
          if (
            (event.type === EventType.ApplyBuff || event.type === EventType.RefreshBuff) &&
            !targetStatus[event.targetID]
          ) {
            targetStatus[event.targetID] = true;
            fixedEvents.push(event);
          } else if (event.type === EventType.RemoveBuff) {
            targetStatus[event.targetID] = false;
            fixedEvents.push(event);
          }
        }
      } else {
        fixedEvents.push(event);
      }
    });
    return fixedEvents;
  }
}

export default PrescienceNormalizer;
