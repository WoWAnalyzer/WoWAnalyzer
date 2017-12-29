import Module from './Module';

class EventsNormalizer extends Module {
  static __dangerousInvalidUsage = false;

  initialize(combatants) {
    // Sometimes a normalizer needs the pre-events combatants, in that case extend this method.
  }

  /**
   * The combatlog has a lot of issues that make it harder to analyzer things. You can use this to normalize the log, for example by changing the order of events to match reality (e.g. a heal should never be logged before the cast event that triggers it, but Blizzard don't care about no logic).
   * Caution: advanced usage, this should only be used as an exception.
   * @param {Array} events
   * @returns {Array}
   */
  normalize(events) {
    return events;
  }

  // Convenience methods
  getFightStartIndex(events) {
    for (let i = 0; i < events.length; i += 1) {
      const event = events[i];
      if (event.type !== 'combatantinfo') {
        return i;
      }
    }
    throw new Error('Fight doesn\'t have an event other than combatants, something must have gone wrong.');
  }
}

export default EventsNormalizer;
