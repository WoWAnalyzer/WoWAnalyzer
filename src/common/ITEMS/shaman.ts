import Item from 'common/ITEMS/Item';

const items = {
  //region Enhancement
  //endregion
  //region Elemental
  //endregion
  //region Restoration
  T30_TIDEWATERS_HEAL: {
    id: 409354,
    name: 'Tidewaters',
    icon: 'ability_mage_waterjet',
  },
  T30_RAINSTORM_BUFF: {
    id: 409386,
    name: 'Rainstorm',
    icon: 'ability_mage_waterjet',
  },
  T30_SWELLING_RAIN_BUFF: {
    id: 409391,
    name: 'Swelling Rain',
    icon: 'spell_frost_wisp',
  },
  T31_TIDAL_RESERVOIR_HEAL: {
    id: 424464,
    name: 'Tidal Reservoir',
    icon: 'ability_shaman_fortifyingwaters',
  },
  //endregion
  //region Shared
  //endregion
} satisfies Record<string, Item>;
export default items;
