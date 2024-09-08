import type { AnyEvent } from 'parser/core/Events';
import { EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

/**
 * Normalizes phase events to ensure they are ordered correctly
 */
class FightEnd extends EventsNormalizer {
  normalize(events: Array<AnyEvent>) {
    const phaseEvents: Array<AnyEvent> = events.filter(
      (event) => event.type === EventType.PhaseStart || event.type === EventType.PhaseEnd,
    );
    const nonPhaseEvents: Array<AnyEvent> = events.filter(
      (event) => event.type !== EventType.PhaseStart && event.type !== EventType.PhaseEnd,
    );

    phaseEvents.forEach((phaseEvent) => {
      const index = nonPhaseEvents.findIndex((e) => e.timestamp > phaseEvent.timestamp);
      nonPhaseEvents.splice(index, 0, phaseEvent);
    });

    return nonPhaseEvents;
  }
}

export default FightEnd;
