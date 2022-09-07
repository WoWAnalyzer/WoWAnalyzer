import SPELLS from 'common/SPELLS';
import { AbilityEvent, CastEvent } from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
  };

  lastPotentialTriggerForBarbedShotReset: CastEvent | null = null;

  onCast(event: CastEvent) {
    super.onCast(event);
    const spellId = event.ability.guid;
    if (spellId === SPELLS.AUTO_SHOT.id) {
      this.lastPotentialTriggerForBarbedShotReset = event;
    } else if (spellId === SPELLS.BARBED_SHOT.id) {
      this.lastPotentialTriggerForBarbedShotReset = null;
    }
  }

  beginCooldown(triggerEvent: AbilityEvent<any>, spellId: number) {
    if (spellId === SPELLS.BARBED_SHOT.id) {
      if (this.isOnCooldown(spellId)) {
        this.endCooldown(
          spellId,
          this.lastPotentialTriggerForBarbedShotReset
            ? this.lastPotentialTriggerForBarbedShotReset.timestamp
            : undefined,
        );
      }
    }
    super.beginCooldown(triggerEvent, spellId);
  }
}

export default SpellUsable;
