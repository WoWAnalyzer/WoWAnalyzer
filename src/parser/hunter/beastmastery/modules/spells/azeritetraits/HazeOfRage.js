import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import {formatNumber, formatPercentage} from 'common/format';
import {calculateAzeriteEffects} from 'common/stats';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';


const hazeOfRageStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [agility] = calculateAzeriteEffects(SPELLS.HAZE_OF_RAGE.id, rank);
  obj.agility += agility;
  return obj;
}, {
  agility: 0,
});

export const STAT_TRACKER = {
  agility: combatant => hazeOfRageStats(combatant.traitsBySpellId[SPELLS.HAZE_OF_RAGE.id]).agility,
};

/**
 * Bestial Wrath increases your Agility by 376 for 8 sec.
 *
 * Example report: https://www.warcraftlogs.com/reports/m9KrNBVCtDALZpzT#boss=-2&difficulty=0&wipes=1&source=5&type=summary
 */
class HazeOfRage extends Analyzer{
  agility = 0;

  constructor(...args){
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.HAZE_OF_RAGE.id);
    if(!this.active){
      return;
    }
    const {agility} = hazeOfRageStats(this.selectedCombatant.traitsBySpellId[SPELLS.HAZE_OF_RAGE.id]);
    this.agility = agility;
  }

  get uptime(){
    return this.selectedCombatant.getBuffUptime(SPELLS.HAZE_OF_RAGE_BUFF.id) / this.owner.fightDuration;
  }

  get avgAgility(){
    return this.uptime * this.agility;
  }

  statistic(){
    return(
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.HAZE_OF_RAGE.id}
        value={(
          <>
            {formatNumber(this.avgAgility)} Average Agility <br />
            {formatPercentage(this.uptime)}% Uptime
          </>
        )}
        tooltip={`Haze of Rage granted <b>${this.agility}</b> agility for <b>${formatPercentage(this.uptime)}%</b> of the fight.`}
      />
    );
  }
}

export default HazeOfRage;
