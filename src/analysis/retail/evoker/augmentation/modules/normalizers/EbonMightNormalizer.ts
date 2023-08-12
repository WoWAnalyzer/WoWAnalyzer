import { AnyEvent, EventType, HasRelatedEvent } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { EBON_MIGHT_APPLY_REMOVE_LINK, EBON_MIGHT_BUFF_LINKS } from './CastLinkNormalizer';
import SPELLS from 'common/SPELLS/evoker';

/** This Normalizer fixes an issue that happens very rarely, where external Ebon Might
 * buffs gets applied twice, this leaves us with twice the amount of ApplyBuffEvents
 * that should be possible.
 *
 * The solution used here is to grab these extra events and turn them into RefreshBuffEvents.
 *
 * The issue described above can be seen here:
 * https://www.warcraftlogs.com/reports/hXcYL7yBrMzKA4Qd/#fight=8&type=auras&pins=0%24Separate%24%23244F4B%24casts%240%240.0.0.Any%24173872654.0.0.Evoker%24true%240.0.0.Any%24false%24395152%5E0%24Separate%24%23909049%24casts%240%240.0.0.Any%24173872654.0.0.Evoker%24true%240.0.0.Any%24false%24403631&target=1&ability=395152&view=events&start=5145354&end=5162301
 *
 * Issue 2:
 * Sometimes you will refresh Ebon Might, and instead of it being refreshed;
 * it will instead remove it and apply it again on the same tick (it didnt run out), this gets
 * annoying for analysis, so we send the RemoveBuff event to the shadowrealm.
 * And turn the ApplyBuff event into a RefreshBuff event.
 *
 * This issue can be seen here:
 * https://www.warcraftlogs.com/reports/GHpC98xbagNvkKnj/#fight=10&type=auras&target=192&pins=0%24Separate%24%23244F4B%24auras-gained%240%240.0.0.Any%24182121290.0.0.Evoker%24true%240.0.0.Any%24false%24395296&ability=395152&view=events&start=13763309&end=13773115
 * */

class EbonMightNormalizer extends EventsNormalizer {
  // Set lower priority to ensure this runs after our CastLinkNormalizer
  priority = 101;
  static dependencies = {
    ...EventsNormalizer.dependencies,
  };
  normalize(events: any[]): any[] {
    const fixedEvents: any[] = [];
    events.forEach((event: AnyEvent, idx: number) => {
      const linkedEvents = HasRelatedEvent(event, EBON_MIGHT_BUFF_LINKS);
      const removeApplyLinks = HasRelatedEvent(event, EBON_MIGHT_APPLY_REMOVE_LINK);
      /** for now I haven't seen the personal buff being applied twice, so we can easily
       * check if the personal and external events are linked, if not change the event. */
      if (
        !linkedEvents &&
        event.type === EventType.ApplyBuff &&
        event.ability.guid === SPELLS.EBON_MIGHT_BUFF_EXTERNAL.id
      ) {
        const fabricatedBuffEvent = {
          ...event,
          type: EventType.RefreshBuff,
          _fabricated: true,
        };
        fixedEvents.push(fabricatedBuffEvent);
      } else if (removeApplyLinks) {
        if (event.type === EventType.ApplyBuff) {
          const fabricatedBuffEvent = {
            ...event,
            type: EventType.RefreshBuff,
            _fabricated: true,
          };
          fixedEvents.push(fabricatedBuffEvent);
        }
      } else {
        fixedEvents.push(event);
      }
    });
    return fixedEvents;
  }
}

export default EbonMightNormalizer;
