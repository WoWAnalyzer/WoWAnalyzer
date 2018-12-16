import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import { formatPercentage, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox from 'interface/others/TraitStatisticBox';
import SpellUsable from 'parser/shared/modules/SpellUsable';

// Testing log w/ cd reduction casts 
// https://www.warcraftlogs.com/reports/T6NCZ79yzK4D32x8#fight=1&type=healing&source=4&options=8

const INNERVATE_COOLDOWN = 120000;
const INNERVATE_DURATION = 12000;
const COOLDOWN_REDUCTION = 1000;

class EarlyHarvest extends Analyzer{
  static dependencies = {
    spellUsable : SpellUsable,
  };
  
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
    
    if(this.spellUsable.isOnCooldown(SPELLS.INNERVATE.id)) {
      const invCooldownRemaining = this.spellUsable.cooldownRemaining(SPELLS.INNERVATE.id);
      // min to handle if on cooldown with less than COOLDOWN_REDUCTION milliseconds remaining 
      const cooldownReduced = Math.min(COOLDOWN_REDUCTION, invCooldownRemaining);
      this.innervateCooldownReduced += cooldownReduced;
      this.spellUsable.reduceCooldown(SPELLS.INNERVATE.id, cooldownReduced);
      this.numEarlyHarvestCooldownReductions += 1;
    }
  }

  statistic(){
    const healingFromWildGrowthExpiration = this.owner.getPercentageOfTotalHealingDone(this.healingFromWildGrowthExpiration);
    const innervateCooldownReducedInSeconds = this.innervateCooldownReduced/1000.0;
    
    return(
      <TraitStatisticBox
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
