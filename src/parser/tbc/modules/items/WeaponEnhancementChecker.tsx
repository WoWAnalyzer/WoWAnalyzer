import { Trans } from '@lingui/macro';
import BaseWeaponEnhancementChecker from 'parser/shared/modules/items/WeaponEnhancementChecker';
import React from 'react';

const MAX_ENHANCEMENT_IDS = [
  2678, // https://tbc.wowhead.com/spell=28017/superior-wizard-oil
  2677, // https://tbc.wowhead.com/spell=28013/superior-mana-oil
  2713, // https://tbc.wowhead.com/spell=29453/sharpen-blade
  2955, // https://tbc.wowhead.com/spell=34340/weight-weapon
  2629, // https://tbc.wowhead.com/spell=25123/brilliant-mana-oil
  2639, // https://tbc.wowhead.com/spell=25587/windfury-totem
];

const WEAPON_SLOTS = {
  15: <Trans id="common.slots.weapon">Weapon</Trans>,
  // There isn't a good way to filter shield enchants Maybe trigger this by class?
  // 16: <Trans id="common.slots.offhand">OffHand</Trans>,
};

class WeaponEnhancementChecker extends BaseWeaponEnhancementChecker {
  get WeaponSlots() {
    return WEAPON_SLOTS;
  }

  get MaxEnchantIds() {
    return MAX_ENHANCEMENT_IDS;
  }
}

export default WeaponEnhancementChecker;
