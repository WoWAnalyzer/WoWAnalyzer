import ITEMS from 'common/ITEMS';
import BaseWeaponEnhancementChecker from 'parser/shared/modules/items/WeaponEnhancementChecker';

// Example logs with missing enhancement:
// /report/XQrLTRC1bFWGAt3m/21-Mythic+The+Council+of+Blood+-+Wipe+10+(3:17)/Odsuv/standard

const MAX_ENHANCEMENT_IDS = [
  ITEMS.SHADOWCORE_OIL.effectId,
  ITEMS.EMBALMERS_OIL.effectId,
  ITEMS.SHADED_SHARPENING_STONE.effectId,
  ITEMS.SHADED_WEIGHTSTONE.effectId,
];

class WeaponEnhancementChecker extends BaseWeaponEnhancementChecker {
  get MaxEnchantIds() {
    return MAX_ENHANCEMENT_IDS;
  }
}

export default WeaponEnhancementChecker;
