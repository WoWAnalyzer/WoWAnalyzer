import BaseWeaponEnhancementChecker from 'parser/shared/modules/items/WeaponEnhancementChecker';

const MAX_ENHANCEMENT_IDS = [
  2678, // https://tbc.wowhead.com/spell=28017/superior-wizard-oil
  2677, // https://tbc.wowhead.com/spell=28013/superior-mana-oil
  2713, // https://tbc.wowhead.com/spell=29453/sharpen-blade
  2955, // https://tbc.wowhead.com/spell=34340/weight-weapon
  2629, // https://tbc.wowhead.com/spell=25123/brilliant-mana-oil
];

class WeaponEnhancementChecker extends BaseWeaponEnhancementChecker {
  get maxEnchantIds() {
    return MAX_ENHANCEMENT_IDS;
  }
}

export default WeaponEnhancementChecker;
