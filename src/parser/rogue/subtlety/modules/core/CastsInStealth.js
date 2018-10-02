import SPELLS from 'common/SPELLS';
import DamageTracker from 'parser/core/modules/AbilityTracker';

import CastsInStealthBase from './CastsInStealthBase';
import StealthDamageTracker from '../../../shared/casttracker/StealthDamageTracker';

class CastsInStealth extends CastsInStealthBase {
  static dependencies = {
    damageTracker: DamageTracker,
    stealthDamageTracker: StealthDamageTracker,
  };

  constructor(...args) {
    super(...args);
    
    this.maxCastsPerStealth = 1 + (this.selectedCombatant.hasTalent(SPELLS.SUBTERFUGE_TALENT.id) ? 2 : 0);

    this.stealthCondition = this.selectedCombatant.hasTalent(SPELLS.SUBTERFUGE_TALENT.id) 
    ? "Stealth or Vanish with Subterfuge"
    : "Stealth or Vanish";

    this.stealthDamageTracker.subscribeInefficientCast(
      this.badStealthSpells,
      (s) => `Cast Shadowstrike instead of ${s.name} when you are in ${this.stealthCondition} window`
    );    
  }

  get stealthBackstabThresholds() {
    return this.createWrongCastThresholds(this.backstabSpell, this.stealthDamageTracker);
  }

  suggestions(when) {
    this.suggestWrongCast(when,this.backstabSpell,this.stealthBackstabThresholds);
    this.suggestAvgCasts(when, SPELLS.STEALTH);
  }
  
  get stealthMaxCasts(){
    return this.maxCastsPerStealth * (this.damageTracker.getAbility(SPELLS.VANISH.id).casts + 1);
  }
  get stealthActualCasts(){
    return this.validStealthSpellIds.map(s=>this.stealthDamageTracker.getAbility(s).casts || 0).reduce((p,c) => p + c);
  }
}

export default CastsInStealth;
