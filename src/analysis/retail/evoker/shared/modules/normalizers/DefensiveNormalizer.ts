import { AnyEvent, EventType, HasRelatedEvent, RemoveBuffEvent } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import TALENTS from 'common/TALENTS/evoker';
import {
  OBSIDIAN_SCALES_CAST_BUFF_LINK,
  RENEWING_BLAZE_CAST_BUFF_LINK,
} from './DefensiveCastLinkNormalizer';

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
    let lastObsidianScalesBuffRemove: RemoveBuffEvent | undefined;
    let lastRenewingBlazeBuffRemove: RemoveBuffEvent | undefined;

    for (const event of events) {
      if (
        event.type === EventType.ApplyBuff &&
        event.ability.guid === TALENTS.OBSIDIAN_SCALES_TALENT.id
      ) {
        if (!HasRelatedEvent(event, OBSIDIAN_SCALES_CAST_BUFF_LINK)) {
          continue;
        }

        if (lastObsidianScalesBuffRemove) {
          fixedEvents.push(lastObsidianScalesBuffRemove);
          lastObsidianScalesBuffRemove = undefined;
        }
      }

      if (
        event.type === EventType.RemoveBuff &&
        event.ability.guid === TALENTS.OBSIDIAN_SCALES_TALENT.id
      ) {
        lastObsidianScalesBuffRemove = event;
        continue;
      }

      if (
        event.type === EventType.ApplyBuff &&
        event.ability.guid === TALENTS.RENEWING_BLAZE_TALENT.id
      ) {
        if (!HasRelatedEvent(event, RENEWING_BLAZE_CAST_BUFF_LINK)) {
          continue;
        }

        if (lastRenewingBlazeBuffRemove) {
          fixedEvents.push(lastRenewingBlazeBuffRemove);
          lastRenewingBlazeBuffRemove = undefined;
        }
      }

      if (
        event.type === EventType.RemoveBuff &&
        event.ability.guid === TALENTS.RENEWING_BLAZE_TALENT.id
      ) {
        lastRenewingBlazeBuffRemove = event;
        continue;
      }

      fixedEvents.push(event);
    }

    // Make sure we push in the latests removal if it hasn't already been
    // think fightend, death, etc...
    if (lastObsidianScalesBuffRemove) {
      fixedEvents.push(lastObsidianScalesBuffRemove);
    }
    if (lastRenewingBlazeBuffRemove) {
      fixedEvents.push(lastRenewingBlazeBuffRemove);
    }

    return fixedEvents;
  }
}

export default DefensiveNormalizer;
