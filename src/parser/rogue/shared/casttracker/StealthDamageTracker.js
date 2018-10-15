import SPELLS from 'common/SPELLS';

import FilteredDamageTracker from './FilteredDamageTracker';
import {isStealth} from '../stealth/IsStealth';


class StealthDamageTracker extends FilteredDamageTracker {
  
  delayWindow = 0;

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
    return isStealth(this.selectedCombatant, this.delayWindow);
  }
}

export default StealthDamageTracker;
