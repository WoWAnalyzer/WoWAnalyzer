import SPELLS from 'common/SPELLS';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';

const FURY_EXECUTES = [SPELLS.EXECUTE_FURY.id, SPELLS.EXECUTE_FURY_MASSACRE.id];

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
  lastExecute = null;
  executeCdrEvents = [];

  on_byPlayer_cast(event) {
    if (super.on_byPlayer_cast) {
      super.on_byPlayer_cast(event);
    }

    const spellId = event.ability.guid;
    if (spellId === SPELLS.RAGING_BLOW.id) {
      this.lastPotentialTriggerForRagingBlow = event;
    }

    if (FURY_EXECUTES.includes(spellId)) {
      this.lastExecute = event.timestamp;
    }
  }

  beginCooldown(spellId, ...args) {
    if (spellId === SPELLS.RAGING_BLOW.id) {
      // Raging Blow has a 20% chance to reset its own cooldown when cast. The combatlog has no events for this, so we have to do this hack to account for it. This ends the cooldown upon a new cast if it turns out to still be on cooldown so it looks to be working ok.
      if (this.isOnCooldown(spellId)) {
        this.endCooldown(spellId, undefined, this.lastPotentialTriggerForRagingBlow ? this.lastPotentialTriggerForRagingBlow.timestamp : undefined);
      }
    }
    if (this.hasSuddenDeath && FURY_EXECUTES.includes(spellId)) {
      if (this.isOnCooldown(spellId)) {
        this.executeCdrEvents[this.lastExecute] = this.cooldownRemaining(spellId);
        this.endCooldown(spellId);
      }
    }

    // We must do this after ending the cd or it will trigger an error
    super.beginCooldown(spellId, ...args);
  }
}

export default SpellUsable;
