import Potion from 'parser/retail/modules/items/Potion';
import SPELLS from 'common/SPELLS/classic/potions';

const COMBAT_POTIONS: number[] = [
  SPELLS.POTION_OF_FOCUS.id,
  SPELLS.POTION_OF_MOGU_POWER.id,
  SPELLS.POTION_OF_THE_JADE_SERPENT.id,
  SPELLS.VIRMENS_BITE.id,
  SPELLS.MASTER_MANA_POTION.id,
];

class CombatPotionChecker extends Potion {
  static spells = COMBAT_POTIONS;
  static extraAbilityInfo = {
    name: 'Combat Potion',
    buffSpellId: COMBAT_POTIONS,
  };
  // Cata potions have a 60s shared cooldown, and are single-use in combat.
  // however, you can pre-pot in cata
  static cooldown = 60;
  maxCasts = 2;
  static recommendedEfficiency = 2;
}

export default CombatPotionChecker;
