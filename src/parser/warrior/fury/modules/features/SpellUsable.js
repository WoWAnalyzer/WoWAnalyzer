import SPELLS from 'common/SPELLS';
import CoreSpellUsable from 'parser/core/modules/SpellUsable';

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
  };

  hasSuddenDeath = false;
  constructor(...args) {
    super(...args);
    this.hasSuddenDeath = this.selectedCombatant.hasTalent(SPELLS.SUDDEN_DEATH_TALENT_FURY.id);
  }

  lastPotentialTriggerForRagingBlow = null;
  on_byPlayer_cast(event) {
    if (super.on_byPlayer_cast) {
      super.on_byPlayer_cast(event);
    }

    const spellId = event.ability.guid;
    if (spellId === SPELLS.RAGING_BLOW.id) {
      this.lastPotentialTriggerForRagingBlow = event;
    }
  }

  beginCooldown(spellId, ...args) {
    if (spellId === SPELLS.RAGING_BLOW.id) {
      // Raging Blow has a 20% chance to reset its own cooldown when cast. The combatlog has no events for this, so we have to do this hack to account for it. This ends the cooldown upon a new cast if it turns out to still be on cooldown so it looks to be working ok.
      if (this.isOnCooldown(spellId)) {
        this.endCooldown(spellId, undefined, this.lastPotentialTriggerForRagingBlow ? this.lastPotentialTriggerForRagingBlow.timestamp : undefined);
      }
    }
    if (this.hasSuddenDeath && spellId === SPELLS.EXECUTE_FURY.id) {
      if (this.isOnCooldown(spellId)) {
        this.endCooldown(spellId);
      }
    }

    // We must do this after ending the cd or it will trigger an error
    super.beginCooldown(spellId, ...args);
  }
}

export default SpellUsable;
