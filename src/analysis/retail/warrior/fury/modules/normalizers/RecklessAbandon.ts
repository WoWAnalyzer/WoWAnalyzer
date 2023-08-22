import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
import { AbilityEvent, AnyEvent } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { Options } from 'parser/core/Module';

function abilityEvent(event: AnyEvent): event is AbilityEvent<any> {
  return (event as AbilityEvent<any>).ability != null;
}

/**
 * Normalizer to replace any casts of Bloodbath with Bloodthirst, and any casts of Crushing Blow with Raging Blow.
 *
 * This makes tracking of cooldowns and casts easier.
 */
class RecklessAbandonNormalizer extends EventsNormalizer {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.RECKLESS_ABANDON_TALENT);
  }

  normalize(events: AnyEvent[]): AnyEvent[] {
    events.forEach((event) => {
      if (abilityEvent(event)) {
        if (event.ability.guid === SPELLS.BLOODBATH.id) {
          event.ability = {
            name: SPELLS.BLOODTHIRST.name,
            guid: SPELLS.BLOODTHIRST.id,
            abilityIcon: `${SPELLS.BLOODTHIRST.icon}.jpg`,
            type: event.ability.type,
          };
        } else if (event.ability.guid === SPELLS.CRUSHING_BLOW.id) {
          event.ability = {
            guid: SPELLS.RAGING_BLOW.id,
            name: SPELLS.RAGING_BLOW.name,
            abilityIcon: `${SPELLS.RAGING_BLOW.icon}.jpg`,
            type: event.ability.type,
          };
        }
      }
      return event as AnyEvent;
    });

    return events;
  }
}

export default RecklessAbandonNormalizer;
