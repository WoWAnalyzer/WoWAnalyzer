import SPELLS from 'common/SPELLS';
import CoreSpellUsable, { INVALID_COOLDOWN_CONFIG_LAG_MARGIN } from 'parser/shared/modules/SpellUsable';
import GrandCrusader from '../core/GrandCrusader';

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
    gc: GrandCrusader,
  };

  constructor(...args) {
    super(...args);
    this._hasCJ = this.selectedCombatant.hasTalent(SPELLS.CRUSADERS_JUDGMENT_TALENT.id);
  }

  beginCooldown(spellId, cooldownTriggerEvent) {
    if (spellId === SPELLS.AVENGERS_SHIELD.id) {
      if (this.isOnCooldown(spellId) && this.cooldownRemaining(spellId) > INVALID_COOLDOWN_CONFIG_LAG_MARGIN) {
        this.gc.triggerInferredReset(this, cooldownTriggerEvent);
      }
    } else if (this._hasCJ && spellId === SPELLS.JUDGMENT_CAST_PROTECTION.id) {
      if (!this.isAvailable(spellId) && this.cooldownRemaining(spellId) > INVALID_COOLDOWN_CONFIG_LAG_MARGIN) {
        this.gc.triggerInferredReset(this, cooldownTriggerEvent);
      }
    }

    super.beginCooldown(spellId, cooldownTriggerEvent);
  }
}

export default SpellUsable;
