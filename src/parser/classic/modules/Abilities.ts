import CoreAbilities from 'parser/core/modules/Abilities';
import ClassicAbility from './Ability';

/**
 * Classic-aware Abilities module.
 *
 * Sets ABILITY_CLASS to ClassicAbility so that all spellbook entries use the
 * classic spell table for name resolution instead of the retail one.
 */
class ClassicAbilities extends CoreAbilities {
  static ABILITY_CLASS = ClassicAbility;
}

export default ClassicAbilities;
