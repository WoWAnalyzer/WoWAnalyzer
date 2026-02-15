import BaseEnchantChecker from 'parser/retail/modules/items/EnchantChecker';

class EnchantChecker extends BaseEnchantChecker {
  get MaxEnchantIds(): number[] {
    return [...super.MaxEnchantIds];
  }
}

export default EnchantChecker;
