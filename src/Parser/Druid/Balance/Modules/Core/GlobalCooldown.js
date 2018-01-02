import SPELLS from 'common/SPELLS';
import CoreGlobalCooldown from 'Parser/Core/Modules/GlobalCooldown';
import Channeling from 'Parser/Core/Modules/Channeling';
import Combatants from 'Parser/Core/Modules/Combatants';

import Abilities from '../Features/Abilities';
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
  	//Starlord Solar Wrath
    if (spellId === SPELLS.SOLAR_WRATH_MOONKIN.id && this.combatants.selected.hasTalent(SPELLS.STARLORD_TALENT.id) && this.combatants.selected.hasBuff(SPELLS.SOLAR_EMP_BUFF.id)){
      return Math.max(this.owner.modules.alwaysBeCasting.constructor.MINIMUM_GCD, this.owner.modules.alwaysBeCasting.constructor.BASE_GCD / (1 + this.haste.current) * 0.8);
    }
    //Default
    super.getCurrentGlobalCooldown(spellId);
  }
}

export default GlobalCooldown;
