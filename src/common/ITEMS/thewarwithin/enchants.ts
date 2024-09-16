import { Enchant } from 'common/ITEMS/Item';

const enchants = {
  // weapons
  AUTHORITY_OF_AIR_R1: {
    id: 223773,
    name: 'Enchant Weapon - Authority of Air',
    icon: 'inv_misc_enchantedscroll',
    effectId: 7449,
  },
  AUTHORITY_OF_AIR_R2: {
    id: 223774,
    name: 'Enchant Weapon - Authority of Air',
    icon: 'inv_misc_enchantedscroll',
    effectId: 7450,
  },
  AUTHORITY_OF_AIR_R3: {
    id: 223775,
    name: 'Enchant Weapon - Authority of Air',
    icon: 'inv_misc_enchantedscroll',
    effectId: 7451,
  },
  AUTHORITY_OF_FIERY_RESOLVE_R1: {
    id: 223776,
    name: 'Enchant Weapon - Authority of Fiery Resolve',
    icon: 'inv_misc_enchantedscroll',
    effectId: 7452,
  },
  AUTHORITY_OF_FIERY_RESOLVE_R2: {
    id: 223777,
    name: 'Enchant Weapon - Authority of Fiery Resolve',
    icon: 'inv_misc_enchantedscroll',
    effectId: 7453,
  },
  AUTHORITY_OF_FIERY_RESOLVE_R3: {
    id: 223778,
    name: 'Enchant Weapon - Authority of Fiery Resolve',
    icon: 'inv_misc_enchantedscroll',
    effectId: 7454,
  },
  AUTHORITY_OF_RADIANT_POWER_R1: {
    id: 223779,
    name: 'Enchant Weapon - Authority of Radiant Power',
    icon: 'inv_misc_enchantedscroll',
    effectId: 7461,
  },
  AUTHORITY_OF_RADIANT_POWER_R2: {
    id: 223780,
    name: 'Enchant Weapon - Authority of Radiant Power',
    icon: 'inv_misc_enchantedscroll',
    effectId: 7462,
  },
  AUTHORITY_OF_RADIANT_POWER_R3: {
    id: 223781,
    name: 'Enchant Weapon - Authority of Radiant Power',
    icon: 'inv_misc_enchantedscroll',
    effectId: 7463,
  },
  AUTHORITY_OF_STORMS_R1: {
    id: 223770,
    name: 'Enchant Weapon - Authority of Storms',
    icon: 'inv_misc_enchantedscroll',
    effectId: 7455,
  },
  AUTHORITY_OF_STORMS_R2: {
    id: 223771,
    name: 'Enchant Weapon - Authority of Storms',
    icon: 'inv_misc_enchantedscroll',
    effectId: 7456,
  },
  AUTHORITY_OF_STORMS_R3: {
    id: 223772,
    name: 'Enchant Weapon - Authority of Storms',
    icon: 'inv_misc_enchantedscroll',
    effectId: 7457,
  },
  AUTHORITY_OF_THE_DEPTHS_R1: {
    id: 223782,
    name: 'Enchant Weapon - Authority of the Depths',
    icon: 'inv_misc_enchantedscroll',
    effectId: 7458,
  },
  AUTHORITY_OF_THE_DEPTHS_R2: {
    id: 223783,
    name: 'Enchant Weapon - Authority of the Depths',
    icon: 'inv_misc_enchantedscroll',
    effectId: 7459,
  },
  AUTHORITY_OF_THE_DEPTHS_R3: {
    id: 223784,
    name: 'Enchant Weapon - Authority of the Depths',
    icon: 'inv_misc_enchantedscroll',
    effectId: 7460,
  },
  STORMRIDERS_FURY_R1: {
    id: 223760,
    name: "Enchant Weapon - Stormrider's Fury",
    icon: 'inv_misc_enchantedscroll',
    effectId: 7440,
  },
  STORMRIDERS_FURY_R2: {
    id: 223761,
    name: "Enchant Weapon - Stormrider's Fury",
    icon: 'inv_misc_enchantedscroll',
    effectId: 7441,
  },
  STORMRIDERS_FURY_R3: {
    id: 223762,
    name: "Enchant Weapon - Stormrider's Fury",
    icon: 'inv_misc_enchantedscroll',
    effectId: 7442,
  },
  OATHSWORNS_TENACITY_R1: {
    id: 223766,
    name: "Enchant Weapon - Oathsworn's Tenacity",
    icon: 'inv_misc_enchantedscroll',
    effectId: 7446,
  },
  OATHSWORNS_TENACITY_R2: {
    id: 223767,
    name: "Enchant Weapon - Oathsworn's Tenacity",
    icon: 'inv_misc_enchantedscroll',
    effectId: 7447,
  },
  OATHSWORNS_TENACITY_R3: {
    id: 223768,
    name: "Enchant Weapon - Oathsworn's Tenacity",
    icon: 'inv_misc_enchantedscroll',
    effectId: 7448,
  },
  COUNCILS_GUILE_R1: {
    id: 223757,
    name: "Enchant Weapon - Council's Guile",
    icon: 'inv_misc_enchantedscroll',
    effectId: 7437,
  },
  COUNCILS_GUILE_R2: {
    id: 223758,
    name: "Enchant Weapon - Council's Guile",
    icon: 'inv_misc_enchantedscroll',
    effectId: 7438,
  },
  COUNCILS_GUILE_R3: {
    id: 223759,
    name: "Enchant Weapon - Council's Guile",
    icon: 'inv_misc_enchantedscroll',
    effectId: 7439,
  },
  STONEBOUND_ARTISTRY_R1: {
    id: 223763,
    name: 'Enchant Weapon - Stonebound Artistry',
    icon: 'inv_misc_enchantedscroll',
    effectId: 7443,
  },
  STONEBOUND_ARTISTRY_R2: {
    id: 223764,
    name: 'Enchant Weapon - Stonebound Artistry',
    icon: 'inv_misc_enchantedscroll',
    effectId: 7444,
  },
  STONEBOUND_ARTISTRY_R3: {
    id: 223765,
    name: 'Enchant Weapon - Stonebound Artistry',
    icon: 'inv_misc_enchantedscroll',
    effectId: 7445,
  },

  /* Template */
  // X_R1: {
  //   id: 0,
  //   name: '',
  //   icon: 'inv_misc_enchantedscroll',
  //   effectId: 0,
  // },
  // X_R2: {
  //   id: 0,
  //   name: '',
  //   icon: 'inv_misc_enchantedscroll',
  //   effectId: 0,
  // },
  // X_R2: {
  //   id: 0,
  //   name: '',
  //   icon: 'inv_misc_enchantedscroll',
  //   effectId: 0,
  // },
} satisfies Record<string, Enchant>;

export default enchants;
