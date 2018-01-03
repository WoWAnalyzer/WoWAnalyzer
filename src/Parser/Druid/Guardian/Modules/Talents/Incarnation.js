import Analyzer from 'Parser/Core/Analyzer';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import SPELLS from 'common/SPELLS';

class Incarnation extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.INCARNATION_GUARDIAN_OF_URSOC_TALENT.id === spellId) {
      if (this.spellUsable.isOnCooldown(SPELLS.MANGLE_BEAR.id)) {
        this.spellUsable.endCooldown(SPELLS.MANGLE_BEAR.id);
      }
      if (this.spellUsable.isOnCooldown(SPELLS.THRASH_BEAR.id)) {
        this.spellUsable.endCooldown(SPELLS.THRASH_BEAR.id);
      }
    }
  }
}

export default Incarnation;
