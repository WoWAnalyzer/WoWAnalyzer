import ITEMS from 'common/ITEMS';
import BaseWeaponEnhancementChecker from 'parser/shared/modules/items/WeaponEnhancementChecker';

// Example logs with missing enhancement:
// /report/tqbL2gBn8HvWAmrK/73-Mythic+Echo+of+Doragosa+-+Kill+(1:42)/Xepheris/standard/overview

// const MIN_ENHANCEMENT_IDS = [
//   ITEMS.ALGARI_MANA_OIL_R1.effectId,
//   ITEMS.ALGARI_MANA_OIL_R2.effectId,
//   ITEMS.IRONCLAW_WEIGHSTONE_R1.effectId,
//   ITEMS.IRONCLAW_WEIGHSTONE_R2.effectId,
//   ITEMS.IRONCLAW_WHETSTONE_R1.effectId,
//   ITEMS.IRONCLAW_WHETSTONE_R2.effectId,
//   ITEMS.OIL_OF_BELEDARS_GRACE_R1.effectId,
//   ITEMS.OIL_OF_BELEDARS_GRACE_R2.effectId,
//   ITEMS.OIL_OF_BELEDARS_GRACE_R3.effectId,
//   ITEMS.OIL_OF_DEEP_TOXINS_R1.effectId,
//   ITEMS.OIL_OF_DEEP_TOXINS_R2.effectId,
//   ITEMS.OIL_OF_DEEP_TOXINS_R3.effectId,
// ] as const satisfies number[];

const MAX_ENHANCEMENT_IDS = [
  ITEMS.ALGARI_MANA_OIL_R3.effectId,
  ITEMS.BUBBLING_WAX.effectId,
  ITEMS.IRONCLAW_WEIGHSTONE_R3.effectId,
  ITEMS.IRONCLAW_WHETSTONE_R3.effectId,
  // shaman effects
  ITEMS.WINDFURY_WEAPON.effectId,
  ITEMS.FLAMETONGUE_WEAPON.effectId,
  ITEMS.EARTHLIVING_WEAPON.effectId,
  ITEMS.TIDECALLERS_GUARD.effectId,
  ITEMS.THUNDERSTRIKE_WARD.effectId,
] as const satisfies number[];

class WeaponEnhancementChecker extends BaseWeaponEnhancementChecker {
  get MaxEnchantIds() {
    return MAX_ENHANCEMENT_IDS;
  }
}

export default WeaponEnhancementChecker;
