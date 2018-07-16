import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import DamageTracker from 'Parser/Core/Modules/AbilityTracker';

import CastsInStealthBase from './CastsInStealthBase';
import DanceDamageTracker from './../RogueCore/DanceDamageTracker';

class CastsInShadowDance extends CastsInStealthBase {
  static dependencies = {
    damageTracker: DamageTracker,
    danceDamageTracker: DanceDamageTracker,
  };

  constructor(...args) {
    super(...args);
    
    this.maxCastsPerStealth = 5 + (this.selectedCombatant.hasTalent(SPELLS.SUBTERFUGE_TALENT.id) ? 1 : 0);

    this.stealthCondition = this.selectedCombatant.hasTalent(SPELLS.SUBTERFUGE_TALENT.id) 
    ? "Stealth or Vanish with Subterfuge"
    : "Stealth or Vanish";

    this.danceDamageTracker.subscribeInefficientCast(
      this.badStealthSpells,
      (s) => `Cast Shadowstrike instead of ${s.name} when you are in ${this.stealthCondition} window`
    );    
  }

  get danceBackstabThresholds() {
    return this.createWrongCastThresholds(this.backstabSpell, this.danceDamageTracker);
  }

  suggestions(when) {
    this.suggestWrongCast(when,this.backstabSpell,this.danceBackstabThresholds);
    this.suggestAvgCasts(when, SPELLS.SHADOW_DANCE);
  }
  
  get stealthMaxCasts(){
    return this.maxCastsPerStealth * this.damageTracker.getAbility(SPELLS.SHADOW_DANCE.id).casts || 0;
  }
  get stealthActualCasts(){
    return this.validStealthSpellIds.map(s=>this.danceDamageTracker.getAbility(s).casts || 0).reduce((p,c) => p + c);
  }

  statistic() {
    const shadowDanceUptime = this.selectedCombatant.getBuffUptime(SPELLS.SHADOW_DANCE_BUFF.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SHADOW_DANCE_BUFF.id} />}
        value={`${formatPercentage(shadowDanceUptime)} %`}
        label="Shadow Dance uptime"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default CastsInShadowDance;
