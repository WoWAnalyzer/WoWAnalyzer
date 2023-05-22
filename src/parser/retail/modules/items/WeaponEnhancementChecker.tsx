import ITEMS from 'common/ITEMS';
import { Enchant } from 'common/ITEMS/Item';
import BaseWeaponEnhancementChecker from 'parser/shared/modules/items/WeaponEnhancementChecker';

// Example logs with missing enhancement:
// /report/tqbL2gBn8HvWAmrK/73-Mythic+Echo+of+Doragosa+-+Kill+(1:42)/Xepheris/standard/overview

const MAX_ENHANCEMENT_IDS = [
  // Dragonflight
  ITEMS.PRIMAL_WHETSTONE_R3,
  ITEMS.PRIMAL_WEIGHTSTONE_R3,
  ITEMS.HOWLING_RUNE_R3,
  ITEMS.HISSING_RUNE_R3,
  ITEMS.BUZZING_RUNE_R3,
  ITEMS.CHIRPING_RUNE_R3,
  ITEMS.COMPLETELY_SAFE_ROCKETS_R3,
  ITEMS.ENDLESS_STACK_OF_NEEDLES_R3,
  ITEMS.FLAMETONGUE_WEAPON,
  ITEMS.WINDFURY_WEAPON,
].map((item) => (item as Enchant).effectId);

class WeaponEnhancementChecker extends BaseWeaponEnhancementChecker {
  get MaxEnchantIds() {
    return MAX_ENHANCEMENT_IDS;
  }
}

export default WeaponEnhancementChecker;
