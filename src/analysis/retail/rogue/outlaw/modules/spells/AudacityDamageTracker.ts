import { FilteredDamageTracker } from 'analysis/retail/rogue/shared';
import SPELLS from 'common/SPELLS';

//--TODO: "minimalActiveTime" should be rogue current gcd, if the value is possible to get from somewhere, instead of a raw number

class AudacityDamageTracker extends FilteredDamageTracker {
  shouldProcessEvent(event: never): boolean {
    return this.selectedCombatant.hasBuff(SPELLS.AUDACITY_TALENT_BUFF.id, null, 0, 800);
  }
}

export default AudacityDamageTracker;
