import SPELLS from 'common/SPELLS';
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
    this.hasEcho = this.combatants.selected.hasTalent(SPELLS.ECHO_OF_THE_ELEMENTS_TALENT.id);
  }

  on_dispel(event) {
    if (!this.owner.byPlayer(event)) {
      return;
    }

    const spellId = event.ability.guid;
    if (spellId === SPELLS.PURIFY_SPIRIT.id) {
      super.beginCooldown(spellId, event.timestamp);
    }
  }

  beginCooldown(spellId, timestamp) {
    if (this.hasEcho && spellId === SPELLS.RIPTIDE.id) {
      if (!this.isAvailable(spellId)) {
        this.endCooldown(spellId);
      }
    }

    // Essentially having the purify spirit cast not be able to trigger the cooldown, the dispel event does it instead.
    if (spellId === SPELLS.PURIFY_SPIRIT.id) {
      return;
    }

    super.beginCooldown(spellId, timestamp);
  }
}

export default SpellUsable;
