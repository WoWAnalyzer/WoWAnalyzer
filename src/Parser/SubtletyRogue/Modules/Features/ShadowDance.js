import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

class ShadowDance extends Module {
  totalShadowDanceCast = 0;
  totalDamageDoneInShadowDance = 0;
  
  totalEviscerateDamageInShadowDance = 0;
  
  inShadowDance = false;
  
  
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SHADOW_DANCE.id) {
      this.totalShadowDanceCast += 1;
      return;
    }
  }
  
  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (this.inShadowDance) {
      this.totalDamageDoneInShadowDance += event.amount;
      if (spellId === SPELLS.EVISCERATE.id) {
        this.totalEviscerateDamageInShadowDance += 1;
      }
    }
  }
  
  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SHADOW_DANCE_BUFF.id) {
      this.inShadowDance = true;
      return;
    }
  }
  
  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SHADOW_DANCE_BUFF.id) {
      this.inShadowDance = false;
      return;
    }
  }
}

export default ShadowDance;
