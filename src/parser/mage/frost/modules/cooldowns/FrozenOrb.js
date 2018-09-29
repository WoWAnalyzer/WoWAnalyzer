import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import SpellUsable from 'parser/core/modules/SpellUsable';

const REDUCTION_MS = 500;

class FrozenOrb extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BLIZZARD_DAMAGE.id) {
      return;
    }

    if (this.spellUsable.isOnCooldown(SPELLS.FROZEN_ORB.id)) {
      this.spellUsable.reduceCooldown(SPELLS.FROZEN_ORB.id, REDUCTION_MS);
    }
  }

}

export default FrozenOrb;
