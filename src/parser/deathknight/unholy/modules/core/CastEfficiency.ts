import SPELLS from 'common/SPELLS';
import { EventType, UpdateSpellUsableEvent } from 'parser/core/Events';
import Ability from 'parser/core/modules/Ability';
import CoreCastEfficiency, { AbilityCastEfficiency } from 'parser/shared/modules/CastEfficiency';

class CastEfficiency extends CoreCastEfficiency {
  getCastEfficiencyForAbility(ability: Ability, includeNoCooldownEfficiency = false):
   AbilityCastEfficiency | null {
    const castEfficiency = super.getCastEfficiencyForAbility(ability, includeNoCooldownEfficiency);
    if (ability.primarySpell.id !== SPELLS.ARMY_OF_THE_DEAD.id) {
      return castEfficiency;
    }
    
    // this doesn't fix negative time on CD
    if (castEfficiency && this.selectedCombatant.hasTalent(SPELLS.ARMY_OF_THE_DAMNED_TALENT.id) 
    && this.owner.fightDuration) {
      castEfficiency.maxCasts += 1;
    } 
    return castEfficiency;
  }
}

export default CastEfficiency;