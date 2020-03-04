import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { formatNumber, formatThousands, formatPercentage } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import SpellLink from 'common/SpellLink';

class DragonRoar extends Analyzer {

  targetsSlowed = 0;
  totalDamage = 0;
  rageGained = 0;
  goodCast = 0;
  totalCasts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DRAGON_ROAR_TALENT.id);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DRAGON_ROAR_TALENT), this.enrageCheck);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DRAGON_ROAR_TALENT), this.onDragonRoarDamage);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.DRAGON_ROAR_TALENT), this.onDragonRoarEnergize);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.DRAGON_ROAR_TALENT), this.onDragonRoarSlow);
  }

  enrageCheck(event){
    if(this.selectedCombatant.hasBuff(SPELLS.ENRAGE.id)){
      this.goodCast += 1;
    }else{
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = `You casted Dragons Roar outside of Enrage.`;
    }
    this.totalCasts +=1;
  }

  onDragonRoarDamage(event) {
    this.totalDamage += event.amount + (event.absorbed || 0);
  }

  onDragonRoarEnergize(event) {
    this.rageGained += event.resourceChange;
  }

  onDragonRoarSlow() {
    this.targetsSlowed += 1;
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
        talent={SPELLS.DRAGON_ROAR_TALENT.id}
        value={`${formatNumber(this.totalDamage / this.owner.fightDuration * 1000)} DPS`}
        label="Dragon Roar"
        tooltip={(
          <>
            Damage done: <strong>{formatThousands(this.totalDamage)} ({formatPercentage(this.percentageDamage)}%)</strong><br />
            Rage gained: <strong>{formatThousands(this.rageGained)}</strong><br />
            Enemies slowed: <strong>{formatThousands(this.targetsSlowed)}</strong>
          </>
        )}
      />
    );
  }
}

export default DragonRoar;
