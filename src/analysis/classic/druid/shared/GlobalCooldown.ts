import SPELLS from 'common/SPELLS/classic/druid';
import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';

/**
 * Shooting Stars buff makes Starsurge an instant cast with Min GCD
 */

const BUFFER = 60;

class GlobalCooldown extends CoreGlobalCooldown {
  getGlobalCooldownDuration(spellId: number) {
    const gcd = super.getGlobalCooldownDuration(spellId);
    const starsurge = spellId === SPELLS.STARSURGE.id;
    const ssBuff = this.selectedCombatant.hasBuff(SPELLS.SHOOTING_STARS.id, null, BUFFER);
    if (gcd && starsurge && ssBuff) {
      return this.minDuration;
    }
    return gcd;
  }
}

export default GlobalCooldown;
