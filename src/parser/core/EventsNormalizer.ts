import { AnyEvent, EventType } from 'parser/core/Events';

import Module from './Module';

abstract class EventsNormalizer extends Module {
  /**
   * The combatlog has a lot of issues that make it harder to analyze things.
   * You can use this to normalize the log, for example by changing the order of
   * events to match reality (e.g. a heal should never be logged before the cast
   * event that triggers it, but Blizzard don't care about no logic).
   * Caution: advanced usage, this should only be used as an exception.
   * @param {Array} events
   * @returns {Array}
   */
  abstract normalize(events: AnyEvent[]): AnyEvent[];

  /**
   * Override this value to true to designate an event normalizer to not be run during the
   * CombatLogParser's normalize function. These normalizers will instead to used on the final
   * event history (including fabricated events) which is provided to the APL checker.
   */
  isAplNormalizer: boolean = false;

  // Convenience methods
  getFightStartIndex(events: AnyEvent[]): number {
    for (let i = 0; i < events.length; i += 1) {
      const event = events[i];
      if (event.type !== EventType.CombatantInfo) {
        return i;
      }
    }
    throw new Error(
      "Fight doesn't have an event other than combatants, something must have gone wrong.",
    );
  }
}

export default EventsNormalizer;
