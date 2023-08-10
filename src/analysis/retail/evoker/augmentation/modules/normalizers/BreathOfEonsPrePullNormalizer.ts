import { AnyEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import TALENTS from 'common/TALENTS/evoker';

/** This Normalizer is used to deal with pre-pull Breath of Eons
 * When you used Breath of Eons pre-pull you won't create a Cast event
 * This makes analysis a bit messy.
 *
 * The solution used here is to simply look for the first event related to Breath of Eons
 * and if it's not a Cast event, fabricate one.
 *
 * An example of pre-pull Breath of Eons can be seen here:
 * https://www.warcraftlogs.com/reports/TBmZYxjR1p2kgKtJ/#fight=1&source=20
 */

class BreathOfEonsPrePullNormalizer extends EventsNormalizer {
  static dependencies = {
    ...EventsNormalizer.dependencies,
  };
  normalize(events: any[]): any[] {
    const fixedEvents: any[] = [];
    let castFound = false;

    events.forEach((event: AnyEvent, idx: number) => {
      if (
        !castFound &&
        (event.type === EventType.ApplyBuff ||
          event.type === EventType.RemoveBuff ||
          event.type === EventType.Cast) &&
        event.ability.guid === TALENTS.BREATH_OF_EONS_TALENT.id
      ) {
        // If the buff is removed before we find the start event
        // Fabricate BuffApply event at fight start
        if (event.type !== EventType.Cast) {
          if (event.type === EventType.RemoveBuff) {
            const fabricatedApplyBuffEvent = {
              ...event,
              timestamp: this.owner.fight.start_time,
              type: EventType.ApplyBuff,
              _fabricated: true,
            };
            fixedEvents.push(fabricatedApplyBuffEvent);
          }

          // Fabricate the Cast event at fight start
          const fabricatedCastEvent = {
            ...event,
            timestamp: this.owner.fight.start_time,
            type: EventType.Cast,
            _fabricated: true,
          };
          fixedEvents.push(fabricatedCastEvent);
        }
        // Mark that we have either found or fabricated the neccessary event(s)
        castFound = true;

        fixedEvents.push(event);
      } else {
        fixedEvents.push(event);
      }
    });
    return fixedEvents;
  }
}

export default BreathOfEonsPrePullNormalizer;
