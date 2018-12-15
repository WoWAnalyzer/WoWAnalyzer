import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import { formatPercentage, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';

// Limitations: does not handle innervate already being on cooldown when the fight begins 
// Testing log w/ cd reduction casts https://www.warcraftlogs.com/reports/T6NCZ79yzK4D32x8#fight=1&type=healing&source=4&options=8

const INNERVATE_COOLDOWN = 120000;
const INNERVATE_DURATION = 12000;
const COOLDOWN_REDUCTION = 1000;

class EarlyHarvest extends Analyzer{
  currentInnervateCooldown = 0;
  lastInnervateTimestamp = 0
  innervateCooldownReduced = 0;
  healingFromWildGrowthExpiration = 0;
  numEarlyHarvestHeals = 0
  numEarlyHarvestCooldownReductions = 0

  constructor(...args){
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.EARLY_HARVEST_TRAIT.id);
  }

  // Save innervate timestamp/cooldown to check it's actually on cd when cd would be reduced by early harvest 
  on_byPlayer_cast(event) {
    if(SPELLS.INNERVATE.id === event.ability.guid && event.sourceId === event.targetId) {
      this.currentInnervateCooldown = INNERVATE_COOLDOWN + INNERVATE_DURATION;
      this.lastInnervateTimestamp = event.timestamp;
    }
  }
  
  // Check for healing from early harvest buff
  on_byPlayer_heal(event) {
    if(SPELLS.EARLY_HARVEST.id !== event.ability.guid) {
      return;
    }
    
    this.healingFromWildGrowthExpiration += event.amount; 
    this.numEarlyHarvestHeals += 1; 
  }
 
  // Check for targets being undamaged when wild growth ends to reduce innervate cd
  on_byPlayer_removebuff(event) {
    if(SPELLS.WILD_GROWTH.id !== event.ability.guid){
      return;
    }
    
    // Early out if target is damaged
    if(event.hitPoints < event.maxHitPoints) {
      return;
    }      
    
    // Early out if haven't yet cast innervate (dones't handle innervate being on cd at beginning of fight)
    if(this.lastInnervateTimestamp === 0) {
      return;
    }
    
    // Check if innervate is on cd 
    const timeSinceLastInnervate = event.timestamp - this.lastInnervateTimestamp;
    const innervateCooldownRemaining = this.currentInnervateCooldown - timeSinceLastInnervate;
    if(innervateCooldownRemaining > 0) {
        this.currentInnervateCooldown -= COOLDOWN_REDUCTION;
        // min to handle if on cooldown with less than COOLDOWN_REDUCTION milliseconds remaining 
        this.innervateCooldownReduced += Math.min(COOLDOWN_REDUCTION, innervateCooldownRemaining);
        this.numEarlyHarvestCooldownReductions += 1;
    }
  }

  statistic(){
    const healingFromWildGrowthExpiration = this.owner.getPercentageOfTotalHealingDone(this.healingFromWildGrowthExpiration);
    const innervateCooldownReducedInSeconds = this.innervateCooldownReduced/1000.0;
    
    return(
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.EARLY_HARVEST_TRAIT.id}
        value={(
          <>
            {`${formatPercentage(healingFromWildGrowthExpiration)}% healing`} <br />
            {`${formatNumber(innervateCooldownReducedInSeconds)} seconds`} 
          </>
        )}
        tooltip={`Healed ${formatNumber(this.numEarlyHarvestHeals)} times for a total of 
                 ${formatNumber(this.healingFromWildGrowthExpiration)} <br/>
                 Reduced innervate cooldown ${this.numEarlyHarvestCooldownReductions} times for a total of 
                 ${innervateCooldownReducedInSeconds} seconds`}
      />
    );
  }
}

export default EarlyHarvest;
