import SPELLS from 'common/SPELLS';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
  };

  beginCooldown(spellId, ...args) {
    // Tactician passive: You have a 1.40% chance per Rage spent on damaging abilities to reset the remaining cooldown on Overpower.
    if (spellId === SPELLS.OVERPOWER.id) {
      if (this.isOnCooldown(spellId)) {
        this.endCooldown(spellId);
      }
    }

    // We must do this after ending the cd or it will trigger an error
    super.beginCooldown(spellId, ...args);
  }
}

export default SpellUsable;
