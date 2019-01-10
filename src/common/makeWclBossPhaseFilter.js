import { findByBossId } from 'raids';

export function makeWclBossPhaseFilter(fight) {
  const bossConfig = findByBossId(fight.boss);
  if (bossConfig.fight.phases && bossConfig.fight.phases.length !== 0) {
    const filters = [];

    const phasesForDifficulty = bossConfig.fight.phases.filter(phase => phase.difficulties.includes(fight.difficulty));

    const abilities = phasesForDifficulty.reduce((abilityIds, phase) => {
      if (phase.filter && phase.filter.ability && !abilityIds.includes(phase.filter.ability.id)) {
        return abilityIds.concat(phase.filter.ability.id);
      }
      return abilityIds;
    }, []);

    if (abilities.length > 0) {
      filters.push(`(ability.id in (${abilities.join(',')}))`);
    }

    const queries = phasesForDifficulty.reduce((queryAcc, phase) => {
      if (phase.filter && phase.filter.query && !queryAcc.includes(phase.filter.query)) {
        return queryAcc.concat(`(${phase.filter.query})`);
      }
      return queryAcc;
    }, []);

    if (queries.length > 0) {
      filters.push(...queries);
    }

    return filters.join(' OR ');
  }
  return undefined;
}