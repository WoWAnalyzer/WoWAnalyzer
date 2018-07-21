import SPELLS from 'common/SPELLS';

import FilteredDamageTracker from './FilteredDamageTracker';


class StealthDamageTracker extends FilteredDamageTracker {
  
  delayWindow = 0;

  STEALTH_BUFFS = [
    SPELLS.STEALTH_BUFF,
    SPELLS.VANISH_BUFF,
  ];

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FIND_WEAKNESS_TALENT.id);

    if(this.selectedCombatant.hasTalent(SPELLS.SUBTERFUGE_TALENT.id))
    {
      //Subterfuge allows use of stealth abilities for 3 seconds after stealth fades
      this.delayWindow += 3000;
    }
  }
  
  shouldProcessEvent(event) {
    return this.isStealth();
  }

  isStealth() {
    return this.STEALTH_BUFFS.some(s=>this.selectedCombatant.hasBuff(s.id, null , this.delayWindow));        
  }
}

export default StealthDamageTracker;