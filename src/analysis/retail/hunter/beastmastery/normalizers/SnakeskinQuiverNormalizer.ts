import EventsNormalizer from 'parser/core/EventsNormalizer';
import { AnyEvent, CastEvent, DamageEvent, EventType, FreeCastEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import { MS_BUFFER_1500, MS_BUFFER_500 } from 'analysis/retail/hunter/shared/constants';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import { addAdditionalCastInformation } from 'parser/core/EventMetaLib';

/**
 * Inserts fabricated free casts for cobra shot.
 */
class SnakeskinQuiverNormalizer extends EventsNormalizer {
  private readonly cobraShotLookBack = MS_BUFFER_1500;
  private readonly autoShotLookBack = MS_BUFFER_500;
  private lastCobraShot?: CastEvent;
  private lastAutoShot?: DamageEvent;

  normalize(events: AnyEvent[]) {
    if (!this.selectedCombatant.hasTalent(TALENTS.SNAKESKIN_QUIVER_TALENT)) {
      return events;
    }

    const newEvents: AnyEvent[] = [];

    events.forEach((event) => {
      newEvents.push(event);
      if (event.type === EventType.Cast && event.ability.guid === TALENTS.COBRA_SHOT_TALENT.id) {
        this.lastCobraShot = event;
      }

      if (event.type === EventType.Damage && event.ability.guid === SPELLS.AUTO_SHOT.id) {
        this.lastAutoShot = event;
      }

      // look back the last cobra shot and check if it wasn't recent
      // and check for the recent autohit.
      if (
        this.lastCobraShot !== undefined &&
        this.lastAutoShot !== undefined &&
        event.timestamp - this.lastCobraShot.timestamp > this.cobraShotLookBack &&
        event.timestamp - this.lastAutoShot.timestamp < this.autoShotLookBack
      ) {
        const snakeskinQuiverFreecast: FreeCastEvent = {
          ability: {
            name: TALENTS.COBRA_SHOT_TALENT.name,
            type: MAGIC_SCHOOLS.ids.PHYSICAL,
            abilityIcon: TALENTS.COBRA_SHOT_TALENT.icon,
            guid: TALENTS.COBRA_SHOT_TALENT.id,
          },
          sourceID:
            this.lastAutoShot.sourceID !== undefined
              ? this.lastAutoShot.sourceID
              : this.selectedCombatant.id,
          sourceIsFriendly: this.lastAutoShot.sourceIsFriendly,
          targetIsFriendly: this.lastAutoShot.targetIsFriendly,
          type: EventType.FreeCast,
          timestamp: this.lastAutoShot.timestamp,
          __fabricated: true,
        };
        newEvents.push(snakeskinQuiverFreecast);
        addAdditionalCastInformation(snakeskinQuiverFreecast, 'Snakeskin quiver free cast.');
        this.lastCobraShot = undefined;
        this.lastAutoShot = undefined;
      }
    });

    return newEvents;
  }
}

export default SnakeskinQuiverNormalizer;
