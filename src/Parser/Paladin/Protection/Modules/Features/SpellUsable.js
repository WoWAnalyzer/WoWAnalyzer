import SPELLS from 'common/SPELLS';
import CoreSpellUsable from 'Parser/Core/Modules/SpellUsable';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';

class SpellUsable extends CoreSpellUsable {
  lastPotentialTrigger = null;
  on_byPlayer_cast(event) {
    if (super.on_byPlayer_cast) {
      super.on_byPlayer_cast(event);
    }

    const spellId = event.ability.guid;
    if (spellId === SPELLS.HAMMER_OF_THE_RIGHTEOUS.id || spellId === SPELLS.BLESSED_HAMMER_TALENT.id) {
      this.lastPotentialTrigger = event;
    } else if (spellId === SPELLS.AVENGERS_SHIELD.id) {
      this.lastPotentialTrigger = null;
    }
  }
  on_toPlayer_damage(event) {
    if (super.on_toPlayer_damage) {
      super.on_toPlayer_damage(event);
    }

    if ([HIT_TYPES.DODGE, HIT_TYPES.PARRY].includes(event.hitType)) {
      this.lastPotentialTrigger = event;
    }
  }

  beginCooldown(spellId, timestamp) {
    if (spellId === SPELLS.AVENGERS_SHIELD.id) {
      if (this.isOnCooldown(spellId)) {
        this.endCooldown(spellId, undefined, this.lastPotentialTrigger ? this.lastPotentialTrigger.timestamp : undefined);
      }
    }

    super.beginCooldown(spellId, timestamp);
  }
}

export default SpellUsable;
