import EventsNormalizer from 'parser/core/EventsNormalizer';
import { AnyEvent, HasAbility } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/paladin';
import TALENTS from 'common/TALENTS/paladin';

const convertGoAQ = (event: AnyEvent): AnyEvent => {
  if (HasAbility(event) && event.ability.guid === SPELLS.GUARDIAN_OF_ANCIENT_KINGS_QUEEN.id) {
    return {
      ...event,
      ability: {
        abilityIcon: TALENTS.GUARDIAN_OF_ANCIENT_KINGS_TALENT.icon,
        guid: TALENTS.GUARDIAN_OF_ANCIENT_KINGS_TALENT.id,
        name: TALENTS.GUARDIAN_OF_ANCIENT_KINGS_TALENT.name,
        type: 2,
      },
    };
  }
  return event;
};

export default class GuardianOfAncientQueens extends EventsNormalizer {
  normalize(events: AnyEvent[]): AnyEvent[] {
    return events.map(convertGoAQ);
  }
}
