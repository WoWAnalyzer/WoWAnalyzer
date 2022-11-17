import ITEMS from 'common/ITEMS';
import { Enchant } from 'common/ITEMS/Item';
import BaseWeaponEnhancementChecker from 'parser/shared/modules/items/WeaponEnhancementChecker';

// Example logs with missing enhancement:
// /report/XQrLTRC1bFWGAt3m/21-Mythic+The+Council+of+Blood+-+Wipe+10+(3:17)/Odsuv/standard

const MAX_ENHANCEMENT_IDS = [
  // Shadowlands (Remove after Dragonflight Launch)
  ITEMS.SHADOWCORE_OIL,
  ITEMS.EMBALMERS_OIL,
  ITEMS.SHADED_SHARPENING_STONE,
  ITEMS.SHADED_WEIGHTSTONE,
  ITEMS.FLAMETONGUE_WEAPON,
  ITEMS.WINDFURY_WEAPON,

  // Dragonflight
  ITEMS.PRIMAL_WHETSTONE_R3,
  ITEMS.PRIMAL_WEIGHTSTONE_R3,
].map((item) => (item as Enchant).effectId);

class WeaponEnhancementChecker extends BaseWeaponEnhancementChecker {
  get MaxEnchantIds() {
    return MAX_ENHANCEMENT_IDS;
  }
}

export default WeaponEnhancementChecker;
