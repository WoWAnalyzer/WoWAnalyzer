import SPELLS from 'common/SPELLS';

import FilteredDamageTracker from './FilteredDamageTracker';
import {isStealth} from '../stealth/IsStealth';


class StealthDamageTracker extends FilteredDamageTracker {
  
  // Workaround for stealth getting removed "before" the cast.
  delayWindow = 100;

  constructor(...args) {
    super(...args);

    if(this.selectedCombatant.hasTalent(SPELLS.SUBTERFUGE_TALENT.id)) {
      //Subterfuge allows use of stealth abilities for 3 seconds after stealth fades
      this.delayWindow += 3000;
    }
  }
  
  shouldProcessEvent(event) {
    return isStealth(this.selectedCombatant, this.delayWindow);
  }
}

export default StealthDamageTracker;
