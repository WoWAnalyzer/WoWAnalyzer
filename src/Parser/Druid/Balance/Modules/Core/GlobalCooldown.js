import SPELLS from 'common/SPELLS';
import CoreGlobalCooldown from 'Parser/Core/Modules/GlobalCooldown';
import Channeling from 'Parser/Core/Modules/Channeling';
import Combatants from 'Parser/Core/Modules/Combatants';

import Abilities from '../Abilities';
import Haste from './Haste';

/**
 * The talent Starlord reduces GCD and cast time of empowered Lunar Strikes and Solar Wraths by 20%. 
 * Since Solar Wrath cast time == GCD the GCD needs to be reduced.
 */
class GlobalCooldown extends CoreGlobalCooldown {
  static dependencies = {
    abilities: Abilities,
    haste: Haste,
    combatants: Combatants,
    channeling: Channeling,
  };

  getCurrentGlobalCooldown(spellId = null) {
    const gcd = super.getCurrentGlobalCooldown(spellId);
    if ((spellId === SPELLS.SOLAR_WRATH_MOONKIN.id && this.combatants.selected.hasBuff(SPELLS.SOLAR_EMP_BUFF.id)) 
      || (spellId === SPELLS.LUNAR_STRIKE.id && this.combatants.selected.hasBuff(SPELLS.LUNAR_EMP_BUFF.id))){
      return Math.max(gcd * 0.8, this.owner.modules.alwaysBeCasting.constructor.MINIMUM_GCD);
    }
    return gcd;
  }
}

export default GlobalCooldown;
