import Analyzer, { Options } from 'parser/core/Analyzer';
import DamageTracker from 'parser/shared/modules/AbilityTracker';
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

  protected damageTracker!: DamageTracker;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DARK_SHADOW_TALENT.id);
  }

  get totalShadowDanceCast() {
    return this.damageTracker.getAbility(SPELLS.SHADOW_DANCE.id).casts;
  }
}

export default DarkShadow;
