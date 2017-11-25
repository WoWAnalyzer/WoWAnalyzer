import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';

class DarkShadow extends Analyzer {

  on_initialized() {
    this.active = this.owner.modules.combatants.selected.hasTalent(SPELLS.DARK_SHADOW_TALENT.id);
  }  

  get totalShadowDanceCast() {
    return this.owner.modules.abilityTracker.getAbility(SPELLS.SHADOW_DANCE.id).casts;
  }

  totalDamageDoneInShadowDance = 0;
  totalEviscerateHitsInShadowDance = 0;

  //Includes the DFA Eviscerate. 
  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (this.owner.modules.combatants.selected.hasBuff(SPELLS.SHADOW_DANCE_BUFF.id)) {
      this.totalDamageDoneInShadowDance += event.amount;
      if (spellId === SPELLS.EVISCERATE.id) {
        this.totalEviscerateHitsInShadowDance += 1;
      }
    }
  }
}

export default DarkShadow;
