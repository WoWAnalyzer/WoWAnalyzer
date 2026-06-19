import CoreAbility from 'parser/core/modules/Ability';
import { maybeGetTalentOrSpell } from 'common/maybeGetTalentOrSpell';
import { CLASSIC_EXPANSION } from 'game/Expansion';

/**
 * Classic-aware Ability subclass.
 *
 * The core Ability.name getter calls maybeGetTalentOrSpell with no expansion,
 * which defaults to the retail spell table and misses classic-only spells.
 * This override passes CLASSIC_EXPANSION so classic spell names resolve correctly.
 */
class ClassicAbility extends CoreAbility {
  get name(): string | undefined {
    if (this._name) {
      return this._name;
    }
    return maybeGetTalentOrSpell(this.primarySpell, CLASSIC_EXPANSION)?.name;
  }

  set name(value: string | undefined) {
    this._name = value;
  }
}

export default ClassicAbility;
