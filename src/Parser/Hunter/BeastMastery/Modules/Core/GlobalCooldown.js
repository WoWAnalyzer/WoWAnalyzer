import CoreGlobalCooldown from 'Parser/Core/Modules/GlobalCooldown';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import Haste from 'Parser/Core/Modules/Haste';
import Abilities from '../Abilities';

const ASPECT_AFFECTED_ABILTIES = [
  SPELLS.KILL_COMMAND.id,
  SPELLS.COBRA_SHOT.id,
  SPELLS.DIRE_BEAST.id,
  SPELLS.DIRE_FRENZY_TALENT.id,
  SPELLS.MULTISHOT.id,
  SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id,
  SPELLS.BARRAGE_TALENT.id,
  SPELLS.STAMPEDE_TALENT.id,
  SPELLS.CHIMAERA_SHOT_TALENT.id,
];

const ASPECT_GCD_REDUCTION = 200;

/**
 * Aspect of the wild reduces Global Cooldown for damaging spells by 0.2 seconds before haste calculations
 * Kill Command is currently double dipping from haste in the form of it doing the haste calculation twice when the GCD is calculated -- possible bug
 */
class GlobalCooldown extends CoreGlobalCooldown {
  static dependencies = {
    abilities: Abilities,
    combatants: Combatants,
    haste: Haste,
  };

  getCurrentGlobalCooldown(spellId = null) {
    const baseGcd = this.owner.modules.alwaysBeCasting.constructor.BASE_GCD;
    const minGcd = this.owner.modules.alwaysBeCasting.constructor.MINIMUM_GCD;
    let gcd;
    if (spellId && ASPECT_AFFECTED_ABILTIES.includes(spellId) && this.combatants.selected.hasBuff(SPELLS.ASPECT_OF_THE_WILD.id)) {
      gcd = (baseGcd - ASPECT_GCD_REDUCTION) / (1 + this.haste.current);
      if (spellId === SPELLS.KILL_COMMAND.id) {
        gcd = gcd / (1 + this.haste.current);
      }
      return Math.max(minGcd, gcd);
    }
    gcd = super.getCurrentGlobalCooldown(spellId);
    if (spellId === SPELLS.KILL_COMMAND.id) {
      gcd = gcd / (1 + this.haste.current);
    }
    return Math.max(minGcd, gcd);
  }

}

export default GlobalCooldown;
