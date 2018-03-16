import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import CoreSpellUsable from 'Parser/Core/Modules/SpellUsable';
import Combatants from 'Parser/Core/Modules/Combatants';
import Abilities from '../Abilities';

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
    combatants: Combatants,
    abilities: Abilities,
  };

  on_initialized() {
    this.hasEcho = this.combatants.selected.hasTalent(SPELLS.ECHO_OF_THE_ELEMENTS_TALENT.id) || this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_FARSEER.id);
  }

  beginCooldown(spellId, timestamp) {
    if (this.hasEcho && spellId === SPELLS.RIPTIDE.id) {
      if (!this.isAvailable(spellId)) {
        this.endCooldown(spellId);
      }
    }

    super.beginCooldown(spellId, timestamp);
  }
}

export default SpellUsable;
