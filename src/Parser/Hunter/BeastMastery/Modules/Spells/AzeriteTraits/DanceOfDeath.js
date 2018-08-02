import React from 'react';
import SpellIcon from 'common/SpellIcon';
import Analyzer from 'Parser/Core/Analyzer';
import {formatNumber, formatPercentage} from 'common/format';
import {calculateAzeriteEffects} from 'common/stats';
import StatisticBox from 'Interface/Others/StatisticBox';
import SPELLS from 'common/SPELLS/index';


export function danceOfDeathStats(combatant){
  if(!combatant.hasTrait(SPELLS.DANCE_OF_DEATH.id)){
    return null;
  }
  let agility = 0;
  for(const rank of combatant.traitsBySpellId[SPELLS.DANCE_OF_DEATH.id]){
    const [agi] = calculateAzeriteEffects(SPELLS.DANCE_OF_DEATH.id, rank);
    agility += agi;
  }
  return {agility};
}

export const STAT_TRACKER = {
  agility: (combatant) => danceOfDeathStats(combatant).agility,
};

/**
 * Barbed Shot has a chance equal to your critical strike chance to grant you 314 agility
 * for 8 sec.
 */
class DanceOfDeath extends Analyzer{
  agility = 0;

  constructor(...args) {
    super(...args);
    const response = danceOfDeathStats(this.selectedCombatant);
    if (response === null) {
      this.active = false;
      return;
    }
    this.agility += response.agility;
  }


  get uptime(){
    return this.selectedCombatant.getBuffUptime(SPELLS.DANCE_OF_DEATH_BUFF.id) / this.owner.fightDuration;
  }

  get avgAgility(){
    return this.uptime * this.agility;
  }

  get numProcs(){
    return this.selectedCombatant.getBuffTriggerCount(SPELLS.DANCE_OF_DEATH_BUFF.id);
  }

  statistic(){
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DANCE_OF_DEATH.id} />}
        value={(
          <React.Fragment>
            {formatNumber(this.avgAgility)} Agility <br />
            {formatNumber(this.numProcs)} Procs
          </React.Fragment>
        )}
        label={"Dance of Death"}
        tooltip={`Dance of Death granted <b>${this.agility}</b> agility for <b>${formatPercentage(this.uptime)}%</b> of the fight.`}
      />
    );
  }
}

export default DanceOfDeath;
