/**
 * All WotLK Shaman spells (including talent spells) go here.
 * You need to do this manually by opening a WCL report and clicking the icons of spells to open the relevant Wowhead page. Here, you can get the icon name by clicking the icon, copy the name of the spell, and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS/classic` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import { spellIndexableList } from '../Spell';

const spells = spellIndexableList({
  // --------
  // SHARED
  // --------
  ANCESTRAL_SPIRIT: {
    id: 49277,
    name: 'Ancestral Spirit',
    icon: 'spell_nature_regenerate',
    lowRanks: [25590, 20777, 20776, 20610, 20609, 2008],
  },
  ASTRAL_RECALL: {
    id: 556,
    name: 'Astral Recall',
    icon: 'spell_nature_astralrecal',
  },
  BLOODLUST: {
    id: 2825,
    name: 'Bloodlust',
    icon: 'spell_nature_bloodlust',
  },
  CALL_OF_THE_ANCESTORS: {
    id: 66843,
    name: 'Call of the Ancestors',
    icon: 'spell_shaman_dropall_02',
  },
  CALL_OF_THE_ELEMENTS: {
    id: 66842,
    name: 'Call of the Elements',
    icon: 'spell_shaman_dropall_01',
  },
  CALL_OF_THE_SPIRITS: {
    id: 66844,
    name: 'Call of the Spirits',
    icon: 'spell_shaman_dropall_01',
  },
  CHAIN_HEAL: {
    id: 55459,
    name: 'Chain Heal',
    icon: 'spell_nature_healingwavegreater',
    lowRanks: [55458, 25423, 25422, 10623, 10622, 1064],
  },
  CHAIN_LIGHTNING: {
    id: 49271,
    name: 'Chain Lightning',
    icon: 'spell_nature_chainlightning',
    lowRanks: [49270, 25442, 25439, 10605, 2860, 930, 421],
  },
  CLEANSING_TOTEM: {
    id: 8170,
    name: 'Cleansing Totem',
    icon: 'spell_nature_diseasecleansingtotem',
  },
  CURE_TOXINS: {
    id: 526,
    name: 'Cure Toxins',
    icon: 'spell_nature_nullifypoison',
  },
  EARTH_ELEMENTAL_TOTEM: {
    id: 2062,
    name: 'Earth Elemental Totem',
    icon: 'spell_nature_earthelemental_totem',
  },
  EARTH_SHOCK: {
    id: 49231,
    name: 'Earth Shock',
    icon: 'spell_nature_earthshock',
    lowRanks: [49230, 25454, 10414, 10413, 10412, 8046, 8045, 8044, 8042],
  },
  EARTHBIND_TOTEM: {
    id: 2484,
    name: 'Earthbind Totem',
    icon: 'spell_nature_strengthofearthtotem02',
  },
  EARTHLIVING_WEAPON: {
    id: 51994,
    name: 'Earthliving Weapon',
    icon: 'spell_shaman_earthlivingweapon',
    lowRanks: [51993, 51992, 51991, 51988, 51730],
  },
  FAR_SIGHT: {
    id: 6196,
    name: 'Far Sight',
    icon: 'spell_nature_farsight',
  },
  FIRE_ELEMENTAL_TOTEM: {
    id: 2894,
    name: 'Fire Elemental Totem',
    icon: 'spell_fire_elemental_totem',
  },
  FIRE_NOVA: {
    id: 61657,
    name: 'Fire Nova',
    icon: 'spell_fire_sealoffire',
    lowRanks: [
      61654, 61649, 61650, 25547, 25537, 25535, 25546, 11315, 11307, 11306, 11314, 8503, 8499, 8502,
      8498, 1535, 8349,
    ],
  },
  FIRE_RESISTANCE_TOTEM: {
    id: 58739,
    name: 'Fire Resistance Totem',
    icon: 'spell_fireresistancetotem_01',
    lowRanks: [58737, 25563, 10538, 10537, 8184],
  },
  FLAME_SHOCK: {
    id: 49233,
    name: 'Flame Shock',
    icon: 'spell_fire_flameshock',
    lowRanks: [49232, 25457, 29228, 10448, 10447, 8053, 8052, 8050],
  },
  FLAMETONGUE_TOTEM: {
    id: 58656,
    name: 'Flametongue Totem',
    icon: 'spell_nature_guardianward',
    lowRanks: [58652, 58649, 25557, 16387, 10526, 8249, 8227],
  },
  FLAMETONGUE_WEAPON: {
    id: 58790,
    name: 'Flametongue Weapon',
    icon: 'spell_fire_flametounge',
    lowRanks: [58789, 58785, 25489, 16342, 16341, 16339, 8030, 8027, 8024],
  },
  FROST_RESISTANCE_TOTEM: {
    id: 58745,
    name: 'Frost Resistance Totem',
    icon: 'spell_frostresistancetotem_01',
    lowRanks: [58741, 25560, 10479, 10478, 8181],
  },
  FROST_SHOCK: {
    id: 49236,
    name: 'Frost Shock',
    icon: 'spell_frost_frostshock',
    lowRanks: [49235, 25464, 10473, 10472, 8058, 8056],
  },
  FROSTBRAND_WEAPON: {
    id: 58796,
    name: 'Frostbrand Weapon',
    icon: 'spell_frost_frostbrand',
    lowRanks: [58795, 58794, 25500, 16356, 16355, 10456, 8038, 8033],
  },
  GHOST_WOLF: {
    id: 2645,
    name: 'Ghost Wolf',
    icon: 'spell_nature_spiritwolf',
  },
  GROUNDING_TOTEM: {
    id: 8177,
    name: 'Grounding Totem',
    icon: 'spell_nature_groundingtotem',
  },
  HEALING_STREAM_TOTEM: {
    id: 58757,
    name: 'Healing Stream Totem',
    icon: 'inv_spear_04',
    lowRanks: [58756, 58755, 25567, 10463, 10462, 6377, 6375, 5394],
  },
  HEALING_WAVE: {
    id: 49273,
    name: 'Healing Wave',
    icon: 'spell_nature_magicimmunity',
    lowRanks: [49272, 25396, 25391, 25357, 10396, 10395, 8005, 959, 939, 913, 547, 332, 331],
  },
  HEROISM: {
    id: 32182,
    name: 'Heroism',
    icon: 'ability_shaman_heroism',
  },
  HEX: {
    id: 51514,
    name: 'Hex',
    icon: 'spell_shaman_hex',
  },
  LAVA_BURST: {
    id: 60043,
    name: 'Lava Burst',
    icon: 'spell_shaman_lavaburst',
    lowRanks: [51505],
  },
  LESSER_HEALING_WAVE: {
    id: 49276,
    name: 'Lesser Healing Wave',
    icon: 'spell_nature_healingwavelesser',
    lowRanks: [49275, 25420, 10468, 10467, 10466, 8010, 8008, 8004],
  },
  LIGHTNING_BOLT: {
    id: 49238,
    name: 'Lightning Bolt',
    icon: 'spell_nature_lightning',
    lowRanks: [49237, 25449, 25448, 15208, 15207, 10392, 10391, 6041, 943, 915, 548, 529, 403],
  },
  LIGHTNING_SHIELD: {
    id: 49281,
    name: 'Lightning Shield',
    icon: 'spell_nature_lightningshield',
    lowRanks: [49280, 25472, 25469, 10432, 10431, 8134, 945, 905, 325, 324],
  },
  MAGMA_TOTEM: {
    id: 58734,
    name: 'Magma Totem',
    icon: 'spell_fire_selfdestruct',
    lowRanks: [58731, 25552, 10587, 10586, 10585, 8190],
  },
  MANA_SPRING_TOTEM: {
    id: 58774,
    name: 'Mana Spring Totem',
    icon: 'spell_nature_manaregentotem',
    lowRanks: [58773, 58771, 25570, 10497, 10496, 10495, 5675],
  },
  NATURE_RESISTANCE_TOTEM: {
    id: 58749,
    name: 'Nature Resistance Totem',
    icon: 'spell_nature_natureresistancetotem',
    lowRanks: [58746, 25574, 10601, 10600, 10595],
  },
  PURGE: {
    id: 8012,
    name: 'Purge',
    icon: 'spell_nature_purge',
    lowRanks: [370],
  },
  REINCARNATION: {
    id: 20608,
    name: 'Reincarnation',
    icon: 'spell_nature_reincarnation',
  },
  ROCKBITER_WEAPON: {
    id: 10399,
    name: 'Rockbiter Weapon',
    icon: 'spell_nature_rockbiter',
    lowRanks: [8019, 8018, 8017],
  },
  SEARING_TOTEM: {
    id: 58704,
    name: 'Searing Totem',
    icon: 'spell_fire_searingtotem',
    lowRanks: [58703, 58699, 25533, 10438, 10437, 6365, 6364, 6363, 3599],
  },
  SENTRY_TOTEM: {
    id: 6495,
    name: 'Sentry Totem',
    icon: 'spell_nature_removecurse',
  },
  STONECLAW_TOTEM: {
    id: 58582,
    name: 'Stoneclaw Totem',
    icon: 'spell_nature_stoneclawtotem',
    lowRanks: [58581, 58580, 25525, 10428, 10427, 6392, 6391, 6390, 5730],
  },
  STONESKIN_TOTEM: {
    id: 58753,
    name: 'Stoneskin Totem',
    icon: 'spell_nature_stoneskintotem',
    lowRanks: [58751, 25509, 25508, 10408, 10407, 10406, 8155, 8154, 8071],
  },
  STRENGTH_OF_EARTH_TOTEM: {
    id: 58643,
    name: 'Strength of Earth Totem',
    icon: 'spell_nature_earthbindtotem',
    lowRanks: [57622, 25528, 25361, 10442, 8161, 8160, 8075],
  },
  TOTEMIC_CALL: {
    id: 36936,
    name: 'Totemic Recall',
    icon: 'spell_shaman_totemrecall',
  },
  TREMOR_TOTEM: {
    id: 8143,
    name: 'Tremor Totem',
    icon: 'spell_nature_tremortotem',
  },
  WATER_BREATHING: {
    id: 131,
    name: 'Water Breathing',
    icon: 'spell_shadow_demonbreath',
  },
  WATER_SHIELD: {
    id: 57960,
    name: 'Water Shield',
    icon: 'ability_shaman_watershield',
    lowRanks: [33736, 24398, 52138, 52136, 52134, 52131, 52129, 52127],
  },
  WATER_WALKING: {
    id: 546,
    name: 'Water Walking',
    icon: 'spell_frost_windwalkon',
  },
  WIND_SHEAR: {
    id: 57994,
    name: 'Wind Shear',
    icon: 'spell_nature_cyclone',
  },
  WINDFURY_TOTEM: {
    id: 8512,
    name: 'Windfury Totem',
    icon: 'spell_nature_windfury',
  },
  WINDFURY_WEAPON: {
    id: 58804,
    name: 'Windfury Weapon',
    icon: 'spell_nature_cyclone',
    lowRanks: [58803, 58801, 25505, 16362, 10486, 8235, 8232],
  },
  WRATH_OF_AIR_TOTEM: {
    id: 3738,
    name: 'Wrath of Air Totem',
    icon: 'spell_nature_slowingtotem',
  },

  // ---------
  // TALENTS
  // ---------

  // Elemental
  ELEMENTAL_MASTERY: {
    id: 16166,
    name: 'Elemental Mastery',
    icon: 'spell_nature_wispheal',
  },
  THUNDERSTORM: {
    id: 59159,
    name: 'Thunderstorm',
    icon: 'spell_shaman_thunderstorm',
    lowRanks: [59158, 59156, 51490],
  },
  TOTEM_OF_WRATH: {
    id: 57722,
    name: 'Totem of Wrath',
    icon: 'spell_fire_totemofwrath',
    lowRanks: [57721, 57720, 30706],
  },

  // Enhancement
  FERAL_SPIRIT: {
    id: 51533,
    name: 'Feral Spirit',
    icon: 'spell_shaman_feralspirit',
  },
  LAVA_LASH: {
    id: 60103,
    name: 'Lava Lash',
    icon: 'ability_shaman_lavalash',
  },
  SHAMANISTIC_RAGE: {
    id: 30823,
    name: 'Shamanistic Rage',
    icon: 'spell_nature_shamanrage',
  },
  STORMSTRIKE: {
    id: 17364,
    name: 'Stormstrike',
    icon: 'ability_shaman_stormstrike',
  },

  // Restoration
  CLEANSE_SPIRIT: {
    id: 51886,
    name: 'Cleanse Spirit',
    icon: 'ability_shaman_cleansespirit',
  },
  EARTH_SHIELD: {
    id: 49284,
    name: 'Earth Shield',
    icon: 'spell_nature_skinofearth',
    lowRanks: [49283, 32594, 32593, 974],
  },
  EARTH_SHIELD_HEAL: {
    id: 379,
    name: 'Earth Shield',
    icon: 'spell_nature_skinofearth',
  },
  MANA_TIDE_TOTEM: {
    id: 16190,
    name: 'Mana Tide Totem',
    icon: 'spell_frost_summonwaterelemental',
  },
  MANA_TIDE_TOTEM_BUFF: {
    id: 39609,
    name: 'Mana Tide Totem',
    icon: 'spell_holy_stoicism',
  },
  NATURES_SWIFTNESS: {
    id: 16188,
    name: "Nature's Swiftness",
    icon: 'spell_nature_ravenform',
  },
  RIP_TIDE: {
    id: 61301,
    name: 'Riptide',
    icon: 'spell_nature_riptide',
    lowRanks: [61300, 61299, 61295],
  },
  TIDAL_FORCE: {
    id: 55198,
    name: 'Tidal Force',
    icon: 'spell_frost_frostbolt',
  },
});

export default spells;
