import SPELLS from 'common/SPELLS';
import CoreSpellUsable from 'Parser/Core/Modules/SpellUsable';

class SpellUsable extends CoreSpellUsable {
  lastAvengersShield = null;
  on_byPlayer_cast(event) {
    super.on_byPlayer_cast(event);

    const spellId = event.ability.guid;
    if (spellId === SPELLS.AVENGERS_SHIELD.id) {
      this.lastAvengersShield = event;
    }
  }

  beginCooldown(spellId, timestamp) {
    if (spellId === SPELLS.AVENGERS_SHIELD.id) {
      if (this.isOnCooldown(spellId)) {
        this.endCooldown(spellId, undefined, this.lastAvengersShield ? this.lastAvengersShield.timestamp : undefined);
      }
    }

    super.beginCooldown(spellId, timestamp);
  }
}

export default SpellUsable;
