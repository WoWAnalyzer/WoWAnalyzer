import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink'; 
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import DamageTracker from 'Parser/Core/Modules/AbilityTracker';

import DanceDamageTracker from './../RogueCore/DanceDamageTracker';

class CastsInShadowDance extends Analyzer {
  
  static dependencies = {
    damageTracker: DamageTracker,
    danceDamageTracker: DanceDamageTracker,
    combatants: Combatants,
  };

  suggestions(when) {    
    this.suggestBackstab(when);
    this.suggestGloomblade(when);
    this.suggestAvgCasts(when);
  }
  
  statistic() {
    const shadowDanceUptime = this.combatants.selected.getBuffUptime(SPELLS.SHADOW_DANCE_BUFF.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SHADOW_DANCE_BUFF.id} />}
        value={`${formatPercentage(shadowDanceUptime)} %`}
        label="Shadow Dance uptime"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);
  
  
  suggestBackstab(when) {
    const filtered = this.danceDamageTracker.getAbility(SPELLS.BACKSTAB.id).casts;
    when(filtered).isGreaterThan(0)
    .addSuggestion((suggest, actual, recommended) => {
      return suggest(<React.Fragment>Use <SpellLink id={SPELLS.SHADOWSTRIKE.id} /> instead of <SpellLink id={SPELLS.BACKSTAB.id} /> during <SpellLink id={SPELLS.SHADOW_DANCE.id} />. </React.Fragment>)
        .icon(SPELLS.BACKSTAB.icon)
        .actual(`You cast Backstab ${filtered} times during Shadow Dance.`)
        .recommended(`${recommended} is recommended`)
        .major(0.1); //Always major
    });    
  }
  suggestGloomblade(when) {
    const filtered = this.danceDamageTracker.getAbility(SPELLS.GLOOMBLADE_TALENT.id).casts;
    when(filtered).isGreaterThan(0)
    .addSuggestion((suggest, actual, recommended) => {
    return suggest(<React.Fragment>Use <SpellLink id={SPELLS.SHADOWSTRIKE.id} /> instead of <SpellLink id={SPELLS.GLOOMBLADE_TALENT.id} /> during <SpellLink id={SPELLS.SHADOW_DANCE.id} />. </React.Fragment>)
        .icon(SPELLS.GLOOMBLADE_TALENT.icon)
        .actual(`You cast Gloomblade ${filtered} times during Shadow Dance.`)
        .recommended(`${recommended} is recommended`)
        .major(0.1); //Always major
    });  
  }
  suggestAvgCasts(when){
    const danceCount = this.damageTracker.getAbility(SPELLS.SHADOW_DANCE.id).casts;
    const castsInDance = (this.danceDamageTracker.getAbility(SPELLS.BACKSTAB.id).casts || 0)
    + (this.danceDamageTracker.getAbility(SPELLS.GLOOMBLADE_TALENT.id).casts || 0)
    + (this.danceDamageTracker.getAbility(SPELLS.SHURIKEN_STORM.id).casts || 0)
    + (this.danceDamageTracker.getAbility(SPELLS.SHADOWSTRIKE.id).casts || 0)
    + (this.danceDamageTracker.getAbility(SPELLS.NIGHTBLADE.id).casts || 0)
    + (this.danceDamageTracker.getAbility(SPELLS.EVISCERATE.id).casts || 0);

    const missedCastsInDanceShare = castsInDance/(danceCount * 4);
    when(missedCastsInDanceShare).isLessThan(1)
    .addSuggestion((suggest, actual, recommended) => {
      return suggest(<React.Fragment>Try to cast 4 spells during each <SpellLink id={SPELLS.SHADOW_DANCE_BUFF.id} /> </React.Fragment>)
        .icon(SPELLS.SHADOW_DANCE_BUFF.icon)
        .actual(`You cast ${castsInDance} spells during Shadow Dance out of ${danceCount * 4} possible.`)
        .recommended(`4 spells cast per Shadow Dance is recommended`)
        .regular(0.90).major(0.80);
    });
  }
}

export default CastsInShadowDance;
