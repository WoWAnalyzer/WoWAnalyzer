import SPELLS from 'common/SPELLS';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Analyzer from 'parser/core/Analyzer';

/**
 * Perforate
 * Cooldown of Shadow Blades is reduced by 0.5s per backstab
 */
class Perforate extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.PERFORATE.id);
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.BACKSTAB.id) {
      return;
    }

    if (this.spellUsable.isOnCooldown(SPELLS.SHADOW_BLADES.id)) {
      this.spellUsable.reduceCooldown(SPELLS.SHADOW_BLADES.id, 500);
    }
  }
}

export default Perforate;
