import { findByBossId } from 'raids';

export const PHASE_START_EVENT_TYPE = 'phasestart';
export const PHASE_END_EVENT_TYPE = 'phaseend';

export function fabricateBossPhaseEvents(events, report, fight) {  
  const bossConfig = findByBossId(fight.boss);
  const phases = bossConfig.fight.phases;
  const fightDifficulty = fight.difficulty;

  const phaseEvents = [];
  const bossPhaseEvents = [];

  if (phases && phases.length !== 0) {
    const phasesForDifficulty = phases.filter(phase => phase.difficulties.includes(fightDifficulty));

    if (phasesForDifficulty && phasesForDifficulty.length !== 0) {
      phaseEvents.push({
        id: phasesForDifficulty[0].id,
        phase: phasesForDifficulty[0],
        start: fight.start_time,
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
              let bossEvents = events.filter(e => e.type === phase.filter.type && e.ability.guid === phase.filter.ability.id);

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
              const enemy = report.enemies.find(enemy => enemy.guid === phase.filter.guid);
              if (enemy) {
                const addEvents = events.filter(e => e.sourceID === enemy.id || e.targetID === enemy.id);

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
        event.end = fight.end_time;
      }
    }
    createPhaseStartEvent(event.start, event.phase, bossPhaseEvents);
    createPhaseEndEvent(event.end, event.phase, bossPhaseEvents);
  });

  return bossPhaseEvents;
}

function createPhaseStartEvent(timestamp, phase, events) {
  const phaseStartEvent = {
    timestamp: timestamp,
    phase: phase,
    type: PHASE_START_EVENT_TYPE,
    __fabricated: true,
  };

  events.push(phaseStartEvent);
}

function createPhaseEndEvent(timestamp, phase, events) {
  const phaseEndEvent = {
    timestamp: timestamp,
    phase: phase,
    type: PHASE_END_EVENT_TYPE,
    __fabricated: true,
  };

  events.push(phaseEndEvent);
}
