import React from 'react';

import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import SPELLS from 'common/SPELLS';
import { formatNumber , formatPercentage } from 'common/format';
import Wrapper from 'common/Wrapper';
import SpellIcon from 'common/SpellIcon';

import Analyzer from 'Parser/Core/Analyzer';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Abilities from 'Parser/Core/Modules/Abilities';
import Combatants from 'Parser/Core/Modules/Combatants';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const RUNIC_CORRUPTION_INCREASE = 1;
const T21_4PIECE_BLOOD_INCREASE = .4;

/*
 * Runes are tracked as 3 fake spells with 2 charges to simulate 3 runes charging at the same time.
 * aslong as spells always use the rune pair with the shortest cooldown remaining it should match
 * its in game functionality.
 */
class RuneTracker extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    castEfficiency: CastEfficiency,
    abilities: Abilities,
    combatants: Combatants,
  };

  timeSpentWithRunesOnCooldown = {};
  resourceType = RESOURCE_TYPES.RUNES.id;

  on_byPlayer_cast(event){
    if(!event.classResources){
      return;
    }
  	event.classResources
      .filter(resource => resource.type === this.resourceType)
      .forEach(({ cost }) => {
        //should add a check here to see if amount matches our rune count.
        let runeCost = cost || 0;
        if(event.ability.guid === SPELLS.OBLITERATE.id && this.combatants.selected.hasBuff(SPELLS.OBLITERATION_TALENT.id)){
          runeCost--;
        }
      	for(let i = 0; i < runeCost; i++){
      		this.startCooldown();
      	}
      });
  }
  on_toPlayer_energize(event){
    if(event.resourceChangeType !== this.resourceType){
      return;
    }
    const amount = event.resourceChange;
    for(let i = 0; i < amount; i++){
      this.addCharge();
    }
  }
  on_toPlayer_applybuff(event){
    if(event.ability.guid === SPELLS.RUNIC_CORRUPTION.id){
      const multiplier = 1 / (1 + RUNIC_CORRUPTION_INCREASE);
      this.changeCooldown(SPELLS.RUNE_1.id, multiplier);
      this.changeCooldown(SPELLS.RUNE_2.id, multiplier);
      this.changeCooldown(SPELLS.RUNE_3.id, multiplier);
    }
    if(event.ability.guid === SPELLS.RUNE_MASTER.id){
      const multiplier = 1 / (1 + T21_4PIECE_BLOOD_INCREASE);
      this.changeCooldown(SPELLS.RUNE_1.id, multiplier);
      this.changeCooldown(SPELLS.RUNE_2.id, multiplier);
      this.changeCooldown(SPELLS.RUNE_3.id, multiplier);
    }
  }
  on_toPlayer_removebuff(event){
    if(event.ability.guid === SPELLS.RUNIC_CORRUPTION.id){
      const multiplier = 1 + RUNIC_CORRUPTION_INCREASE;
      this.changeCooldown(SPELLS.RUNE_1.id, multiplier);
      this.changeCooldown(SPELLS.RUNE_2.id, multiplier);
      this.changeCooldown(SPELLS.RUNE_3.id, multiplier);
    }
    if(event.ability.guid === SPELLS.RUNE_MASTER.id){
      const multiplier = 1 / (1 + T21_4PIECE_BLOOD_INCREASE);
      this.changeCooldown(SPELLS.RUNE_1.id, multiplier);
      this.changeCooldown(SPELLS.RUNE_2.id, multiplier);
      this.changeCooldown(SPELLS.RUNE_3.id, multiplier);
    }
  }

  changeCooldown(spellId, multiplier){
    if(!this.spellUsable.isOnCooldown(spellId)){
      return;
    }
    const remainingCooldown = this.spellUsable.cooldownRemaining(spellId);
    const newCooldown = remainingCooldown * multiplier;
    const reduction = remainingCooldown - newCooldown;
    this.spellUsable.reduceCooldown(spellId, reduction);
  }

  addCharge(){
    const runeId = this.longestCooldown;
    if(!this.spellUsable.isOnCooldown(runeId)){
      return;
    }
    const expectedCooldown = this.abilities.getExpectedCooldownDuration(runeId);
    this.spellUsable.reduceCooldown(runeId, expectedCooldown);
  }

  startCooldown(){
  	const runeId = this.shortestCooldown;
  	this.spellUsable.beginCooldown(runeId);
  }

  get shortestCooldown(){
  	const runeOneCooldown = this.getCooldown(SPELLS.RUNE_1.id) || 0;
  	const runeTwoCooldown = this.getCooldown(SPELLS.RUNE_2.id) || 0;
  	const runeThreeCooldown = this.getCooldown(SPELLS.RUNE_3.id) || 0;
  	if(runeOneCooldown <= runeTwoCooldown && runeOneCooldown <= runeThreeCooldown){
  		return SPELLS.RUNE_1.id;
  	}
  	else if(runeTwoCooldown <= runeThreeCooldown){
  		return SPELLS.RUNE_2.id;
  	} else {
      return SPELLS.RUNE_3.id;
    }
  }

  get longestCooldown(){
    const runeOneCooldown = this.getCooldown(SPELLS.RUNE_1.id) || 0;
    const runeTwoCooldown = this.getCooldown(SPELLS.RUNE_2.id) || 0;
    const runeThreeCooldown = this.getCooldown(SPELLS.RUNE_3.id) || 0;
    if(runeOneCooldown >= runeTwoCooldown && runeOneCooldown >= runeThreeCooldown){
      return SPELLS.RUNE_1.id;
    }
    else if(runeTwoCooldown >= runeThreeCooldown){
      return SPELLS.RUNE_2.id;
    } else {
      return SPELLS.RUNE_3.id;
    }
  }

  getCooldown(spellId){
  	if(!this.spellUsable.isOnCooldown(spellId)){
  		return null;
  	}
  	const chargesOnCooldown = 2 - this.spellUsable.chargesAvailable(spellId);
  	const cooldownRemaining = this.spellUsable.cooldownRemaining(spellId);
  	const fullChargeCooldown = this.abilities.getExpectedCooldownDuration(spellId);
    return (chargesOnCooldown - 1) * fullChargeCooldown + cooldownRemaining;
  }

  get runeEfficiency(){
    const runeCastEfficiencies = [];
    runeCastEfficiencies.push(this.castEfficiency.getCastEfficiencyForSpellId(SPELLS.RUNE_1.id).efficiency);
    runeCastEfficiencies.push(this.castEfficiency.getCastEfficiencyForSpellId(SPELLS.RUNE_2.id).efficiency);
    runeCastEfficiencies.push(this.castEfficiency.getCastEfficiencyForSpellId(SPELLS.RUNE_3.id).efficiency);
    return runeCastEfficiencies.reduce((accumulator, currentValue) => accumulator + currentValue) / runeCastEfficiencies.length;
  }

  get runesWasted(){
    const runeMaxCasts = [];
    runeMaxCasts.push(this.castEfficiency.getCastEfficiencyForSpellId(SPELLS.RUNE_1.id).maxCasts);
    runeMaxCasts.push(this.castEfficiency.getCastEfficiencyForSpellId(SPELLS.RUNE_2.id).maxCasts);
    runeMaxCasts.push(this.castEfficiency.getCastEfficiencyForSpellId(SPELLS.RUNE_3.id).maxCasts);
    const maxCasts = runeMaxCasts.reduce((accumulator, currentValue) => accumulator + currentValue);
    return maxCasts * (1 - this.runeEfficiency);
  }

  get suggestionThresholds() {
    return {
      actual: 1 - this.runeEfficiency,
      isGreaterThan: {
        minor: 0.05,
        average: 0.1,
        major: 0.2,
      },
      style: 'percentage',
    };
  }

  get suggestionThresholdsEfficiency() {
    return {
      actual: this.runeEfficiency,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>You overcapped {formatPercentage(actual)}% of your runes. Try to always have atleast 3 runes on cooldown.</Wrapper>)
        .icon(SPELLS.RUNE_1.icon)
        .actual(`${formatPercentage(actual)}% runes overcapped`)
        .recommended(`<${formatPercentage(recommended)}% is recommended`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.RUNE_1.id} />}
        value={`${formatPercentage(1 - this.runeEfficiency)} %`}
        label="Runes overcapped"
        tooltip={`
          Number of runes wasted: ${formatNumber(this.runesWasted)}
        `}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(1);
  
}

export default RuneTracker;
