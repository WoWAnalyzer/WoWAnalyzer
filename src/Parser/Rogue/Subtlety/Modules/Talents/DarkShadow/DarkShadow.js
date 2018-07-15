import Analyzer from 'Parser/Core/Analyzer';
import DamageTracker from 'Parser/Core/Modules/AbilityTracker';
import SPELLS from 'common/SPELLS';


/**
 * Dark Shadow
 * While Shadow Dance is active, all damage you deal is increased by 25%.
 * -----
 * When this talent is active, rotation may change to put high damage abilities in to the Dance window.
 */
class DarkShadow extends Analyzer {
  static dependencies = {
    damageTracker: DamageTracker,
  };

  get totalShadowDanceCast() {
    return this.damageTracker.getAbility(SPELLS.SHADOW_DANCE.id).casts;
  }
  
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DARK_SHADOW_TALENT.id);
  }
}

export default DarkShadow;
