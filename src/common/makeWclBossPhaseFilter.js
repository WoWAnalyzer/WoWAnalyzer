import { findByBossId } from 'raids';
import { abilityFilter } from 'common/fabricateBossPhaseEvents';

export function makeWclBossPhaseFilter(fight) {
  const bossConfig = findByBossId(fight.boss);
  if (bossConfig && bossConfig.fight && bossConfig.fight.phases && bossConfig.fight.phases.length !== 0) {
    const filters = [];
    const phasesForDifficulty = Object.values(bossConfig.fight.phases).filter(phase => phase.difficulties.includes(fight.difficulty));

    phasesForDifficulty.forEach(phase => {
      if (phase.filter) {
        if (phase.filter.ability) {
          filters.push(`(${abilityFilter[phase.filter.type] || 'ability'}.id = ${phase.filter.ability.id} AND type = "${phase.filter.type}")`);
        } else if(phase.filter.health) { //query can't contain floats as parameters, so have to perform 100* calculation in query itself before comparison
          filters.push(`resources.actor.id = ${phase.filter.guid} AND type = "damage" AND (100 * resources.hitPoints / resources.maxHitPoints) BETWEEN ${Math.floor(phase.filter.health) - 1} AND ${Math.floor(phase.filter.health) + 1}`);
        } else if (phase.filter.query) {
          filters.push(`(${phase.filter.query})`);
        }
      }
    });
    return filters.join(' OR ');
  }
  return undefined;
}
