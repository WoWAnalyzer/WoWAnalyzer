import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import SPELLS from 'common/SPELLS';

/**
 * The Global Cooldown of Fists of Fury is also being triggered by fabricated channeling events
 */
class GlobalCooldown extends CoreGlobalCooldown {
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    const isOnGCD = this.isOnGlobalCooldown(spellId);
    if (!isOnGCD) {
      // This ensures we don't crash when boss abilities are registered as casts which could even happen while channeling. For example on Trilliax: http://i.imgur.com/7QAFy1q.png
      return;
    }
    if (spellId === SPELLS.FISTS_OF_FURY_CAST.id) {
      return;
    }
    super.on_byPlayer_cast(event);
  }
}

export default GlobalCooldown;
