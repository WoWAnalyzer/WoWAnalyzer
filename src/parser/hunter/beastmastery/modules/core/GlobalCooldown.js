import CoreGlobalCooldown from 'parser/core/modules/GlobalCooldown';
import StatTracker from 'parser/core/modules/StatTracker';
import Channeling from 'parser/core/modules/Channeling';
import SPELLS from 'common/SPELLS';
import Haste from 'parser/core/modules/Haste';
import Abilities from '../Abilities';

const ASPECT_AFFECTED_ABILTIES = [
  SPELLS.KILL_COMMAND.id,
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
];

const ASPECT_GCD_REDUCTION = 200;

const MIN_GCD = 750;

/**
 * Aspect of the wild reduces Global Cooldown for damaging spells by 0.2 seconds before haste calculations
 */
class GlobalCooldown extends CoreGlobalCooldown {
  static dependencies = {
    abilities: Abilities,
    haste: Haste,
    statTracker: StatTracker,
    channeling: Channeling,
  };

  getGlobalCooldownDuration(spellId) {
    const gcd = super.getGlobalCooldownDuration(spellId);
    if (!gcd) {
      return 0;
    }
    if (spellId && ASPECT_AFFECTED_ABILTIES.includes(spellId) && this.selectedCombatant.hasBuff(SPELLS.ASPECT_OF_THE_WILD.id)) {
      return Math.max(MIN_GCD, (gcd - ASPECT_GCD_REDUCTION) / (1 + this.statTracker.currentHastePercentage));
    }
    return Math.max(MIN_GCD, gcd);
  }

}

export default GlobalCooldown;
