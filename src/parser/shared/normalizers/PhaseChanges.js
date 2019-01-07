import EventsNormalizer from 'parser/core/EventsNormalizer';

export const PHASE_START_EVENT_TYPE = 'phasestart';
export const PHASE_END_EVENT_TYPE = 'phaseend';

/**
 * Normalizes in events for the start and end of different phases if they exist on a fight
 */
class FightEnd extends EventsNormalizer {

  normalize(events) {
    const phases = this.owner.boss.fight.phases;
    const fightDifficulty = this.owner.fight.difficulty;

    const phaseEvents = [];

    if (phases && phases.length !== 0) {
      const phasesForDifficulty = phases.filter(phase => phase.difficulties.includes(fightDifficulty));

      if (phasesForDifficulty && phasesForDifficulty.length !== 0) {
        phaseEvents.push({
          id: phasesForDifficulty[0].id,
          phase: phasesForDifficulty[0],
          start: this.owner.fight.start_time,
          end: null,
        });

        phasesForDifficulty.forEach(phase => {
          if (phase.filter && phase.filter.type) {
            switch (phase.filter.type) {
              case 'removebuff':
              case 'applybuff':
              case 'removedebuff':
              case 'begincast':
              case 'cast': {
                let bossEvents = events.filter(e => e.isBossEvent && e.type === phase.filter.type && e.ability.guid === phase.filter.ability.id);
  
                if (typeof phase.filter.eventInstance != undefined && phase.filter.eventInstance >= 0 && bossEvents.length >= 1) {
                  bossEvents = [bossEvents[phase.filter.eventInstance]];
                }
                
                bossEvents.forEach(bossEvent => {
                  phaseEvents.push({
                    id: phase.id,
                    phase: phase,
                    start: bossEvent.timestamp,
                    end: null,
                  });
                });
                break;
              }
              case 'adds': {
                const enemy = this.owner.report.enemies.find(enemy => enemy.guid === phase.filter.guid);
                if (enemy) {
                  const addEvents = events.filter(e => e.isBossEvent && (e.sourceID === enemy.id || e.targetID === enemy.id));
                  
                  const spawns = addEvents.filter(e => e.type !== 'death');
                  const firstSpawnOfWaveEvents = spawns.reduce((addWaves, spawn) => {
                    const instance = (spawn.targetID === enemy.id ? spawn.targetInstance : spawn.sourceInstance) - 1;
                    const wave = Math.floor(instance / phase.filter.addCount);
                    if (!addWaves[wave]) {
                      addWaves[wave] = spawn.timestamp;
                    }
                    return addWaves;
                  }, []);

                  firstSpawnOfWaveEvents.forEach((timestamp, index) => {
                    phaseEvents.push({
                      id: `${phase.id}_${index}`,
                      phase: phase,
                      start: timestamp,
                      end: null,
                    });
                  });

                  const deaths = addEvents.filter(e => e.type === 'death').reverse();
                  const lastDeathOfWaveEvents = deaths.reduce((addWaves, death) => {
                    const instance = (death.targetID === enemy.id ? death.targetInstance : death.sourceInstance) - 1;
                    const wave = Math.floor(instance / phase.filter.addCount);
                    if (!addWaves[wave]) {
                      addWaves[wave] = death.timestamp;
                    }
                    return addWaves;
                  }, []);

                  lastDeathOfWaveEvents.forEach((timestamp, index) => {
                    const startIndex = phaseEvents.findIndex(event => event.id === `${phase.id}_${index}`);
                    phaseEvents[startIndex].end = timestamp;
                  });
                }
                break;
              }
              default:
                break;
            }
          }
        });
      }
    }

    phaseEvents.sort((a, b) => a.start - b.start);

    phaseEvents.forEach((event) => {
      if (!event.end) {
        const nextMainPhase = phaseEvents.find(next => !next.end && next.id !== event.id);
        if (nextMainPhase) {
          event.end = nextMainPhase.start;
        } else {
          event.end = this.owner.fight.end_time;
        }
      }
      this.createPhaseStartEvent(event.start, event.phase, events);
      this.createPhaseEndEvent(event.end, event.phase, events);
    });

    return events.filter(e => !e.isBossEvent);
  }

  createPhaseStartEvent(timestamp, phase, events) {
    const phaseStartEvent = {
      timestamp: timestamp,
      phase: phase,
      type: PHASE_START_EVENT_TYPE,
      __fabricated: true,
    };

    const index = events.findIndex(e => !e.isBossEvent && e.timestamp > timestamp);
    events.splice(index, 0, phaseStartEvent);
  }

  createPhaseEndEvent(timestamp, phase, events) {
    const phaseEndEvent = {
      timestamp: timestamp,
      phase: phase,
      type: PHASE_END_EVENT_TYPE,
      __fabricated: true,
    };

    const index = events.findIndex(e => !e.isBossEvent && e.timestamp > timestamp);
    events.splice(index, 0, phaseEndEvent);
  }

}

export default FightEnd;
