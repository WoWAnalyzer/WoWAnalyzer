import SPELLS from 'common/SPELLS';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';

class SpellUsable extends CoreSpellUsable {
  beginCooldown(spellId, cooldownTriggerEvent) {
    if (spellId === SPELLS.THUNDER_FOCUS_TEA.id && this.isOnCooldown(spellId)) {
      // Font of Life has a random chance to reduce the cooldown with no way to detect from logs. So just ignore it.
      this.endCooldown(spellId, cooldownTriggerEvent.timestamp);
    }

    super.beginCooldown(spellId, cooldownTriggerEvent);
  }
}

export default SpellUsable;
