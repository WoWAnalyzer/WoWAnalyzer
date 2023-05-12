import SPELLS from 'common/SPELLS/classic/shaman';
import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';

const MW_GCD_REDUCTION = 0.2;
const MIN_GCD = 750;

/**
 * Each stack of Maelstrom Weapon reduces the GCD by 20% for:
 * * Lightning Bolt, Chain Lightning, Lesser Healing Wave, Healing Wave, Chain Heal, or Hex
 * Min GCD is 750 ms
 */

class GlobalCooldown extends CoreGlobalCooldown {
  getGlobalCooldownDuration(spellId: number) {
    const gcd = super.getGlobalCooldownDuration(spellId);
    const mwSpell =
      spellId === SPELLS.LIGHTNING_BOLT.id ||
      spellId === SPELLS.CHAIN_LIGHTNING.id ||
      spellId === SPELLS.LESSER_HEALING_WAVE.id ||
      spellId === SPELLS.HEALING_WAVE.id ||
      spellId === SPELLS.CHAIN_HEAL.id ||
      spellId === SPELLS.HEX.id;
    const mwBuff = this.selectedCombatant.hasBuff(SPELLS.MAELSTROM_WEAPON_BUFF.id);
    let stacks = 1;
    if (gcd && mwSpell && mwBuff) {
      stacks = this.selectedCombatant.getBuffStacks(SPELLS.MAELSTROM_WEAPON_BUFF.id);
      return Math.max(gcd * (1 - MW_GCD_REDUCTION * stacks), MIN_GCD);
    }
    return gcd;
  }
}

export default GlobalCooldown;
