import { FilteredDamageTracker } from 'analysis/retail/rogue';
import SPELLS from 'common/SPELLS';

class DanceDamageTracker extends FilteredDamageTracker {
  shouldProcessEvent(event: any) {
    return this.selectedCombatant.hasBuff(SPELLS.SHADOW_DANCE_BUFF.id);
  }
}

export default DanceDamageTracker;
