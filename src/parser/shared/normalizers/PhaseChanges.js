import EventsNormalizer from 'parser/core/EventsNormalizer';
import { EventType } from 'parser/core/Events';

/**
 * Normalizes phase events to ensure they are ordered correctly
 */
class FightEnd extends EventsNormalizer {

  normalize(events) {

    const phaseEvents = events.filter(event => event.type === EventType.PhaseStart || event.type === EventType.PhaseEnd);
    const nonPhaseEvents = events.filter(event => event.type !== EventType.PhaseStart && event.type !== EventType.PhaseEnd);

    phaseEvents.forEach(phaseEvent => {
      const index = nonPhaseEvents.findIndex(e => e.timestamp > phaseEvent.timestamp);
      nonPhaseEvents.splice(index, 0, phaseEvent);
    });

    return nonPhaseEvents;
  }
}

export default FightEnd;
