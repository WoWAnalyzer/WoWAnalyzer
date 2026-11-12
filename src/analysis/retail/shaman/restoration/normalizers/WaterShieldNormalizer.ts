import SPELLS from 'common/SPELLS/shaman';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import { AnyEvent, ApplyBuffEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

const WATER_SHIELD_BUFF_EVENTS: EventType[] = [
  EventType.ApplyBuff,
  EventType.RemoveBuff,
  EventType.RefreshBuff,
  EventType.ApplyBuffStack, //Needed if Reactive Warding has been taken
  EventType.RemoveBuffStack, //Needed if Reactive Warding has been taken
];

/**
 * Water Shield that is applied before the pull and never dropped, refreshed or restacked leaves
 * no buff events, and WCL does not always list it in `combatantinfo` either. The shared ApplyBuff
 * normalizer then has nothing to work with and the buff is never tracked.
 *
 * The Water Shield energize (mana gained when hit) can only happen while the buff is up, so an
 * energize seen before any Water Shield buff event means the shield was applied prepull.
 */
class WaterShieldNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]) {
    const playerId = this.owner.playerId;

    for (const event of events) {
      if (
        WATER_SHIELD_BUFF_EVENTS.includes(event.type) &&
        'ability' in event &&
        event.ability.guid === SPELLS.WATER_SHIELD.id &&
        'targetID' in event &&
        event.targetID === playerId
      ) {
        // A real (or already fabricated) buff event comes first.
        return events;
      }

      if (
        event.type === EventType.ResourceChange &&
        event.ability.guid === SPELLS.WATER_SHIELD_ENERGIZE.id &&
        event.targetID === playerId
      ) {
        const applyBuffEvent: ApplyBuffEvent = {
          ability: {
            guid: SPELLS.WATER_SHIELD.id,
            name: SPELLS.WATER_SHIELD.name,
            abilityIcon: SPELLS.WATER_SHIELD.icon,
            type: MAGIC_SCHOOLS.ids.NATURE,
          },
          type: EventType.ApplyBuff,
          timestamp: this.owner.fight.start_time,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: playerId,
          targetIsFriendly: true,
          __fabricated: true,
          prepull: true,
        };
        events.splice(this.getFightStartIndex(events), 0, applyBuffEvent);
        return events;
      }
    }

    return events;
  }
}

export default WaterShieldNormalizer;
