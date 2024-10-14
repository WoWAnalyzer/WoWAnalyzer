import SPELLS from 'common/SPELLS/shaman';
import { AnyEvent, ApplyBuffEvent, CastEvent, EventType, SummonEvent } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import Combatants from 'parser/shared/modules/Combatants';
import {
  SURGING_TOTEM_BUFFER_MS,
  SURGING_TOTEM_DURATION,
  WHIRLING_ELEMENTS_MOTES,
} from 'analysis/retail/shaman/restoration/constants';
import NPCS from 'common/NPCS/shaman';
import Spell from 'common/SPELLS/Spell';

class SurgingTotemPrePullNormalizer extends EventsNormalizer {
  static dependencies = {
    ...EventsNormalizer.dependencies,
    combatants: Combatants,
  };

  protected combatants!: Combatants;
  normalize(events: AnyEvent[]) {
    // Find the Surging Totem based on NPC id from the current player's pet list.
    const targetNPC = this.owner.playerPets.find(
      (npc: { guid: number | undefined }) => npc.guid === NPCS.SURGING_TOTEM.id,
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
      if (
        event.timestamp >
        this.owner.fight.start_time + SURGING_TOTEM_DURATION + SURGING_TOTEM_BUFFER_MS
      ) {
        break;
      }

      // Start time should be before the start of the fight.
      const startTime: number =
        this.owner.fight.start_time -
        (SURGING_TOTEM_DURATION -
          (event.timestamp - this.owner.fight.start_time - SURGING_TOTEM_BUFFER_MS));

      // Fabricate a events as they happen when a Surging Totem is cast in the correct sequence.
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

      events.splice(0, 0, summonSurgingTotemEvent);
      events.splice(0, 0, castSurgingTotemEvent);
      events.splice(0, 0, castHealingRainEvent);

      WHIRLING_ELEMENTS_MOTES.forEach((spell: Spell) => {
        const applyBuffEvent: ApplyBuffEvent = {
          ability: {
            guid: spell.id,
            name: spell.name,
            abilityIcon: spell.icon,
            type: MAGIC_SCHOOLS.ids.PHYSICAL,
          },
          type: EventType.ApplyBuff,
          timestamp: startTime,
          sourceID: this.owner.playerId,
          sourceIsFriendly: true,
          targetIsFriendly: true,
          targetID: this.owner.playerId,
          __fabricated: true,
          prepull: true,
        };

        events.splice(0, 0, applyBuffEvent);
      });
      break;
    }

    return events;
  }
}
export default SurgingTotemPrePullNormalizer;
