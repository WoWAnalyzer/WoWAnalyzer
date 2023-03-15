/**
 * All WotLK Mage spells (including talent spells) go here.
 * You need to do this manually by opening a WCL report and clicking the icons of spells to open the relevant Wowhead page. Here, you can get the icon name by clicking the icon, copy the name of the spell, and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS/classic` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import { spellIndexableList } from '../Spell';

const spells = spellIndexableList({
  // --------
  // SHARED
  // --------

  AMPLIFY_MAGIC: {
    id: 43017,
    name: 'Amplify Magic',
    icon: 'spell_holy_flashheal',
    lowRanks: [33946, 27130, 10170, 10169, 8455, 1008],
  },
  ARCANE_BLAST: {
    id: 42897,
    name: 'Arcane Blast',
    icon: 'spell_arcane_blast',
    lowRanks: [42896, 42894, 30451],
  },
  ARCANE_BLAST_DEBUFF: {
    id: 36032,
    name: 'Arcane Blast',
    icon: 'spell_arcane_blast',
  },
  ARCANE_BRILLIANCE: {
    id: 43002,
    name: 'Arcane Brilliance',
    icon: 'spell_holy_arcaneintellect',
    lowRanks: [27127, 23028],
  },
  ARCANE_EXPLOSION: {
    id: 42921,
    name: 'Arcane Explosion',
    icon: 'spell_nature_wispsplode',
    lowRanks: [42920, 27082, 27080, 10202, 10201, 8439, 8438, 8437, 1449],
  },
  ARCANE_INTELLECT: {
    id: 42995,
    name: 'Arcane Intellect',
    icon: 'spell_holy_magicalsentry',
    lowRanks: [27126, 10157, 10156, 1461, 1460, 1459],
  },
  ARCANE_MISSILES: {
    id: 42845,
    name: 'Arcane Missiles',
    icon: 'spell_nature_starfall',
    lowRanks: [42844, 38703, 38700, 27076, 25346, 10274, 10273, 8418, 8419, 7270, 7269, 7268],
  },
  ARCANE_MISSILES_CHANNELED: {
    id: 42846,
    name: 'Arcane Missiles',
    icon: 'spell_nature_starfall',
    lowRanks: [42843, 38704, 38699, 27075, 25345, 10212, 10211, 8417, 8416, 5145, 5144, 5143],
  },
  BLINK: {
    id: 1953,
    name: 'Blink',
    icon: 'spell_arcane_blink',
  },
  BLIZZARD: {
    id: 42940,
    name: 'Blizzard',
    icon: 'spell_frost_icestorm',
    lowRanks: [42939, 27085, 10187, 10186, 10185, 8427, 6141, 10],
  },
  CONE_OF_COLD: {
    id: 42931,
    name: 'Cone of Cold',
    icon: 'spell_frost_glacier',
    lowRanks: [42930, 27087, 10161, 10160, 10159, 8492, 120],
  },
  CONJURE_FOOD: {
    id: 33717,
    name: 'Conjure Food',
    icon: 'inv_misc_food_32',
    lowRanks: [28612, 10145, 10144, 6129, 990, 597, 587],
  },
  CONJURE_MANA_GEM: {
    id: 42985,
    name: 'Conjure Mana Gem',
    icon: 'inv_misc_gem_sapphire_02',
    lowRanks: [27101, 10054, 10053, 3552, 759],
  },
  CONJURE_REFRESHMENT: {
    id: 42956,
    name: 'Conjure Refreshment',
    icon: 'ability_mage_conjurefoodrank10',
    lowRanks: [42955],
  },
  CONJURE_WATER: {
    id: 27090,
    name: 'Conjure Water',
    icon: 'inv_drink_16',
    lowRanks: [37420, 10140, 10139, 10138, 6127, 5506, 5505, 5504],
  },
  COUNTERSPELL: {
    id: 2139,
    name: 'Counterspell',
    icon: 'spell_frost_iceshock',
  },
  DALARAN_BRILLIANCE: {
    id: 61316,
    name: 'Dalaran Brilliance',
    icon: 'achievement_dungeon_theviolethold_heroic',
  },
  DALARAN_INTELLECT: {
    id: 61024,
    name: 'Dalaran Intellect',
    icon: 'achievement_dungeon_theviolethold',
  },
  DAMPEN_MAGIC: {
    id: 43015,
    name: 'Dampen Magic',
    icon: 'spell_nature_abolishmagic',
    lowRanks: [33944, 10174, 10173, 8451, 8450, 604],
  },
  DEEP_FREEZE: {
    id: 44572,
    name: 'Deep Freeze',
    icon: 'ability_mage_deepfreeze',
  },
  EVOCATION: {
    id: 12051,
    name: 'Evocation',
    icon: 'spell_nature_purge',
  },
  FIRE_BLAST: {
    id: 42873,
    name: 'Fire Blast',
    icon: 'spell_fire_fireball',
    lowRanks: [42872, 27079, 27078, 10199, 10197, 8413, 8412, 2138, 2137, 2136],
  },
  FIRE_WARD: {
    id: 43010,
    name: 'Fire Ward',
    icon: 'spell_fire_firearmor',
    lowRanks: [27128, 10225, 10223, 8458, 8457, 543],
  },
  FIREBALL: {
    id: 42833,
    name: 'Fireball',
    icon: 'spell_fire_flamebolt',
    lowRanks: [
      42832, 38692, 27070, 25306, 10151, 10150, 10149, 10148, 8402, 8401, 8400, 3140, 145, 143, 133,
    ],
  },
  FLAMESTRIKE: {
    id: 42926,
    name: 'Flamestrike',
    icon: 'spell_fire_selfdestruct',
    lowRanks: [42925, 27086, 10216, 10215, 8423, 8422, 2121, 2120],
  },
  FROST_ARMOR: {
    id: 7301,
    name: 'Frost Armor',
    icon: 'spell_frost_frostarmor02',
    lowRanks: [7300, 168],
  },
  FROST_NOVA: {
    id: 42917,
    name: 'Frost Nova',
    icon: 'spell_frost_frostnova',
    lowRanks: [27088, 10230, 6131, 865, 122],
  },
  FROST_WARD: {
    id: 43012,
    name: 'Frost Ward',
    icon: 'spell_frost_frostward',
    lowRanks: [32796, 28609, 10177, 8462, 8461, 6143],
  },
  FROSTBOLT: {
    id: 42842,
    name: 'Frostbolt',
    icon: 'spell_frost_frostbolt02',
    lowRanks: [
      42841, 38697, 27072, 27071, 25304, 10181, 10180, 10179, 8408, 8407, 8406, 7322, 837, 205, 116,
    ],
  },
  FROSTFIRE_BOLT: {
    id: 47610,
    name: 'Frostfire Bolt',
    icon: 'ability_mage_frostfirebolt',
    lowRanks: [44614],
  },
  ICE_ARMOR: {
    id: 43008,
    name: 'Ice Armor',
    icon: 'spell_frost_frostarmor02',
    lowRanks: [27124, 10220, 10219, 7320, 7302],
  },
  ICE_BARRIER: {
    id: 43039,
    name: 'Ice Barrier',
    icon: 'spell_ice_lament',
    lowRanks: [43038, 33405, 27134, 13033, 13032, 13031, 11426],
  },
  ICE_BLOCK: {
    id: 30,
    name: 'Ice Block',
    icon: 'spell_frost_frost',
  },
  ICE_LANCE: {
    id: 42914,
    name: 'Ice Lance',
    icon: 'spell_frost_frostblast',
    lowRanks: [42913, 30455],
  },
  INVISIBILITY: {
    id: 68,
    name: 'Invisibility',
    icon: 'ability_mage_invisibility',
  },
  MAGE_ARMOR: {
    id: 43024,
    name: 'Mage Armor',
    icon: 'spell_magearmor',
    lowRanks: [43023, 27125, 22783, 22782, 6117],
  },
  MANA_SHIELD: {
    id: 43020,
    name: 'Mana Shield',
    icon: 'spell_shadow_detectlesserinvisibility',
    lowRanks: [43019, 27131, 10193, 10192, 10191, 8495, 8494, 1463],
  },
  MIRROR_IMAGE: {
    id: 55342,
    name: 'Mirror Image',
    icon: 'spell_magic_lesserinvisibilty',
  },
  MOLTEN_ARMOR: {
    id: 43046,
    name: 'Molten Armor',
    icon: 'ability_mage_moltenarmor',
    lowRanks: [43045, 30482],
  },
  POLYMORPH: {
    id: 61305,
    name: 'Polymorph',
    icon: 'spell_nature_polymorph',
    lowRanks: [28271, 12826, 28272, 61780, 61721, 12825, 12824, 118],
  },
  REMOVE_CURSE: {
    id: 475,
    name: 'Remove Curse',
    icon: 'spell_nature_removecurse',
  },
  REPLENISH_MANA: {
    // Mage mana gems
    id: 42987,
    name: 'Mana Gem',
    icon: 'inv_misc_gem_sapphire_02',
    lowRanks: [27103, 10058, 10057, 10052, 5405],
  },
  SCORCH: {
    id: 42859,
    name: 'Scorch',
    icon: 'spell_fire_soulburn',
    lowRanks: [42858, 27074, 27073, 10207, 10206, 10205, 8446, 8445, 8444, 2948],
  },
  SLOW_FALL: {
    id: 130,
    name: 'Slow Fall',
    icon: 'spell_magic_featherfall',
  },
  SPELLSTEAL: {
    id: 30449,
    name: 'Spellsteal',
    icon: 'spell_arcane_arcane02',
  },

  // ---------
  // TALENTS
  // ---------

  // Arcane
  ARCANE_BARRAGE: {
    id: 44781,
    name: 'Arcane Barrage',
    icon: 'ability_mage_arcanebarrage',
    lowRanks: [44780, 44425],
  },
  ARCANE_POWER: {
    id: 12042,
    name: 'Arcane Power',
    icon: 'spell_nature_lightning',
  },
  FOCUS_MAGIC: {
    id: 54646,
    name: 'Focus Magic',
    icon: 'spell_arcane_studentofmagic',
  },
  INCANTERS_ABSORPTION: {
    id: 44413,
    name: "Incanter's Absorption",
    icon: 'spell_arcane_studentofmagic',
  },
  MISSILE_BARRAGE: {
    id: 44401,
    name: 'Missile Barrage',
    icon: 'ability_mage_arcanebarrage',
  },
  MISSILE_BARRAGE_CHANNELED: {
    id: 54490,
    name: 'Missile Barrage',
    icon: 'ability_mage_arcanebarrage',
    lowRanks: [54489, 54488, 54486, 44404],
  },
  PRESENCE_OF_MIND: {
    id: 12043,
    name: 'Presence of Mind',
    icon: 'spell_nature_enchantarmor',
  },
  SLOW: {
    id: 31589,
    name: 'Slow',
    icon: 'spell_nature_slow',
  },

  // Fire
  BLAST_WAVE: {
    id: 42945,
    name: 'Blast Wave',
    icon: 'spell_holy_excorcism_02',
    lowRanks: [42944, 33933, 27133, 13021, 13020, 13019, 13018, 11113],
  },
  DRAGONS_BREATH: {
    id: 42950,
    name: "Dragon's Breath",
    icon: 'inv_misc_head_dragon_01',
    lowRanks: [42949, 33043, 33042, 33041, 31661],
  },
  LIVING_BOMB: {
    id: 55360,
    name: 'Living Bomb',
    icon: 'ability_mage_livingbomb',
    lowRanks: [55359, 44457],
  },
  PYROBLAST: {
    id: 42891,
    name: 'Pyroblast',
    icon: 'spell_fire_fireball02',
    lowRanks: [42890, 33938, 27132, 18809, 12526, 12525, 12524, 12523, 12522, 12505, 11366],
  },

  // Frost
  COLD_SNAP: {
    id: 11958,
    name: 'Cold Snap',
    icon: 'spell_frost_wizardmark',
  },
  ICY_VEINS: {
    id: 12472,
    name: 'Icy Veins',
    icon: 'spell_frost_coldhearted',
  },
  SUMMON_WATER_ELEMENTAL: {
    id: 31687,
    name: 'Summon Water Elemental',
    icon: 'spell_frost_summonwaterelemental_2',
  },
});

export default spells;
