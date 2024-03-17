import Item from 'common/ITEMS/Item';

const trinkets = {
  SPOILS_OF_NELTHARUS: {
    id: 193773,
    name: 'Spoils of Neltharus',
    icon: 'inv_10_dungeonjewelry_dragon_trinket_4_bronze',
  },
  OMINOUS_CHROMATIC_ESSENCE: {
    id: 203729,
    name: 'Ominous Chromatic Essence',
    icon: 'inv_misc_orb_blue',
  },
  IRIDEUS_FRAGMENT: {
    id: 193743,
    name: 'Irideus Fragment',
    icon: 'inv_10_dungeonjewelry_titan_trinket_1facefragment_color3',
  },
  MIRROR_OF_FRACTURED_TOMORROWS: {
    id: 207581,
    name: 'Mirror of Fractured Tomorrows',
    icon: 'achievement_dungeon_ulduarraid_misc_06',
  },
  VESSEL_OF_SEARING_SHADOW: {
    id: 202615,
    name: 'Vessel of Searing Shadow',
    icon: 'inv_trinket_mawraid_01_purple',
  },
  ACCELERATING_SANDGLASS: {
    id: 207566,
    name: 'Accelerating Sandglass',
    icon: 'ability_bossmagistrix_timewarp2',
  },
  NYMUES_UNRAVELING_SPINDLE: {
    id: 208615,
    name: "Nymue's Unraveling Spindle",
    icon: 'inv_cloth_outdooremeralddream_d_01_buckle',
  },
  BELORRELOS_THE_SUNCALLER: {
    id: 207172,
    name: "Belor'relos, the Suncaller",
    icon: 'inv_wand_1h_firelandsraid_d_01',
  },
} satisfies Record<string, Item>;

export default trinkets;
