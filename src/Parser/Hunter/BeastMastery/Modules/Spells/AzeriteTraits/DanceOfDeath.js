import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import {formatNumber, formatPercentage} from 'common/format';
import {calculateAzeriteEffects} from 'common/stats';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';
import SPELLS from 'common/SPELLS/index';


const danceOfDeathStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [agility] = calculateAzeriteEffects(SPELLS.DANCE_OF_DEATH.id, rank);
  obj.agility += agility;
  return obj;
}, {
  agility: 0,
});

export const STAT_TRACKER = {
  agility: combatant => danceOfDeathStats(combatant.traitsBySpelld[SPELLS.DANCE_OF_DEATH.id]).agility,
};

/**
 * Barbed Shot has a chance equal to your critical strike chance to grant you 314 agility
 * for 8 sec.
 *
 * Example report: https://www.warcraftlogs.com/reports/Nt9KGvDncPmVyjpd#boss=-2&difficulty=0&type=summary&source=9
 */
class DanceOfDeath extends Analyzer{
  agility = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.DANCE_OF_DEATH.id);
    if(!this.active){
      return;
    }
    const {agility} = danceOfDeathStats(this.selectedCombatant.traitsBySpellId[SPELLS.DANCE_OF_DEATH.id]);
    this.agility = agility;
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
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.DANCE_OF_DEATH.id}
        value={(
          <React.Fragment>
            {formatNumber(this.avgAgility)} Average Agility <br />
            {formatPercentage(this.uptime)}% Uptime
          </React.Fragment>
        )}
        tooltip={`Dance of Death granted <b>${this.agility}</b> agility for <b>${formatPercentage(this.uptime)}%</b> of the fight.`}
      />
    );
  }
}

export default DanceOfDeath;
