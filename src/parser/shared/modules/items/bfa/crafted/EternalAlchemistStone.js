import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ItemAnalyzer from 'parser/core/ItemAnalyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import { calculatePrimaryStat } from 'common/stats';

/**
 * Eternal Alchemist Stone -
 * Equip: When you heal or deal damage you have a chance to increase your Strength, Agility, or Intellect by 1648 for 15 sec.  Your highest stat is always chosen.
 * Equip: Increases the effect that healing and mana potions have on the wearer by 40%.  This effect does not stack.
 *
 * @property {StatTracker} statTracker
 */
class EternalAlchemistStone extends ItemAnalyzer {
  static itemId = ITEMS.ETERNAL_ALCHEMIST_STONE.id;
  static dependencies = {
    statTracker: StatTracker,
  };

  constructor(...args) {
    super(...args);
    if (!this.active) {
      return;
    }
    const buffStat = calculatePrimaryStat(455, 1648, this.item2.itemLevel);
    this.statTracker.add(SPELLS.ETERNAL_ALCHEMIST_STONE_STRENGTH_BUFF, {
      strength: buffStat,
    });
    this.statTracker.add(SPELLS.ETERNAL_ALCHEMIST_STONE_AGILITY_BUFF, {
      agility: buffStat,
    });
    this.statTracker.add(SPELLS.ETERNAL_ALCHEMIST_STONE_INTELLECT_BUFF, {
      intellect: buffStat,
    });
  }

  // TODO: statistic()
}

export default EternalAlchemistStone;
