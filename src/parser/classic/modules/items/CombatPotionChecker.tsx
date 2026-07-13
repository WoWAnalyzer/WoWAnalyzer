import Potion from 'parser/retail/modules/items/Potion';
import SPELLS from 'common/SPELLS/classic/potions';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ResurrectEvent } from 'parser/core/Events';

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
  // however, you can pre-pot in cata. This cap holds regardless of fight
  // length - the only way to get an extra combat potion is to die, since the
  // shared cooldown resets the moment you're resurrected.
  static cooldown = 60;
  maxCasts = 2;
  static recommendedEfficiency = 2;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.resurrect.to(SELECTED_PLAYER), this.onResurrect);
  }

  onResurrect(event: ResurrectEvent) {
    this.maxCasts += 1;
  }
}

export default CombatPotionChecker;
