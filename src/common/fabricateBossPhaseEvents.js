import { findByBossId } from 'raids';
import { EventType } from 'parser/core/Events';

export const abilityFilter = { //filter used for abilities that don't use the default "ability" filter
  "interrupt": "stoppedability",
  "dispel": "stoppedability",
};

/**
 * Creates Phase filter events as defined in boss configs via phase.filter.type
 * All filters can be passed a filter.offset attribute that shifts how many milliseconds after the specicifed event the phase starts (can be negative)
 * Supported filter event types:
 *
 * Buff filters:
 *  - removebuff
 *  - applybuff
 *  - removedebuff
 *  - applydebuff
 *
 *  Buff filters require filter.ability.id to be set for the Ability to search for
 *
 * Cast filters:
 *  - begincast
 *  - cast
 *  - interrupt
 *  - dispel
 *
 * Cast filters require filter.ability.id to be set for the Ability to search for
 *
 * Time filters:
 * - time
 *
 * Time filters require filter.time to be set as the milliseconds from combat begin to set the phase event at. filter.repeat can be provided to create reoccuring phase start events with the given millisecond time difference from the first occurence
 * e.g. filter.time: 10000, filter.repeat: 30000 would create phase events starting 10 seconds into the fight and repeating every 30 seconds from then on
 *
 * Health filters:
 * - health
 *
 * Health filters require filter.guid for the mob to check as well as filter.health for the health percentage threshold that triggers this transition (currently only works for phase starting when boss drops BELOW this percentage)
 */
export function fabricateBossPhaseEvents(events, report, fight) {
  const bossConfig = findByBossId(fight.boss);
  const fightDifficulty = fight.difficulty;

  const phaseEvents = [];
  const bossPhaseEvents = [];
  const phaseInstances = {};
  if (bossConfig && bossConfig.fight && bossConfig.fight.phases && bossConfig.fight.phases.length !== 0) {
    const phasesKeys = Object.keys(bossConfig.fight.phases).filter(key => bossConfig.fight.phases[key].difficulties.includes(fightDifficulty));

    if (phasesKeys && phasesKeys.length !== 0) {
      phaseEvents.push({
        key: phasesKeys[0],
        phase: bossConfig.fight.phases[phasesKeys[0]],
        start: fight.start_time,
        end: null,
      });

      phasesKeys.forEach(key => {
        const phase = bossConfig.fight.phases[key];
        if (phase.filter && phase.filter.type) {
          switch (phase.filter.type) {
            case 'removebuff':
            case 'applybuff':
            case 'removedebuff':
            case 'applydebuff':
            case 'begincast':
            case 'interrupt':
            case 'dispel':
            case 'cast': {
              let bossEvents = events.filter(e => e.type === phase.filter.type &&
                (
                  (e.ability && e.ability.guid === phase.filter.ability.id) ||
                  (e.extraAbility && e.extraAbility.guid === phase.filter.ability.id)
                ),
              );
              if (phase.filter.eventInstance !== undefined && phase.filter.eventInstance >= 0 && !phase.multiple) {
                if (bossEvents.length >= (phase.filter.eventInstance + 1)) {
                  // If the instance exists, only that specific instance is relevant
                  bossEvents = [bossEvents[phase.filter.eventInstance]];
                } else {
                  // Otherwise the phase does not exist (it was probably a wipe)
                  console.warn('Phase not found:', phase);
                  break;
                }
              }
              bossEvents.forEach(bossEvent => {
                phaseEvents.push({
                  key: key,
                  phase: phase,
                  start: bossEvent.timestamp + (phase.filter.offset || 0),
                  end: null,
                });
              });
              break;
            }
            case 'time': {
              const times = [fight.start_time + (phase.filter.time || 0) + (phase.filter.offset || 0)];
              if(times[0] > fight.end_time){ //if initial time is after fight end, stop here
                break;
              }
              if(phase.filter.repeat){
                const pastPhaseTime = fight.end_time - times[0];
                const repeats = Math.floor(pastPhaseTime / phase.filter.repeat); //get amount of times the phase can start again after the initial start
                //create array of "counts" of phase starts (0, 1, 2, etc) and map them via the repeat time from the first occurance
                times.push(...[...Array(repeats).keys()].map(r => times[0] + phase.filter.repeat * (r + 1)));
              }
              times.filter(time => time < fight.end_time).forEach(time => {
                phaseEvents.push({
                  key: key,
                  phase: phase,
                  start: time,
                  end: null,
                });
              });

              break;
            }
            case 'health': {
              const enemy = report.enemies.find(enemy => enemy.guid === phase.filter.guid);
              if(enemy){
                const healthEvent = events.find(e => e.targetID === enemy.id && (100 * e.hitPoints / e.maxHitPoints) <= phase.filter.health);
                if(healthEvent){
                  phaseEvents.push({
                    key: key,
                    phase: phase,
                    start: healthEvent.timestamp + (phase.filter.offset || 0),
                    end: null,
                  });
                }
              }
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
                    key: `${key}_${index}`,
                    phase: phase,
                    start: timestamp + (phase.filter.offset || 0),
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
                  const startIndex = phaseEvents.findIndex(event => event.key === `${key}_${index}`);
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
  phaseEvents.filter((event, index, array) => {
    return index === 0 || event.key !== array[index - 1].key; //only keep events that arent preceded by another start event of the same phase
  }).forEach((event, _, array) => {
    if (!event.end) {
      const nextMainPhase = array.find(next => !next.end && next.key !== event.key);
      if (nextMainPhase) {
        event.end = nextMainPhase.start;
      } else {
        event.end = fight.end_time;
      }
    }
    if(!phaseInstances[event.key]){
      phaseInstances[event.key] = 0;
    }
    createPhaseStartEvent(event.start, {key: event.key, instance: phaseInstances[event.key], ...event.phase}, bossPhaseEvents);
    createPhaseEndEvent(event.end, {key: event.key, instance: phaseInstances[event.key], ...event.phase}, bossPhaseEvents);
    phaseInstances[event.key] += 1;
  });
  return bossPhaseEvents;
}

function createPhaseStartEvent(timestamp, phase, events) {
  const phaseStartEvent = {
    timestamp: timestamp,
    phase: phase,
    type: EventType.PhaseStart,
    __fabricated: true,
  };

  events.push(phaseStartEvent);
}

function createPhaseEndEvent(timestamp, phase, events) {
  const phaseEndEvent = {
    timestamp: timestamp,
    phase: phase,
    type: EventType.PhaseEnd,
    __fabricated: true,
  };

  events.push(phaseEndEvent);
}
