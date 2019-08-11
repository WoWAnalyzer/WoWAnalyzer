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
        } else if(phase.filter.health) { //query can't contain floats as parameters, so have to perform calculations in query itself before comparison to achieve our wanted accuracy
          const decimalFilter = createDecimalFilter(phase.filter.health);
          filters.push(`(resources.actor.id = ${phase.filter.guid} AND type = "damage" AND (${decimalFilter.accuracy * 100} * resources.hitPoints / resources.maxHitPoints) BETWEEN ${decimalFilter.min} AND ${decimalFilter.max})`);
        } else if (phase.filter.query) {
          filters.push(`(${phase.filter.query})`);
        }
      }
    });
    return filters.join(' OR ');
  }
  return undefined;
}

function createDecimalFilter(target){
  //find number of decimals by checking if decimals exist, and if they do, splitting the string at the decimal point and counting digits
  const decimals = Math.floor(target) !== target ? (target.toString().split(".")[1].length || 0) : 0;
  const accuracy = Math.pow(10, decimals + 1); //we want our minimum accuracy to be in steps of 0.1, therefore we increase the power to one higher than the decimal count
  //adjust min and max values for comparison to be one unit on either side of the target
  const min = Math.floor(target * accuracy) - 1;
  const max = Math.floor(target * accuracy) + 1;
  return {accuracy, min, max};
}
