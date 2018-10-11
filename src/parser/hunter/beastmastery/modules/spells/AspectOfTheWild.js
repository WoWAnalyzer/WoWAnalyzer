import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';

/**
 * Grants you and your pet 5 Focus per sec and 10% increased critical strike chance for 20 sec.
 * Reduces GCD by 200ms before haste.
 */

class AspectOfTheWild extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  casts = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ASPECT_OF_THE_WILD.id) {
      return;
    }
    this.casts += 1;
  }

  on_byPlayer_damage(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.ASPECT_OF_THE_WILD.id)) {
      return;
    }
    if (this.casts === 0) {
      this.casts += 1;
      this.spellUsable.beginCooldown(SPELLS.ASPECT_OF_THE_WILD.id, this.owner.fight.start_time);
    }
  }
}

export default AspectOfTheWild;
