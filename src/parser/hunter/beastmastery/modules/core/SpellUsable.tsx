import SPELLS from 'common/SPELLS';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
import { CastEvent } from '../../../../core/Events';

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
  };

  lastPotentialTriggerForBarbedShotReset: CastEvent | undefined;
  on_byPlayer_cast(event: CastEvent) {
    if (super.on_byPlayer_cast) {
      super.on_byPlayer_cast(event);
    }
    const spellId = event.ability.guid;
    if (spellId === SPELLS.AUTO_SHOT.id) {
      this.lastPotentialTriggerForBarbedShotReset = event;
    } else if (spellId === SPELLS.BARBED_SHOT.id) {
      this.lastPotentialTriggerForBarbedShotReset = undefined;
    }
  }

  beginCooldown(spellId: number, cooldownTriggerEvent: any) {
    if (spellId === SPELLS.BARBED_SHOT.id) {
      if (this.isOnCooldown(spellId)) {
        this.endCooldown(
          spellId,
          undefined,
          this.lastPotentialTriggerForBarbedShotReset
            ? this.lastPotentialTriggerForBarbedShotReset.timestamp
            : undefined,
        );
      }
    }

    super.beginCooldown(spellId, cooldownTriggerEvent);
  }
}

export default SpellUsable;
