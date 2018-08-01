import React from 'react';
import SpellIcon from 'common/SpellIcon';
import Analyzer from 'Parser/Core/Analyzer';
import {formatNumber, formatPercentage} from 'common/format';
import {calculateAzeriteEffects} from 'common/stats';
import StatisticBox from 'Interface/Others/StatisticBox';
import SPELLS from 'common/SPELLS';

export function hazeOfRageStats(combatant){
  if(!combatant.hasTrait(SPELLS.HAZE_OF_RAGE.id)){
    return null;
  }
  let agility = 0;
  for(const rank of combatant.traitsBySpellId[SPELLS.HAZE_OF_RAGE.id]){
    const [agi] = calculateAzeriteEffects(SPELLS.HAZE_OF_RAGE.id, rank);
    agility += agi;
  }

  return {agility};
}

export const STAT_TRACKER = {
  agility: (combatant) => hazeOfRageStats(combatant).agility,
};


class HazeOfRage extends Analyzer{
  agility = 0;

  constructor(...args){
    super(...args);
    const response = hazeOfRageStats(this.selectedCombatant);
    if(response === null){
      this.active = false;
      return;
    }
    this.agility += response.agility;
  }

  get uptime(){
    return this.selectedCombatant.getBuffUptime(SPELLS.HAZE_OF_RAGE_BUFF.id) / this.owner.fightDuration;
  }

  get avgAgility(){
    return this.uptime * this.agility;
  }

  get numProcs(){
    return this.selectedCombatant.getBuffTriggerCount(SPELLS.HAZE_OF_RAGE_BUFF.id);
  }

  statistic(){
    return(
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HAZE_OF_RAGE.id} />}
        value={(
          <React.Fragment>
            {formatNumber(this.avgAgility)} Agility <br />
            {formatNumber(this.numProcs)} Procs
          </React.Fragment>
        )}
        label={"Haze of Rage"}
        tooltip={`Haze of Rage granted <b>${this.agility}</b> agility for <b>${formatPercentage(this.uptime)}%</b> of the fight.`}
      />
    );
  }
}

export default HazeOfRage;
