import SPELLS from 'common/SPELLS/shaman';
import { AnyEvent, CastEvent, EventType, SummonEvent } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import Combatants from 'parser/shared/modules/Combatants';

/**
 * We detect the totem based on the NPC id used in the death event.
 *
 * https://www.wowhead.com/npc=225409/surging-totem
 */
const SURGING_TOTEM_NPC_ID = 225409;
const SURGING_TOTEM_DURATION_MS = 24000;

class SurgingTotemPrePullNormalizer extends EventsNormalizer {
  static dependencies = {
    ...EventsNormalizer.dependencies,
    combatants: Combatants,
  };

  protected combatants!: Combatants;
  normalize(events: AnyEvent[]) {
    // Find the Surging Totem based on NPC id from the current player's pet list.
    const targetNPC = this.owner.playerPets.find(
      (npc: { guid: number | undefined }) => npc.guid === SURGING_TOTEM_NPC_ID,
    );

    // Ensure the player has used Surging totem before going through the Pre Pull Normalizer.
    if (!targetNPC) {
      return events;
    }

    for (let eventIdx = 0; eventIdx < events.length; eventIdx += 1) {
      const event = events[eventIdx];

      // The totem 'dies' upon expiration.
      if (event.type !== EventType.Death || event.targetID !== targetNPC.id) {
        continue;
      }

      // Stop parsing events after the duration of the totem has elapsed.
      if (event.timestamp > this.owner.fight.start_time + SURGING_TOTEM_DURATION_MS) {
        break;
      }

      // Start time should be before the start of the fight.
      const startTime =
        this.owner.fight.start_time -
        (SURGING_TOTEM_DURATION_MS - (event.timestamp - this.owner.fight.start_time));

      // Fabricate a casts as they happen when a Surging Totem is placed.
      const castHealingRainEvent: CastEvent = {
        ability: {
          guid: SPELLS.HEALING_RAIN_TOTEMIC.id,
          name: SPELLS.HEALING_RAIN_TOTEMIC.name,
          abilityIcon: SPELLS.HEALING_RAIN_TOTEMIC.icon,
          type: MAGIC_SCHOOLS.ids.NATURE,
        },
        type: EventType.Cast,
        timestamp: startTime,
        sourceID: this.owner.playerId,
        sourceIsFriendly: true,
        targetIsFriendly: true,
        targetID: -1,
        __fabricated: true,
        prepull: true,
      };

      const castSurgingTotemEvent: CastEvent = {
        ability: {
          guid: SPELLS.SURGING_TOTEM.id,
          name: SPELLS.SURGING_TOTEM.name,
          abilityIcon: SPELLS.SURGING_TOTEM.icon,
          type: MAGIC_SCHOOLS.ids.NATURE,
        },
        type: EventType.Cast,
        timestamp: startTime,
        sourceID: this.owner.playerId,
        sourceIsFriendly: true,
        targetIsFriendly: true,
        targetID: -1,
        __fabricated: true,
        prepull: true,
      };

      const summonSurgingTotemEvent: SummonEvent = {
        ability: {
          guid: SPELLS.SURGING_TOTEM.id,
          name: SPELLS.SURGING_TOTEM.name,
          abilityIcon: SPELLS.SURGING_TOTEM.icon,
          type: MAGIC_SCHOOLS.ids.NATURE,
        },
        targetInstance: 2,
        type: EventType.Summon,
        timestamp: startTime,
        sourceID: this.owner.playerId,
        sourceIsFriendly: true,
        targetIsFriendly: true,
        targetID: -1,
        __fabricated: true,
        prepull: true,
      };

      events.splice(0, 0, castHealingRainEvent);
      events.splice(0, 0, castSurgingTotemEvent);
      events.splice(0, 0, summonSurgingTotemEvent);
      break;
    }

    return events;
  }
}
export default SurgingTotemPrePullNormalizer;
