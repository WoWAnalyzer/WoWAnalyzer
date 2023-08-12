import { AnyEvent, EventType, HasRelatedEvent } from 'parser/core/Events';
import TALENTS from 'common/TALENTS/evoker';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { PRESCIENCE_APPLY_REMOVE_LINK } from './CastLinkNormalizer';
import Combatants from 'parser/shared/modules/Combatants';
import StatTracker from 'parser/shared/modules/StatTracker';
import {
  PRESICENCE_BASE_DURATION_MS,
  TIMEWALKER_BASE_EXTENTION,
} from 'analysis/retail/evoker/augmentation/constants';

/** This normalizer removes the applybuff and removebuff from unwanted target
 * This is targets like light's hammer and pets; these only inherit the buff from
 * the main target - which only makes analysis harder.
 * This also fixes when the log sometimes applies the buff a second time, right
 * before it removes it, seen here:
 * https://www.warcraftlogs.com/reports/xPazJHL8ApcZv6dh#fight=last&type=auras&pins=0%24Separate%24%23244F4B%24casts%240%240.0.0.Any%24186387984.0.0.Evoker%24true%240.0.0.Any%24false%24409311&source=249&ability=410089&view=events&start=11179569&end=11237544
 *
 * Usually Prescience is applied twice before combat if playing optimally, we would
 * like to include these in our analysis, so we need to create pre-pull events for it */

class PrescienceNormalizer extends EventsNormalizer {
  // Set lower priority to ensure this runs after our CastLinkNormalizer
  priority = 101;
  static dependencies = {
    ...EventsNormalizer.dependencies,
    combatants: Combatants,
    stats: StatTracker,
  };
  protected combatants!: Combatants;
  protected stats!: StatTracker;
  normalize(events: any[]): any[] {
    const fixedEvents: any[] = [];
    const targetStatus: { [key: number]: boolean } = {};
    events.forEach((event: AnyEvent, idx: number) => {
      const linkedEvents = HasRelatedEvent(event, PRESCIENCE_APPLY_REMOVE_LINK);
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
          } else if (event.type === EventType.RemoveBuff || event.type === EventType.RefreshBuff) {
            targetStatus[event.targetID] = false;
            fixedEvents.push(event);
            /**Check if the buff was applied pre-combat
             * If it was create a pre-pull cast event
             * We need this event for more accurate analysis */
            const prescienceBuffDuration =
              PRESICENCE_BASE_DURATION_MS *
              (1 + TIMEWALKER_BASE_EXTENTION + this.stats.currentMasteryPercentage);
            if (event.timestamp < this.owner.fight.start_time + prescienceBuffDuration) {
              const fabricatedCastEvent = {
                ...event,
                timestamp: event.timestamp - prescienceBuffDuration,
                ability: {
                  name: event.ability.name,
                  type: event.ability.type,
                  abilityIcon: event.ability.abilityIcon,
                  guid: TALENTS.PRESCIENCE_TALENT.id,
                },
                type: EventType.Cast,
                prepull: true,
                _fabricated: true,
              };
              fixedEvents.push(fabricatedCastEvent);
            }
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
