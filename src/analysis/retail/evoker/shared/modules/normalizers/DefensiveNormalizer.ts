import { AnyEvent, EventType, HasRelatedEvent, RemoveBuffEvent } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import TALENTS from 'common/TALENTS/evoker';
import { OBSIDIAN_SCALES, RENEWING_BLAZE } from './DefensiveCastLinkNormalizer';

/** ability id, CastLink */
const DEFS_TO_NORMALIZE = new Map<number, string>([
  [TALENTS.OBSIDIAN_SCALES_TALENT.id, OBSIDIAN_SCALES],
  [TALENTS.RENEWING_BLAZE_TALENT.id, RENEWING_BLAZE],
]);

/**
 * This Normalizer fixes an issue that happen with Obsidian Scales buff events in logs.
 * For some reason it will random apply/remove itself during it's uptime, leaving us with a very high amount of "fake"
 * applications/removals.
 *
 * Can be seen here:
 * https://www.warcraftlogs.com/reports/MPNtJATVczmjL782/#fight=19&source=79&type=auras&pins=0%24Separate%24%23244F4B%24casts%240%240.0.0.Any%24186387984.0.0.Evoker%24true%240.0.0.Any%24false%24363916&ability=363916&view=events
 * https://www.warcraftlogs.com/reports/BJ8nt7cW92rVmAg1#fight=46&type=auras&source=1&pins=0%24Separate%24%23244F4B%24casts%240%240.0.0.Any%24176244533.0.0.Evoker%24true%240.0.0.Any%24false%24363916&ability=363916&view=events
 * https://www.warcraftlogs.com/reports/pA82n7MNYm3zZwCF#fight=27&type=auras&source=12&pins=0%24Separate%24%23244F4B%24casts%240%240.0.0.Any%24186387984.0.0.Evoker%24true%240.0.0.Any%24false%24363916&ability=363916&view=events
 *
 * This also happens for Renewing Blaze accumulator buff:
 * https://www.warcraftlogs.com/reports/wXGcj8gNYyfQrvVT/#fight=34&source=5&type=auras&pins=0%24Separate%24%23244F4B%24casts%240%240.0.0.Any%24176244533.0.0.Evoker%24true%240.0.0.Any%24false%24-374348&ability=374348&view=events
 */
class DefensiveNormalizer extends EventsNormalizer {
  static dependencies = {
    ...EventsNormalizer.dependencies,
  };

  normalize(events: AnyEvent[]): AnyEvent[] {
    const fixedEvents: AnyEvent[] = [];
    const latestBuffRemoveEvents = new Map<number, RemoveBuffEvent>();

    for (const event of events) {
      if (event.type !== EventType.ApplyBuff && event.type !== EventType.RemoveBuff) {
        fixedEvents.push(event);
        continue;
      }

      // Only normalize our own events
      // Flameshaper Evokers can apply Renewing Blaze to us, and we don't analyze those
      if (event.sourceID !== this.selectedCombatant.id) {
        fixedEvents.push(event);
        continue;
      }

      const spellId = event.ability.guid;
      const castLink = DEFS_TO_NORMALIZE.get(spellId);
      if (!castLink) {
        fixedEvents.push(event);
        continue;
      }

      const targetID = event.targetID ?? 0; // You never know
      if (event.type === EventType.ApplyBuff) {
        // fake apply don't push
        if (!HasRelatedEvent(event, castLink)) {
          continue;
        }

        // on new "real" apply we push in our last removeBuffEvent
        const hasStoredEnd = latestBuffRemoveEvents.get(spellId + targetID);
        if (hasStoredEnd) {
          fixedEvents.push(hasStoredEnd);
          latestBuffRemoveEvents.delete(spellId + targetID);
        }
        fixedEvents.push(event);
        continue;
      }

      if (event.type === EventType.RemoveBuff) {
        // store the latests event so we only push the latests one
        latestBuffRemoveEvents.set(spellId + targetID, event);
        continue;
      }
    }

    // Make sure we push in the latests removal if it hasn't already been
    // think fightend, death, etc...
    latestBuffRemoveEvents.forEach((event) => fixedEvents.push(event));

    return fixedEvents;
  }
}

export default DefensiveNormalizer;
