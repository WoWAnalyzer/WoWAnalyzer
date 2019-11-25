import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import SPELLS from 'common/SPELLS';
import Haste from 'parser/shared/modules/Haste';

const ASPECT_AFFECTED_ABILTIES = [
  SPELLS.KILL_COMMAND_CAST_BM.id,
  SPELLS.COBRA_SHOT.id,
  SPELLS.DIRE_BEAST_TALENT.id,
  SPELLS.BESTIAL_WRATH.id,
  SPELLS.MULTISHOT_BM.id,
  SPELLS.BARBED_SHOT.id,
  SPELLS.SPITTING_COBRA_TALENT.id,
  SPELLS.BARRAGE_TALENT.id,
  SPELLS.STAMPEDE_TALENT.id,
  SPELLS.CHIMAERA_SHOT_TALENT.id,
  SPELLS.A_MURDER_OF_CROWS_TALENT.id,
  SPELLS.ASPECT_OF_THE_WILD.id,
];

const ASPECT_GCD_REDUCTION = 200;

const MIN_GCD = 750;
const MAX_GCD = 1500;

/**
 * Aspect of the wild reduces Global Cooldown for damaging spells by 0.2 seconds before haste calculations
 */
class GlobalCooldown extends CoreGlobalCooldown {
  static dependencies = {
    ...CoreGlobalCooldown.dependencies,
    haste: Haste,
  };

  getGlobalCooldownDuration(spellId) {
    const gcd = super.getGlobalCooldownDuration(spellId);
    if (!gcd) {
      return 0;
    }
    if (spellId && ASPECT_AFFECTED_ABILTIES.includes(spellId) && this.selectedCombatant.hasBuff(SPELLS.ASPECT_OF_THE_WILD.id)) {
      let unhastedAspectGCD = MAX_GCD - ASPECT_GCD_REDUCTION;
      const hastepercent = 1 + this.haste.current;
      if (spellId === SPELLS.ASPECT_OF_THE_WILD.id) {
        // Aspect of the wild has a GCD of 1.3s in the spelldata - this is to account for the GCD reduction of the buff it gives
        // The issue is that the buff applies before the cast event making Aspect of the Wild double dip from the GCD reduction it provides
        unhastedAspectGCD -= ASPECT_GCD_REDUCTION;
        return Math.max(MIN_GCD, unhastedAspectGCD / hastepercent);
      }
      return Math.max(MIN_GCD, unhastedAspectGCD / hastepercent);
    }
    return Math.max(MIN_GCD, gcd);
  }

}

export default GlobalCooldown;
