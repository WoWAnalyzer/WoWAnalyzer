import SPELLS from 'common/SPELLS/classic';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import { AnyEvent, EventType, HasSource, HasTarget } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

const ARMY_GHOUL_ID = 24207;

export default class ArmyOfTheDead extends EventsNormalizer {
  normalize(events: AnyEvent[]): AnyEvent[] {
    const ghouls = new Set(
      this.owner.playerPets.filter((pet) => pet.guid === ARMY_GHOUL_ID).map((pet) => pet.id),
    );
    const sawArmyGhoul = events.some(
      (event) =>
        (HasSource(event) && ghouls.has(event.sourceID)) ||
        (HasTarget(event) && ghouls.has(event.targetID)),
    );

    if (sawArmyGhoul) {
      return [
        {
          type: EventType.Cast,
          timestamp: this.owner.fight.start_time - 1500,
          ability: {
            guid: SPELLS.ARMY_OF_THE_DEAD.id,
            name: SPELLS.ARMY_OF_THE_DEAD.name,
            abilityIcon: SPELLS.ARMY_OF_THE_DEAD.icon,
            type: MAGIC_SCHOOLS.ids.PHYSICAL,
          },
          sourceID: this.owner.selectedCombatant.id,
          sourceIsFriendly: true,
          prepull: true,
          __fabricated: true,
        },
        ...events,
      ];
    } else {
      return events;
    }
  }
}
