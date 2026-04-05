import ITEMS from 'common/ITEMS';
import BaseWeaponEnhancementChecker from 'parser/shared/modules/items/WeaponEnhancementChecker';

// Example logs with missing enhancement:
// /report/tqbL2gBn8HvWAmrK/73-Mythic+Echo+of+Doragosa+-+Kill+(1:42)/Xepheris/standard/overview

// const MIN_ENHANCEMENT_IDS = [
//   ITEMS.WEIGHTED_BOOMSHOTS_R1.effectId,
//   ITEMS.LACED_ZOOMSHOTS_R1.effectId,
//   ITEMS.SMUGGLERS_ENCHANTED_EDGE_R1.effectId,
//   ITEMS.OIL_OF_DAWN_R1.effectId,
//   ITEMS.THALASSIAN_PHOENIX_OIL_R1.effectId,
//   ITEMS.REFULGENT_WEIGHTSTONE_R1.effectId,
//   ITEMS.REFULGENT_WHETSTONE_R1.effectId,
// ] as const satisfies number[];

const MAX_ENHANCEMENT_IDS = [
  ITEMS.WEIGHTED_BOOMSHOTS_R2.effectId,
  ITEMS.LACED_ZOOMSHOTS_R2.effectId,
  ITEMS.SMUGGLERS_ENCHANTED_EDGE_R2.effectId,
  ITEMS.OIL_OF_DAWN_R2.effectId,
  ITEMS.THALASSIAN_PHOENIX_OIL_R2.effectId,
  ITEMS.REFULGENT_WEIGHTSTONE_R2.effectId,
  ITEMS.REFULGENT_WHETSTONE_R2.effectId,
  // shaman effects
  ITEMS.WINDFURY_WEAPON.effectId,
  ITEMS.FLAMETONGUE_WEAPON.effectId,
  ITEMS.EARTHLIVING_WEAPON.effectId,
  ITEMS.TIDECALLERS_GUARD.effectId,
  ITEMS.THUNDERSTRIKE_WARD.effectId,
  // lightsmith paladin effects
  ITEMS.RITE_OF_SANCTIFICATION.effectId,
  ITEMS.RITE_OF_ADJURATION.effectId,
] as const satisfies number[];

class WeaponEnhancementChecker extends BaseWeaponEnhancementChecker {
  get MaxEnchantIds() {
    return MAX_ENHANCEMENT_IDS;
  }
}

export default WeaponEnhancementChecker;
