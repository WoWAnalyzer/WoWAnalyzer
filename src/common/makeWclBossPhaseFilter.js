import { findByBossId } from 'raids';

export function makeWclBossPhaseFilter(fight) {
  const bossConfig = findByBossId(fight.boss);
  if (bossConfig && bossConfig.fight && bossConfig.fight.phases && bossConfig.fight.phases.length !== 0) {
    const filters = [];
    const phasesForDifficulty = Object.values(bossConfig.fight.phases).filter(phase => phase.difficulties.includes(fight.difficulty));

    phasesForDifficulty.forEach(phase => {
      if (phase.filter) {
        if (phase.filter.ability) {
          filters.push(`(ability.id = ${phase.filter.ability.id} AND type = "${phase.filter.type}")`);
        } else if (phase.filter.query) {
          filters.push(`(${phase.filter.query})`);
        }
      }
    });
    return filters.join(' OR ');
  }
  return undefined;
}