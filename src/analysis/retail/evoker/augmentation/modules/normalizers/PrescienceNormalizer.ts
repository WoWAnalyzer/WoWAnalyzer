import { AnyEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { PRESCIENCE_APPLY_REMOVE_LINK } from './CastLinkNormalizer';
import Combatants from 'parser/shared/modules/Combatants';

/** This normalizer removes the applybuff and removebuff from unwanted target
 * This is targets like light's hammer and pets; these only inherit the buff from
 * the main target - which only makes analysis harder. */

class PrescienceNormalizer extends EventsNormalizer {
  static dependencies = {
    ...EventsNormalizer.dependencies,
    combatants: Combatants,
  };
  protected combatants!: Combatants;
  normalize(events: AnyEvent[]): AnyEvent[] {
    const fixedEvents: AnyEvent[] = [];
    events.forEach((event: AnyEvent, idx: number) => {
      const linkedEvents = event._linkedEvents?.find(
        (x) => x.relation === PRESCIENCE_APPLY_REMOVE_LINK,
      );
      if (linkedEvents) {
        if (
          (event.type === EventType.ApplyBuff || event.type === EventType.RemoveBuff) &&
          this.combatants.players[event.targetID]
        ) {
          fixedEvents.push(event);
        }
      } else {
        fixedEvents.push(event);
      }
    });
    return fixedEvents;
  }
}

export default PrescienceNormalizer;
