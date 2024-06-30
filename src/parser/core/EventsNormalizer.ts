import { AnyEvent, EventType } from 'parser/core/Events';

import Module from './Module';
import DebugAnnotations, { type Annotation } from './modules/DebugAnnotations';

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

  /**
   * Add an annotation which will be displayed on the /debug view. Multiple annotations
   * can be added to the same event.
   *
   * Annotations are automatically broken down by analyzer. You don't need to split them
   * up yourself.
   */
  addDebugAnnotation(event: AnyEvent, annotation: Annotation): void {
    this.owner.getModule(DebugAnnotations)?.addAnnotation(this, event, annotation);
  }
}

export default EventsNormalizer;
