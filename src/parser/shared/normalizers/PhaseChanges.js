import EventsNormalizer from 'parser/core/EventsNormalizer';
import { PHASE_START_EVENT_TYPE, PHASE_END_EVENT_TYPE } from 'common/fabricateBossPhaseEvents';

/**
 * Normalizes phase events to ensure they are ordered correctly
 */
class FightEnd extends EventsNormalizer {

  normalize(events) {

    const phaseEvents = events.filter(event => event.type === PHASE_START_EVENT_TYPE || event.type === PHASE_END_EVENT_TYPE);
    const nonPhaseEvents = events.filter(event => event.type !== PHASE_START_EVENT_TYPE && event.type !== PHASE_END_EVENT_TYPE);

    phaseEvents.forEach(phaseEvent => {
      const index = nonPhaseEvents.findIndex(e => e.timestamp > phaseEvent.timestamp);
      nonPhaseEvents.splice(index, 0, phaseEvent);
    });

    return nonPhaseEvents;
  }
}

export default FightEnd;
