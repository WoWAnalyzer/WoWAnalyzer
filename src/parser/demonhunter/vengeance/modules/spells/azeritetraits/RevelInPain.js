import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateAzeriteEffects } from 'common/stats';
import SPELLS from 'common/SPELLS';
import Events from 'parser/core/Events';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import { formatNumber, formatPercentage } from 'common/format';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import React from 'react';

/**
 * Infernal Armor Azerite Power
 * Fiery Brand now lasts 10 sec. When Fiery Brand expires on your primary target, 
 * you gain a shield that absorbs up to 69512 damage for 15 sec, based on your 
 * damage dealt to them while Fiery Brand was active.
 *
 * example logs: 
 * 2 traits
 * https://www.warcraftlogs.com/reports/r3gwc1YhD6nBZpPK#fight=1&type=healing&source=13&ability=272987
 * 
 */
class RevelInPain extends Analyzer {

  eventArray = [];
  totalAbsorbedPossible = 0;
  totalAbsorbed = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.REVEL_IN_PAIN.id);
    if (!this.active) {
      return;
    }
    // else {
    //   alert("has trait")
    // }

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.REVEL_IN_PAIN_BUFF), this.onBuff);
    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.REVEL_IN_PAIN_BUFF), this.onAbsorbed);
    this.addEventListener(Events.absorbed, this.eventMethod);
    
  }

  onAbsorbed(event){
    // this.eventMethod(event);
    this.totalAbsorbed += event.amount;
  }

  onBuff(event){
    // this.eventMethod(event);
    this.totalAbsorbedPossible += event.absorb;
  }

  eventMethod(event) {
    // 272987 is the absorb
    // 272987 also is applybuff
      if( 
        event.ability.guid === 272986) {
          this.eventArray.push(event);
        }
        //this.eventArray.push(event);
  }


  statistic() {
    const absorbThroughputPercent = formatPercentage(this.owner.getPercentageOfTotalDamageTaken(this.totalAbsorbed));
    const hps = this.totalAbsorbed / this.owner.fightDuration * 1000;
    const usedAbsorbPossible = formatPercentage(this.totalAbsorbed/this.totalAbsorbedPossible);
    // const buffUptimePercent = this.buffUptime / this.owner.fightDuration;

    console.log(this.eventArray,absorbThroughputPercent, hps, usedAbsorbPossible);
    

    return (
      <AzeritePowerStatistic
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.REVEL_IN_PAIN}>
          <img
            src="/img/healing.png"
            alt="Heal"
            className="icon"
          /> {formatNumber(hps)} HPS <small>{absorbThroughputPercent} % of total damage taken</small>
          <br />
          <img
            src="/img/shield.png"
            alt="Armor"
            className="icon"
          /> {usedAbsorbPossible} % <small>absorbs used</small>  
          {/* <small>{formatPercentage(buffUptimePercent)} % uptime</small> */}
        </BoringSpellValueText>
      </AzeritePowerStatistic>
    );
  }
}

export default RevelInPain;