import SPELLS from 'common/SPELLS';
import CoreSpellUsable from 'Parser/Core/Modules/SpellUsable';

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
  };

  lastPotentialTriggerForBarbedShotReset = null;
  on_byPlayer_cast(event) {
    if (super.on_byPlayer_cast) {
      super.on_byPlayer_cast(event);
    }

    const spellId = event.ability.guid;
    if (spellId === SPELLS.AUTO_SHOT.id) {
      this.lastPotentialTriggerForBarbedShotReset = event;
    } else if (spellId === SPELLS.BARBED_SHOT.id) {
      this.lastPotentialTriggerForBarbedShotReset = null;
    }
  }

  beginCooldown(spellId, timestamp) {
    if (spellId === SPELLS.BARBED_SHOT.id) {
      if (this.isOnCooldown(spellId)) {
        this.endCooldown(spellId, undefined, this.lastPotentialTriggerForBarbedShotReset ? this.lastPotentialTriggerForBarbedShotReset.timestamp : undefined);
      }
    }

    super.beginCooldown(spellId, timestamp);
  }
}

export default SpellUsable;
