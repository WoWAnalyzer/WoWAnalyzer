import TALENTS from 'common/TALENTS/rogue';
import SPELLS from 'common/SPELLS/rogue';
import Analyzer, { Options } from 'parser/core/Analyzer';
import DamageTracker from 'parser/shared/modules/AbilityTracker';

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
    this.active = this.selectedCombatant.hasTalent(TALENTS.DARK_SHADOW_TALENT);
  }

  get totalShadowDanceCast() {
    return this.damageTracker.getAbility(SPELLS.SHADOW_DANCE.id).casts;
  }
}

export default DarkShadow;
