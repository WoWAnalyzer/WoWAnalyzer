import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

/**
 * Focuses the power of Wind through Thas'dorah, dealing 800% Physical damage to your target, and leaving behind a trail of wind
 * for 5 sec that increases the movement speed of allies by 50%.
 */
class Windburst extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };
  casts = 0;

  on_initialized() {
    this.active = this.combatants.selected.traitsBySpellId[SPELLS.WINDBURST.id];
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.CYCLONIC_BURST_IMPACT_TRAIT.id && spellId !== SPELLS.WINDBURST.id && spellId !== SPELLS.CYCLONIC_BURST_TRAIT.id) {
      return;
    }
    if (this.casts === 0) {
      this.casts++;
      this.spellUsable.beginCooldown(SPELLS.WINDBURST.id, this.owner.fight.start_time);
    }
  }
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.WINDBURST.id) {
      return;
    }
    this.casts++;
  }
}

export default Windburst;
