import EventsNormalizer from 'parser/core/EventsNormalizer';

export const PHASE_START_EVENT_TYPE = 'phasestart';

/**
 * Normalizes in an events for the start of different phases if they exist on a fight
 */
class FightEnd extends EventsNormalizer {

  normalize(events) {
    const phases = this.owner.boss.fight.phases;

    if (phases && phases.length !== 0) {
      events.unshift(this.createPhaseStartEvent(this.owner.fight.start_time, phases[0]));

      phases.forEach(phase => {
        if (phase.filter && phase.filter.type) {
          switch (phase.filter.type) {
            case 'removebuff':
            case 'applybuff':
            case 'removedebuff':
            case 'begincast':
            case 'cast': {
              let bossEvents = events.filter(e => e.isBossEvent && e.ability.guid === phase.filter.ability.id && e.type === phase.filter.type);

              if (typeof phase.filter.eventInstance != undefined && phase.filter.eventInstance >= 0 && bossEvents.length >= 1) {
                bossEvents = [bossEvents[phase.filter.eventInstance]];
              }

              bossEvents.forEach(bossEvent => {
                const phaseStartEvent = this.createPhaseStartEvent(bossEvent.timestamp, phase);
                const index = events.findIndex(e => !e.isBossEvent && e.timestamp > bossEvent.timestamp);
                events.splice(index, 0, phaseStartEvent);
              });
              break;
            }
            // Unused at the moment. Thought it was needed for Zek'vos, but he actually casts an event. Keeping it here though as it's pretty accurate and could be useful for future bosses
            case 'percent': {
              const bossEvents = events.filter(e => e.isBossEvent && e.hitPoints);
              const bossHpBelowThresholdIndex = bossEvents.findIndex(e => (e.hitPoints * 100 / e.maxHitPoints) < phase.filter.value);
              if (bossHpBelowThresholdIndex > 0) {
                const bossHpBelowThreshold = bossEvents[bossHpBelowThresholdIndex];
                const bossHpAboveThreshold = bossEvents[bossHpBelowThresholdIndex - 1];

                const dTime = bossHpBelowThreshold.timestamp - bossHpAboveThreshold.timestamp;
                const aHpPercent = bossHpAboveThreshold.hitPoints * 100 / bossHpAboveThreshold.maxHitPoints;
                const bHpPercent = bossHpBelowThreshold.hitPoints * 100 / bossHpBelowThreshold.maxHitPoints;

                const timestamp = bossHpAboveThreshold.timestamp + dTime * ((aHpPercent - phase.filter.value) / (aHpPercent - bHpPercent));
                const phaseStartEvent = this.createPhaseStartEvent(timestamp, phase);
                const index = events.findIndex(e => !e.isBossEvent && e.timestamp > timestamp);
                events.splice(index, 0, phaseStartEvent);
              }
              break;
            }
            default:
              break;
          }
        }
      });
    }

    return events.filter(e => !e.isBossEvent);
  }

  createPhaseStartEvent(timestamp, phase) {
    return {
      timestamp: timestamp,
      phase: phase,
      type: PHASE_START_EVENT_TYPE,
      __fabricated: true,
    };
  }

}

export default FightEnd;
