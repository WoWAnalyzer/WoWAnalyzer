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

  isStarlordBuffedSolarWrath(event) {
  	return event.ability.guid === SPELLS.SOLAR_WRATH_MOONKIN.id && this.combatants.selected.hasTalent(SPELLS.STARLORD_TALENT.id) && this.combatants.selected.hasBuff(SPELLS.SOLAR_EMP_BUFF.id);
  }

  on_byPlayer_begincast(event) {
    if (this.isStarlordBuffedSolarWrath(event)) {
      this.triggerStarlordGlobalCooldown(event, 'begincast');
    } 
    return;
  }
  on_byPlayer_beginchannel(event) {
  	if (this.isStarlordBuffedSolarWrath(event)) {
      return;
    } 
    super.on_byPlayer_beginchannel(event);
  }
  on_byPlayer_cast(event) {
  	if (this.isStarlordBuffedSolarWrath(event)) {
      return;
    } 
    super.on_byPlayer_cast(event);
  }

  triggerStarlordGlobalCooldown(event, trigger) {
    this.owner.triggerEvent('globalcooldown', {
      type: 'globalcooldown',
      ability: event.ability,
      timestamp: event.timestamp,
      duration: Math.max(750, this.getCurrentGlobalCooldown(event.ability.guid) * 0.8), //Starlord multiplier
      reason: event,
      trigger,
    });
  }
}

export default GlobalCooldown;
