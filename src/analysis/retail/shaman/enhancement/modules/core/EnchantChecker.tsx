import ITEMS from 'common/ITEMS';
import BaseEnchantChecker from 'parser/retail/modules/items/EnchantChecker';

class EnchantChecker extends BaseEnchantChecker {
  get MaxEnchantIds(): number[] {
    return [
      ...super.MaxEnchantIds,
      ITEMS.STONEBOUND_ARTISTRY_R3.effectId,
      ITEMS.STORMRIDERS_FURY_R3.effectId,
    ];
  }
}

export default EnchantChecker;
