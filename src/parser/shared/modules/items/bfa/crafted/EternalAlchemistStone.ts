import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import { calculatePrimaryStat } from 'common/stats';

/**
 * Eternal Alchemist Stone -
 * Equip: When you heal or deal damage you have a chance to increase your Strength, Agility, or Intellect by 1648 for 15 sec.  Your highest stat is always chosen.
 * Equip: Increases the effect that healing and mana potions have on the wearer by 40%.  This effect does not stack.
 */
class EternalAlchemistStone extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  constructor({ statTracker, ...options }: any) {
    super(options);
    const item = this.selectedCombatant.getItem(ITEMS.ETERNAL_ALCHEMIST_STONE.id);
    this.active = !!item;
    if (!this.active) {
      return;
    }
    const buffStat = calculatePrimaryStat(455, 1648, item.itemLevel);
    statTracker.add(SPELLS.ETERNAL_ALCHEMIST_STONE_STRENGTH_BUFF, {
      strength: buffStat,
    });
    statTracker.add(SPELLS.ETERNAL_ALCHEMIST_STONE_AGILITY_BUFF, {
      agility: buffStat,
    });
    statTracker.add(SPELLS.ETERNAL_ALCHEMIST_STONE_INTELLECT_BUFF, {
      intellect: buffStat,
    });
  }

  // TODO: statistic()
}

export default EternalAlchemistStone;
