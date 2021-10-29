import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';

import FilteredDamageTracker from './FilteredDamageTracker';
import { isStealth } from './IsStealth';

class StealthDamageTracker extends FilteredDamageTracker {
  // Workaround for stealth getting removed "before" the cast.
  delayWindow: number = 100;

  constructor(options: Options) {
    super(options);

    if (this.selectedCombatant.hasTalent(SPELLS.SUBTERFUGE_TALENT.id)) {
      //Subterfuge allows use of stealth abilities for 3 seconds after stealth fades
      this.delayWindow += 3000;
    }
  }

  shouldProcessEvent(event: any) {
    return isStealth(this.selectedCombatant, this.delayWindow);
  }
}

export default StealthDamageTracker;
