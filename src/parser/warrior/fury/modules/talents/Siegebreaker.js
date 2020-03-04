import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { formatPercentage, formatThousands } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Enemies from 'parser/shared/modules/Enemies';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import SpellLink from 'common/SpellLink';


const SIEGEBREAKER_DAMAGE_MODIFIER = 0.15;

class Siegebreaker extends Analyzer {
  static dependencies = {
      enemies: Enemies,
  }

  damage = 0;
  goodRecklessness = 0;
  recklessnessCasted = 0;
  inValidRecklessness = false;
  siegeCasted = false;
  lastRecklessness = null;

  constructor(...args) {
      super(...args);
      this.active = this.selectedCombatant.hasTalent(SPELLS.SIEGEBREAKER_TALENT.id);

      if (!this.active) {
        return;
      }
      
      this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onPlayerDamage);
      this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SIEGEBREAKER_TALENT), this.siegeTurnOn);
      this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RECKLESSNESS), this.playerCastedRecklessness);
      this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.RECKLESSNESS), this.buffCheck);
      this.addEventListener(Events.fightend, this.buffCheck);
  }

  playerCastedRecklessness(event){
    this.inValidRecklessness = true;
    this.recklessnessCasted += 1;
    this.lastRecklessness = event;
  }

  siegeTurnOn(event){
    if(this.inValidRecklessness){
      this.siegeCasted = true;
    }
  }

  buffCheck(event){
    if(this.inValidRecklessness && this.siegeCasted){
      this.goodRecklessness += 1;
    }else if(this.inValidRecklessness){
      this.lastRecklessness.meta = event.meta || {};
      this.lastRecklessness.meta.isInefficientCast = true;
      this.lastRecklessness.meta.inefficientCastReason = `You didn't cast Siege Breaker during this Recklessness.`;
    }
    this.inValidRecklessness = false;
    this.siegeCasted = false;
  }

  onPlayerDamage(event) {
    const enemy = this.enemies.getEntity(event);
    if (enemy && enemy.hasBuff(SPELLS.SIEGEBREAKER_DEBUFF.id)) {
      this.damage += calculateEffectiveDamage(event, SIEGEBREAKER_DAMAGE_MODIFIER);
    }
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damage);
  }

  get dpsValue() {
    return this.damage / (this.owner.fightDuration / 1000);
  }

  get suggestionThresholds(){
	  return{
		  actual: (this.goodRecklessness / this.recklessnessCasted),
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
      return suggest(<>You're not casting <SpellLink id={SPELLS.SIEGEBREAKER_TALENT.id} /> and <SpellLink id={SPELLS.RECKLESSNESS.id} /> together.</>)
        .icon(SPELLS.SIEGEBREAKER_TALENT.icon)
        .actual(`${formatPercentage(actual)}% of Recklessnesses casts without a Siegebreaker cast`)
        .recommended(`${formatPercentage(recommended)}+% is recommended`);
    });
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.SIEGEBREAKER_TALENT.id}
        label="Siegebreaker"
        value={`${formatThousands(this.dpsValue)} DPS`}
        tooltip={<><strong>{formatThousands(this.damage)} ({formatPercentage(this.damagePercent)}%)</strong> of your damage can be attributed to Siegebreaker's damage bonus.</>}
      />
    );
  }
}
 export default Siegebreaker;
