import SPELLS from 'common/SPELLS';
import CoreGlobalCooldown from 'parser/core/modules/GlobalCooldown';
import Channeling from 'parser/core/modules/Channeling';

import Abilities from '../Abilities';
import Haste from './Haste';

const STARLORD_MULTIPLIER = 0.85;
const NEW_MOON_MULTIPLIER = 2/3;

/**
 * The talent Starlord reduces GCD and cast time of empowered Lunar Strikes and Solar Wraths by 20%.
 * Since Solar Wrath cast time == GCD the GCD needs to be reduced.
 */
class GlobalCooldown extends CoreGlobalCooldown {
  static dependencies = {
    abilities: Abilities,
    haste: Haste,
    channeling: Channeling,
  };

  getGlobalCooldownDuration(spellId) {
    const gcd = super.getGlobalCooldownDuration(spellId);
    if ((spellId === SPELLS.SOLAR_WRATH_MOONKIN.id && this.selectedCombatant.hasBuff(SPELLS.SOLAR_EMP_BUFF.id))
      || (spellId === SPELLS.LUNAR_STRIKE.id && this.selectedCombatant.hasBuff(SPELLS.LUNAR_EMP_BUFF.id))) {
      return Math.max(gcd * STARLORD_MULTIPLIER, 750);
    }
    if (spellId === SPELLS.NEW_MOON_TALENT.id) {
      return Math.max(gcd * NEW_MOON_MULTIPLIER, 750); // New Moon GCD is 1s reduced by haste but Half Moon and Full Moon are both 1.5s
    }
    return gcd;
  }
}

export default GlobalCooldown;
