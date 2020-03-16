import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
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
 * 3 traits
 * https://www.warcraftlogs.com/reports/wLNhvfpnBZ7rWFzb#fight=1&type=healing&source=6&ability=272987
 * 
 * 2 traits
 * https://www.warcraftlogs.com/reports/r3gwc1YhD6nBZpPK#fight=1&type=healing&source=13&ability=272987
 * 
 * 1 trait
 * https://www.warcraftlogs.com/reports/gGLKqpdXvkbnxA1a#fight=11&type=healing&source=4&ability=272987
 * 
 * 0 traits
 * https://www.warcraftlogs.com/reports/tJVXCrKG73Qb4m28#fight=47&type=healing&source=629
 * 
 * <100% usage
 * https://www.warcraftlogs.com/reports/1wy7mgD2Yk3x8LvB#fight=1&type=healing&source=8 
 * 
 * <100% usage
 * https://www.warcraftlogs.com/reports/zn1CyDWfYa4Hv8KN#fight=2&type=healing&source=7&ability=272987
 * 
 */
class RevelInPain extends Analyzer {

  totalAbsorbedPossible = 0;
  totalAbsorbed = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.REVEL_IN_PAIN.id);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.REVEL_IN_PAIN_BUFF), this.onBuff);
    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.REVEL_IN_PAIN_BUFF), this.onAbsorbed);
    
  }

  onAbsorbed(event){
    this.totalAbsorbed += event.amount;
  }

  onBuff(event){
    this.totalAbsorbedPossible += event.absorb;
  }


  statistic() {

    const absorbhps = this.totalAbsorbed / this.owner.fightDuration * 1000;

    // a percentage of absorb hps over total hps
    const absorbThroughputPercent = formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.totalAbsorbed));
    
    // this is how effective the tank was at ensuring the bubble was consumed rather than expired
    const usedAbsorbPossible = formatPercentage(this.totalAbsorbed/this.totalAbsorbedPossible);
    
    return (
      <AzeritePowerStatistic
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.REVEL_IN_PAIN}>
          <img
            src="/img/healing.png"
            alt="Heal"
            className="icon"
          /> {formatNumber(absorbhps)} HPS <small>{absorbThroughputPercent} % of total</small>
          <br />
          <img
            src="/img/shield.png"
            alt="Armor"
            className="icon"
          /> {usedAbsorbPossible} % <small>absorbs used</small>  
        </BoringSpellValueText>
      </AzeritePowerStatistic>
    );
  }
}

export default RevelInPain;