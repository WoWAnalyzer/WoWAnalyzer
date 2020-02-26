import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { formatNumber, formatThousands, formatPercentage } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import SpellLink from 'common/SpellLink';

class Bladestorm extends Analyzer {

  totalDamage = 0;
  rageGained = 0;
  goodCast = 0;
  totalCasts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BLADESTORM_TALENT.id);

    if (!this.active) {
      return;
    }
    
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLADESTORM_TALENT), this.enrageCheck);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.BLADESTORM_DAMAGE, SPELLS.BLADESTORM_OH_DAMAGE]), this.onBladestormDamage);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.BLADESTORM_TALENT), this.onBladestormEnergize);
  }

  enrageCheck(event){
    if(this.selectedCombatant.hasBuff(SPELLS.ENRAGE.id)){
      this.goodCast += 1;
    }else{
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = `You casted Bladestorm outside of Enrage.`;
    }
    this.totalCasts +=1;
  }

  onBladestormDamage(event) {
    this.totalDamage += event.amount + (event.absorbed || 0);
  }

  onBladestormEnergize(event) {
    this.rageGained += event.resourceChange;
  }

  get percentageDamage() {
    return this.owner.getPercentageOfTotalDamageDone(this.totalDamage);
  }

  get suggestionThresholds(){
	  return{
		  actual: (this.goodCast / this.totalCasts),
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
      return suggest(<>You're casting <SpellLink id={SPELLS.BLADESTORM_TALENT.id} /> outside of enrage.</>)
        .icon(SPELLS.SIEGEBREAKER_TALENT.icon)
        .actual(`${formatPercentage(1-actual)}% of Bladestorm casts outside of enrage`)
        .recommended(`${formatPercentage(recommended)}+% is recommended`);
    });
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.BLADESTORM_TALENT.id}
        value={`${formatNumber(this.totalDamage / this.owner.fightDuration * 1000)} DPS`}
        label="Bladestorm"
        tooltip={<><strong>{formatThousands(this.totalDamage)} ({formatPercentage(this.percentageDamage)}%)</strong> damage was done by Bladestorm, and <strong>{formatThousands(this.rageGained)}</strong> rage was generated.</>}
      />
    );
  }
}

export default Bladestorm;
