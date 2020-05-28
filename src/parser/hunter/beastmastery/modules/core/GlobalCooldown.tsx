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
  SPELLS.CALL_PET_1.id,
  SPELLS.CALL_PET_2.id,
  SPELLS.CALL_PET_3.id,
  SPELLS.CALL_PET_4.id,
  SPELLS.CALL_PET_5.id,
  SPELLS.INTIMIDATION.id,
  SPELLS.FREEZING_TRAP.id,
  SPELLS.TAR_TRAP.id,
];

const ASPECT_GCD_REDUCTION = 200;

const MIN_GCD = 750;
const MAX_GCD = 1500;

/**
 * Aspect of the wild reduces Global Cooldown for certain spells by 0.2 seconds
 * before haste calculations
 */
class GlobalCooldown extends CoreGlobalCooldown {
  static dependencies = {
    ...CoreGlobalCooldown.dependencies,
    haste: Haste,
  };

  protected haste!: Haste;

  getGlobalCooldownDuration(spellId: number) {
    const gcd = super.getGlobalCooldownDuration(spellId);
    if (!gcd) {
      return 0;
    }
    if (ASPECT_AFFECTED_ABILTIES.includes(spellId) && this.selectedCombatant.hasBuff(SPELLS.ASPECT_OF_THE_WILD.id)) {
      const unhastedAspectGCD = MAX_GCD - ASPECT_GCD_REDUCTION;
      const hastepercent = 1 + this.haste.current;
      return Math.max(MIN_GCD, unhastedAspectGCD / hastepercent);
    }
    return Math.max(MIN_GCD, gcd);
  }

}

export default GlobalCooldown;
