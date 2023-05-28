import HIT_TYPES from 'game/HIT_TYPES';
import {
  Ability,
  AnyEvent,
  ApplyBuffEvent,
  EventType,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import SPELLS from 'common/SPELLS/classic/hunter';

/**
 * Kill Command applies an invisible buff in-game whenever the player crits.
 * Since we want to track it better, we fabricate a buff in its place to make
 * other modules easier to write.
 *
 * Research:
 * - Every crit triggers a 5 second invisible buff that allows casting kill
 * command
 * - This buff is not consumed on cast
 * - This buff duration is refreshed for 5 sec by additional crits
 */
class KillCommandNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]) {
    let buffEndTimestamp: number | undefined;

    const playerId = this.owner.playerId;
    const buffDuration = 5 * 1000;
    const ability: Ability = {
      abilityIcon: 'ability_hunter_killcommand',
      guid: SPELLS.KILL_COMMAND.id,
      name: 'Kill Command',
      type: 2,
    };

    return events.reduce<AnyEvent[]>((newEvents, event: AnyEvent) => {
      if (buffEndTimestamp !== undefined && event.timestamp > buffEndTimestamp) {
        const newEvent: RemoveBuffEvent = {
          ability,
          targetID: playerId,
          targetIsFriendly: true,
          sourceID: playerId,
          sourceIsFriendly: true,
          type: EventType.RemoveBuff,
          timestamp: buffEndTimestamp,
          __fabricated: true,
        };

        newEvents.push(newEvent);
        buffEndTimestamp = undefined;
      }

      newEvents.push(event);

      if (
        event.type === EventType.Damage &&
        event.sourceID === playerId &&
        (event.hitType === HIT_TYPES.CRIT || event.hitType === HIT_TYPES.BLOCKED_CRIT)
      ) {
        if (buffEndTimestamp) {
          const newEvent: RefreshBuffEvent = {
            ability,
            targetID: playerId,
            targetIsFriendly: true,
            sourceID: playerId,
            sourceIsFriendly: true,
            type: EventType.RefreshBuff,
            timestamp: event.timestamp,
            __fabricated: true,
          };

          newEvents.push(newEvent);
        } else {
          const newEvent: ApplyBuffEvent = {
            ability,
            targetID: playerId,
            targetIsFriendly: true,
            sourceID: playerId,
            sourceIsFriendly: true,
            type: EventType.ApplyBuff,
            timestamp: event.timestamp,
            __fabricated: true,
          };

          newEvents.push(newEvent);
        }
        buffEndTimestamp = event.timestamp + buffDuration;
      }

      return newEvents;
    }, []);
  }
}
export default KillCommandNormalizer;
