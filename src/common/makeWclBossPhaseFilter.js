import { findByBossId } from 'game/raids';
import { abilityFilter } from 'common/fabricateBossPhaseEvents';

function createDecimalFilter(target){
  //find number of decimals by checking if decimals exist, and if they do, splitting the string at the decimal point and counting digits
  const decimals = Math.floor(target) !== target ? (target.toString().split(".")[1].length || 0) : 0;
  const accuracy = Math.pow(10, decimals); //we want only integers (without decimals) as the filter only supports those, we have to therefore shift the value by the decimal count
  //adjust threshold to remove decimals by multiplying with accuracy
  const threshold = Math.floor(target * accuracy);
  return {accuracy, threshold};
}

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
          //find first event that marks the boss as below the threshold
          filters.push(`(MATCHED resources.actor.id = ${phase.filter.guid} AND (${decimalFilter.accuracy} * resources.hppercent) <= ${decimalFilter.threshold} IN (1) END)`);
        } else if (phase.filter.query) {
          filters.push(`(${phase.filter.query})`);
        }
      }
    });
    return filters.join(' OR ');
  }
  return undefined;
}
