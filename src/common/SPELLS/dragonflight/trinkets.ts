import Spell from '../Spell';

const spells = {
  UNSTABLE_FLAMES: {
    id: 401394,
    name: 'Unstables Flames',
    icon: 'spell_fire_felflamering_red',
  },
  SPOILS_OF_NELTHARUS_HASTE: {
    id: 381955,
    name: 'Spoils of Neltharus',
    icon: 'inv_gizmo_electrifiedether',
  },
  SPOILS_OF_NELTHARUS_CRIT: {
    id: 381954,
    name: 'Spoils of Neltharus',
    icon: 'inv_chaos_orb',
  },
  SPOILS_OF_NELTHARUS_VERSATILITY: {
    id: 381957,
    name: 'Spoils of Neltharus',
    icon: 'inv_rod_enchantedcobalt',
  },
  SPOILS_OF_NELTHARUS_MASTERY: {
    id: 381956,
    name: 'Spoils of Neltharus',
    icon: 'ability_mount_goatmount',
  },
  IRIDEUS_FRAGMENT: {
    id: 383941,
    name: 'Irideus Fragment',
    icon: 'inv_10_dungeonjewelry_titan_trinket_1facefragment_color3',
  },
  MIRROR_OF_FRACTURED_TOMORROWS: {
    id: 418527,
    name: 'Mirror of Fractured Tomorrows',
    icon: 'achievement_dungeon_ulduarraid_misc_06',
  },
  ACCELERATING_SANDGLASS_DRAINING: {
    id: 417452,
    name: 'Accelerating Sandglass',
    icon: 'ability_bossmagistrix_timewarp2',
  },
  ACCELERATING_SANDGLASS_EMPTY: {
    id: 417456,
    name: 'Accelerating Sandglass',
    icon: 'ability_evoker_timelessness',
  },
  ACCELERATING_SANDGLASS_DAMAGE: {
    id: 417458,
    name: 'Accelerating Sandglass',
    icon: 'ability_bossmagistrix_timewarp2',
  },
  ELEMENTAL_LARIAT_EMPOWERED_AIR: {
    id: 375342,
    name: 'Elemental Lariat - Empowered Air',
    icon: 'inv_10_elementalcombinedfoozles_air',
  },
  ELEMENTAL_LARIAT_EMPOWERED_EARTH: {
    id: 375345,
    name: 'Elemental Lariat - Empowered Earth',
    icon: 'inv_10_elementalcombinedfoozles_earth',
  },
  ELEMENTAL_LARIAT_EMPOWERED_FLAME: {
    id: 375335,
    name: 'Elemental Lariat - Empowered Flame',
    icon: 'inv_10_elementalcombinedfoozles_fire',
  },
  ELEMENTAL_LARIAT_EMPOWERED_FROST: {
    id: 375343,
    name: 'Elemental Lariat - Empowered Frost',
    icon: 'inv_10_elementalcombinedfoozles_frost',
  },
  ECHOING_TYRSTONE_HEAL: {
    id: 417957,
    name: 'Echoing Tyrstone',
    icon: 'ability_paladin_lightofthemartyr',
  },
  ECHOING_TYRSTONE_BUFF: {
    id: 417939,
    name: 'Echoing Tyrstone',
    icon: 'ability_paladin_lightofthemartyr',
  },
  ECHOING_TYRSTONE_HASTE_BUFF: {
    id: 418080,
    name: 'Echoing Tyrstone',
    icon: 'achievement_dungeon_ulduarraid_titan_01',
  },
  NYMUES_UNRAVELING_SPINDLE: {
    id: 422956,
    name: "Nymue's Unraveling Spindle",
    icon: 'inv_cloth_outdooremeralddream_d_01_buckle',
  },
  NYMUES_UNRAVELING_SPINDLE_DAMAGE: {
    id: 427161,
    name: "Nymue's Unraveling Spindle",
    icon: 'inv_cloth_outdooremeralddream_d_01_buckle',
  },
  NYMUES_UNRAVELING_SPINDLE_BUFF: {
    id: 427072,
    name: "Nymue's Unraveling Spindle",
    icon: 'inv_cloth_outdooremeralddream_d_01_buckle',
  },
  BELORRELOS_SOLAR_MAELSTROM: {
    id: 422146,
    name: 'Solar Maelstrom',
    icon: 'inv_10_jewelcrafting_gem3primal_titan_cut_bronze',
  },
} satisfies Record<string, Spell>;

export default spells;
