import Item from 'common/ITEMS/Item';

const items = {
  //Shaman Only
  //region Enhancement
  WINDFURY_WEAPON: {
    id: 334302,
    name: 'Windfury Weapon',
    icon: 'spell_shaman_unleashweapon_wind',
    effectId: 5401,
  },
  //endregion
  //region Elemental
  THUNDERSTRIKE_WARD: {
    id: 462757,
    name: 'Thunderstrike Ward',
    icon: 'inv_armorkit_lightning_imbued',
    effectId: 7587,
  },
  //endregion
  //region Restoration
  EARTHLIVING_WEAPON: {
    id: 382021,
    name: 'Earthliving Weapon',
    icon: 'spell_shaman_giftearthmother',
    effectId: 6498,
  },
  TIDECALLERS_GUARD: {
    id: 457481,
    name: "Tidecaller's Guard",
    icon: 'inv_shield_1h_artifactstormfist_d_04',
    effectId: 7528,
  },
  //endregion
  //region Shared
  FLAMETONGUE_WEAPON: {
    id: 334294,
    name: 'Flametongue Weapon',
    icon: 'spell_fire_flametounge',
    effectId: 5400,
  },
  //endregion
} satisfies Record<string, Item & { effectId?: number }>;
export default items;
