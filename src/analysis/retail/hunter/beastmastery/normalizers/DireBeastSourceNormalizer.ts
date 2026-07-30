import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import { AnyEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { MS_BUFFER_50, MS_BUFFER_100 } from '../../shared/constants';

/**
 * Every Dire Beast summon (whether from the base Dire Beast talent's bleed proc, the Dire
 * Command talent proccing off Kill Command, or the Beast Mastery 4-Set bonus proccing off
 * Bestial Wrath) shares the same generic `cast` marker (SPELLS.DIRE_BEAST_CAST). This relabels
 * that marker to whichever source actually caused it, based on timing proximity, so the
 * Timeline shows the source rather than the same generic icon for every summon.
 */
class DireBeastSourceNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]) {
    let lastBestialWrathCast = -Infinity;
    let lastKillCommandCast = -Infinity;

    return events.map((event) => {
      if (event.type === EventType.Cast) {
        if (event.ability.guid === TALENTS.BESTIAL_WRATH_TALENT.id) {
          lastBestialWrathCast = event.timestamp;
        } else if (event.ability.guid === TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT.id) {
          lastKillCommandCast = event.timestamp;
        }
      }

      if (event.type !== EventType.Cast || event.ability.guid !== SPELLS.DIRE_BEAST_CAST.id) {
        return event;
      }

      if (event.timestamp - lastBestialWrathCast <= MS_BUFFER_100) {
        return {
          ...event,
          ability: {
            ...event.ability,
            guid: SPELLS.MID1_4P_BONUS_BEAST_MASTERY.id,
            name: SPELLS.MID1_4P_BONUS_BEAST_MASTERY.name,
            abilityIcon: SPELLS.MID1_4P_BONUS_BEAST_MASTERY.icon,
          },
          __modified: true,
        };
      }

      if (event.timestamp - lastKillCommandCast <= MS_BUFFER_50) {
        return {
          ...event,
          ability: {
            ...event.ability,
            guid: TALENTS.DIRE_COMMAND_TALENT.id,
            name: TALENTS.DIRE_COMMAND_TALENT.name,
            abilityIcon: TALENTS.DIRE_COMMAND_TALENT.icon,
          },
          __modified: true,
        };
      }

      return event;
    });
  }
}

export default DireBeastSourceNormalizer;
