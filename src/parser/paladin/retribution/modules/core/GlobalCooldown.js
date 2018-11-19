import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import SPELLS from 'common/SPELLS';
import Haste from './Haste';
import Abilities from '../Abilities';

const MIN_GCD= 750;

/**
 * The Global Cooldown from Wake of Ashes is currently double dipping haste
 */ 

class GlobalCooldown extends CoreGlobalCooldown {
  static dependencies = {
    abilities: Abilities,
    haste: Haste,
  };

  getGlobalCooldownDuration(spellId) {
    const gcd = super.getGlobalCooldownDuration(spellId);
    if (!gcd) {
      return 0;
    }
    if (spellId && spellId === SPELLS.WAKE_OF_ASHES_TALENT.id) {
      return Math.max(gcd / (1 + this.haste.current), MIN_GCD);
    }
    return Math.max(MIN_GCD, gcd);
  }
}

export default GlobalCooldown;
