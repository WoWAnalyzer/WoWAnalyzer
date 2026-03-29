import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import { AnyEvent, ApplyBuffEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import Combatants from 'parser/shared/modules/Combatants';

class EarthShieldNormalizer extends EventsNormalizer {
  static dependencies = {
    ...EventsNormalizer.dependencies,
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  normalize(events: AnyEvent[]) {
    const seenApplyBuff = new Set<number>();
    const fabricatedEvents: ApplyBuffEvent[] = [];

    const validBuffIds = [
      TALENTS.EARTH_SHIELD_TALENT.id,
      SPELLS.EARTH_SHIELD_ELEMENTAL_ORBIT_BUFF.id,
    ];

    for (const event of events) {
      if (
        event.type === EventType.ApplyBuff &&
        event.sourceID === this.owner.playerId &&
        validBuffIds.includes(event.ability.guid)
      ) {
        seenApplyBuff.add(event.targetID);
      }

      if (
        event.type === EventType.Heal &&
        event.sourceID === this.owner.playerId &&
        event.ability.guid === SPELLS.EARTH_SHIELD_HEAL.id &&
        !seenApplyBuff.has(event.targetID)
      ) {
        seenApplyBuff.add(event.targetID);
        const startTime = this.owner.fight.start_time - 1000;
        const isSelf = event.targetID === this.owner.playerId;
        const hasElementalOrbit = this.combatants.selected.hasTalent(
          TALENTS.ELEMENTAL_ORBIT_TALENT,
        );

        let buffId = TALENTS.EARTH_SHIELD_TALENT.id;
        let buffName = TALENTS.EARTH_SHIELD_TALENT.name;
        let buffIcon = TALENTS.EARTH_SHIELD_TALENT.icon;

        if (isSelf && hasElementalOrbit) {
          buffId = SPELLS.EARTH_SHIELD_ELEMENTAL_ORBIT_BUFF.id;
          buffName = SPELLS.EARTH_SHIELD_ELEMENTAL_ORBIT_BUFF.name;
          buffIcon = SPELLS.EARTH_SHIELD_ELEMENTAL_ORBIT_BUFF.icon;
        }

        const applyBuffEvent: ApplyBuffEvent = {
          ability: {
            guid: buffId,
            name: buffName,
            abilityIcon: buffIcon,
            type: MAGIC_SCHOOLS.ids.NATURE,
          },
          type: EventType.ApplyBuff,
          timestamp: startTime,
          sourceID: this.owner.playerId,
          sourceIsFriendly: true,
          targetIsFriendly: true,
          targetID: event.targetID,
          __fabricated: true,
          prepull: true,
        };

        fabricatedEvents.push(applyBuffEvent);
      }
    }

    if (fabricatedEvents.length > 0) {
      events.unshift(...fabricatedEvents);
    }

    return events;
  }
}

export default EarthShieldNormalizer;
