import SPELLS from 'common/SPELLS/warrior';
import TALENTS from 'common/TALENTS/warrior';
import { Options } from 'parser/core/Analyzer';
import { AbilityEvent, CastEvent } from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';

const FURY_EXECUTES = [SPELLS.EXECUTE_FURY.id, SPELLS.EXECUTE_FURY_MASSACRE.id];

class SpellUsable extends CoreSpellUsable {
  hasSuddenDeath = false;
  hasImprovedRagingBlow = false;
  lastPotentialTriggerForRagingBlow: CastEvent | null = null;
  lastExecute: number | null = null;
  executeCdrEvents: number[] = [];

  constructor(options: Options) {
    super(options);
    this.hasSuddenDeath = this.selectedCombatant.hasTalent(TALENTS.SUDDEN_DEATH_FURY_TALENT);
    this.hasImprovedRagingBlow = this.selectedCombatant.hasTalent(
      TALENTS.IMPROVED_RAGING_BLOW_TALENT,
    );
  }

  onCast(event: CastEvent) {
    super.onCast(event);

    const spellId = event.ability.guid;
    if (spellId === SPELLS.RAGING_BLOW.id) {
      this.lastPotentialTriggerForRagingBlow = event;
    }

    if (FURY_EXECUTES.includes(spellId)) {
      this.lastExecute = event.timestamp;
    }
  }

  beginCooldown(
    cooldownTriggerEvent: AbilityEvent<any>,
    spellId: number = cooldownTriggerEvent.ability.guid,
  ) {
    if (this.hasImprovedRagingBlow && spellId === SPELLS.RAGING_BLOW.id) {
      // Raging Blow has a 25% chance to reset its own cooldown when cast. The combatlog has no events for this, so we have to do this hack to account for it. This ends the cooldown upon a new cast if it turns out to still be on cooldown so it looks to be working ok.
      if (!this.isAvailable(spellId)) {
        this.endCooldown(
          spellId,
          this.lastPotentialTriggerForRagingBlow
            ? this.lastPotentialTriggerForRagingBlow.timestamp
            : undefined,
        );
      }
    } else if (this.hasSuddenDeath && FURY_EXECUTES.includes(spellId)) {
      if (this.isOnCooldown(spellId) && this.lastExecute) {
        this.executeCdrEvents[this.lastExecute] = this.cooldownRemaining(spellId);
        this.endCooldown(spellId);
      }
    }

    // We must do this after ending the cd or it will trigger an error
    super.beginCooldown(cooldownTriggerEvent, spellId);
  }
}

export default SpellUsable;
