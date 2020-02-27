import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS/index';
import { formatPercentage} from 'common/format';
import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import SpellLink from 'common/SpellLink';

import SpellUsable from 'parser/shared/modules/SpellUsable';
import RageTracker from '../core/RageTracker';

class Whirlwind extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    rageTracker: RageTracker,
  };

  hasDragonsRoar = false;
  hasBladeStorm = false;

  lastCastWW = false;

  drWasAvailable = false;//dragons roar
  bsWasAvailable = false;//blade storm
  btWasAvailable = false;//bloodthirst
  ramWasAvailable = false;//rampage
  rbWasAvailable = false;//raging blow
  exWasAvailable = false;//execute

  lastEvent;

  enemiesHitWW = [];

  wasEnraged = false;

  executeThreshold = 0;

  wwCast = 0;
  badWWCast = 0;

  hasWWBuff = false;

  rampageCost = 0;

  constructor(...args) {
    super(...args);
    this.hasDragonsRoar = this.selectedCombatant.hasTalent(SPELLS.DRAGON_ROAR_TALENT.id);
    this.hasBladeStorm = this.selectedCombatant.hasTalent(SPELLS.BLADESTORM_TALENT.id);
    this.executeThreshold = this.selectedCombatant.hasTalent(SPELLS.MASSACRE_TALENT_FURY.id) ? 0.35 : 0.2;
    this.rampageCost = this.selectedCombatant.hasTalent(SPELLS.CARNAGE_TALENT.id) ? 75 : 85;
    this.rampageCost = this.selectedCombatant.hasTalent(SPELLS.FROTHING_BERSERKER_TALENT.id) ? 95 : this.rampageCost;

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.WHIRLWIND_FURY), this.spellCheck);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.WHIRLWIND_FURY_DAMAGE_MH, SPELLS.WHIRLWIND_FURY_DAMAGE_OH]), this.wwDamage);

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.WHIRLWIND_BUFF), this.noHadBuff);
    this.addEventListener(Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.WHIRLWIND_BUFF), this.hadBuff);
    
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.wasValidWW);
  }

  noHadBuff(event){
    this.hasWWBuff = false;
  }

  hadBuff(event){
    this.hasWWBuff = true;
  }

  //just check what else they could have casted
  spellCheck(event){
    this.lastEvent = event;
    
    this.btWasAvailable = this.spellUsable.isAvailable(SPELLS.BLOODTHIRST.id);
    this.rbWasAvailable = this.spellUsable.isAvailable(SPELLS.RAGING_BLOW.id);
    this.ramWasAvailable = this.rageTracker.current >= this.rampageCost ? this.spellUsable.isAvailable(SPELLS.RAMPAGE.id) : false;
    this.exWasAvailable = this.isExecuteBelowThreshold(event) ? this.spellUsable.isAvailable(SPELLS.EXECUTE_FURY.id) : false;

    this.bsWasAvailable = this.hasBladeStorm ? this.spellUsable.isAvailable(SPELLS.BLADESTORM_TALENT.id) : false;
    this.drWasAvailable = this.hasDragonsRoar ? this.spellUsable.isAvailable(SPELLS.DRAGON_ROAR_TALENT.id) : false;

    this.wasEnraged = this.selectedCombatant.hasBuff(SPELLS.ENRAGE.ID);

    this.enemiesHitWW = [];
    this.wwCast += 1;
    this.lastCastWW = true;
  }

  wwDamage(event){
    const enemy = `${event.targetID} ${event.targetInstance || 0}`;

    if(!this.enemiesHitWW.includes(enemy)){
      this.enemiesHitWW.push(enemy);
    }
  }

  isExecuteBelowThreshold(event) {
    return event.hitPoints / event.maxHitPoints < this.executeThreshold;
  }

  wasValidWW(event){
    if(!this.lastCastWW || event === this.lastEvent || event.timestamp - 750 < this.lastEvent.timestamp){
      return;
    }

    this.lastCastWW = false;

    let badCast = this.btWasAvailable || this.rbWasAvailable || this.ramWasAvailable || this.exWasAvailable;
    
    if(this.wasEnraged){
      badCast = badCast || (this.hasBladeStorm ? this.bsWasAvailable : false);
      badCast = badCast || (this.hasDragonsRoar ? this.drWasAvailable : false);
    }
    
    if(this.enemiesHitWW.length>=2 && !this.hasWWBuff){
      badCast = false;
    }

    if(badCast){
      this.lastEvent.meta = event.meta || {};
      this.lastEvent.meta.isInefficientCast = true;
      this.badWWCast += 1;
    }
  }

  get threshold(){
    return ((this.wwCast - this.badWWCast) / this.wwCast);
  }

  get suggestionThresholds(){
	  return{
		  actual: this.threshold,
		  isLessThan:{
			  minor: .9,
			  average: .8,
			  major: .7,
		  },
		  style: 'percentage',
	  };
  }

  suggestions(when){
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<>You're casting <SpellLink id={SPELLS.WHIRLWIND_FURY.id} /> poorly. Try to only use it if your other abilities are on cooldown.</>)
        .icon(SPELLS.SIEGEBREAKER_TALENT.icon)
        .actual(`${formatPercentage(actual)}% of bad Whirlwind casts`)
        .recommended(`${formatPercentage(recommended)}+% is recommended`);
    });
  }

  
}

export default Whirlwind;
