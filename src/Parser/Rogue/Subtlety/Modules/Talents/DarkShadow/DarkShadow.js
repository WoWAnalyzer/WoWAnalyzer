import Analyzer from 'Parser/Core/Analyzer';
import DamageTracker from 'Parser/Core/Modules/AbilityTracker';
import SPELLS from 'common/SPELLS';

import DanceDamageTracker from './../../RogueCore/DanceDamageTracker';

class DarkShadow extends Analyzer {
  static dependencies = {
    damageTracker: DamageTracker,
    danceDamageTracker: DanceDamageTracker,
  };

  get totalShadowDanceCast() {
    return this.damageTracker.getAbility(SPELLS.SHADOW_DANCE.id).casts;
  }
  
  on_initialized() {
    this.active = this.owner.modules.combatants.selected.hasTalent(SPELLS.DARK_SHADOW_TALENT.id);
  }
}

export default DarkShadow;
