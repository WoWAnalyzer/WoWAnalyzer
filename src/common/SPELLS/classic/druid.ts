/**
 * All WotLK Druid spells (including talent spells) go here.
 * You need to do this manually by opening a WCL report and clicking the icons of spells to open the relevant Wowhead page. Here, you can get the icon name by clicking the icon, copy the name of the spell, and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS/classic` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import { spellIndexableList } from '../Spell';

const spells = spellIndexableList({
  // --------
  // SHARED
  // --------
  ABOLISH_POISON: {
    id: 2893,
    name: 'Abolish Poison',
    icon: 'spell_nature_nullifypoison_02',
  },
  BARKSKIN: {
    id: 22812,
    name: 'Barkskin',
    icon: 'spell_nature_stoneclawtotem',
  },
  BASH: {
    id: 8983,
    name: 'Bash',
    icon: 'ability_druid_bash',
    lowRanks: [6798, 5211],
  },
  BEAR_FORM: {
    id: 5487,
    name: 'Bear Form',
    icon: 'ability_racial_bearform',
  },
  BERSERK: {
    id: 50334,
    name: 'Berserk',
    icon: 'ability_druid_berserk',
  },
  CAT_FORM: {
    id: 768,
    name: 'Cat Form',
    icon: 'ability_druid_catform',
  },
  CHALLENGING_ROAR: {
    id: 5209,
    name: 'Challenging Roar',
    icon: 'ability_druid_challangingroar',
  },
  CLAW: {
    id: 48570,
    name: 'Claw',
    icon: 'ability_druid_rake',
    lowRanks: [48569, 27000, 9850, 9849, 5201, 3029, 1082],
  },
  COWER: {
    id: 48575,
    name: 'Cower',
    icon: 'ability_druid_cower',
    lowRanks: [27004, 31709, 9892, 9000, 8998],
  },
  CURE_POISON: {
    id: 8946,
    name: 'Cure Poison',
    icon: 'spell_nature_nullifypoison',
  },
  CYCLONE: {
    id: 33786,
    name: 'Cyclone',
    icon: 'spell_nature_earthbind',
  },
  DASH: {
    id: 33357,
    name: 'Dash',
    icon: 'ability_druid_dash',
    lowRanks: [9821, 1850],
  },
  DEMORALIZING_ROAR: {
    id: 48560,
    name: 'Demoralizing Roar',
    icon: 'classic_ability_druid_demoralizingroar',
    lowRanks: [48559, 26998, 9898, 9747, 9490, 1735, 99],
  },
  DIRE_BEAR_FORM: {
    id: 9634,
    name: 'Dire Bear Form',
    icon: 'ability_racial_bearform',
  },
  EARTH_AND_MOON: {
    id: 60433,
    name: 'Earth and Moon',
    icon: 'ability_druid_earthandsky',
  },
  ENRAGE: {
    id: 5229,
    name: 'Enrage',
    icon: 'ability_druid_enrage',
  },
  ENTANGLING_ROOTS: {
    id: 53308,
    name: 'Entangling Roots',
    icon: 'spell_nature_stranglevines',
    lowRanks: [26989, 9853, 9852, 5196, 5195, 1062, 339],
  },
  FAERIE_FIRE: {
    id: 770,
    name: 'Faerie Fire',
    icon: 'spell_nature_faeriefire',
  },
  FAERIE_FIRE_FERAL: {
    id: 16857,
    name: 'Faerie Fire (Feral)',
    icon: 'spell_nature_faeriefire',
  },
  FEROCIOUS_BITE: {
    id: 48577,
    name: 'Ferocious Bite',
    icon: 'ability_druid_ferociousbite',
    lowRanks: [48576, 24248, 31018, 22829, 22828, 22827, 22568],
  },
  FRENZIED_REGENERATION: {
    id: 22842,
    name: 'Frenzied Regeneration',
    icon: 'ability_bullrush',
  },
  GIFT_OF_THE_WILD: {
    id: 48470,
    name: 'Gift of the Wild',
    icon: 'spell_nature_giftofthewild',
    lowRanks: [26991, 21850, 21849],
  },
  GROWL: {
    id: 6795,
    name: 'Growl',
    icon: 'ability_physical_taunt',
  },
  HEALING_TOUCH: {
    id: 48378,
    name: 'Healing Touch',
    icon: 'spell_nature_healingtouch',
    lowRanks: [
      48377,
      26979,
      26978,
      25297,
      9889,
      9888,
      9758,
      8903,
      6778,
      5189,
      5188,
      5187,
      5186,
      5185,
    ],
  },
  HIBERNATE: {
    id: 18658,
    name: 'Hibernate',
    icon: 'spell_nature_sleep',
    lowRanks: [18657, 2637],
  },
  HURRICANE: {
    id: 48467,
    name: 'Hurricane',
    icon: 'spell_nature_cyclone',
    lowRanks: [27012, 17402, 17401, 16914],
  },
  INNERVATE: {
    id: 29166,
    name: 'Innervate',
    icon: 'spell_nature_lightning',
  },
  LACERATE: {
    id: 48568,
    name: 'Lacerate',
    icon: 'ability_druid_lacerate',
    lowRanks: [48567, 33745],
  },
  LIFEBLOOM: {
    id: 48451,
    name: 'Lifebloom',
    icon: 'inv_misc_herb_felblossom',
    lowRanks: [48450, 33763],
  },
  MAIM: {
    id: 49802,
    name: 'Maim',
    icon: 'ability_druid_mangle-tga',
    lowRanks: [22570],
  },
  MARK_OF_THE_WILD: {
    id: 48469,
    name: 'Mark of the Wild',
    icon: 'spell_nature_regeneration',
    lowRanks: [26990, 9885, 9884, 8907, 5234, 6756, 5232, 1126],
  },
  MAUL: {
    id: 48480,
    name: 'Maul',
    icon: 'ability_druid_maul',
    lowRanks: [48479, 26996, 9881, 9880, 9745, 8972, 6809, 6808, 6807],
  },
  MOONFIRE: {
    id: 48463,
    name: 'Moonfire',
    icon: 'spell_nature_starfall',
    lowRanks: [48462, 26988, 26987, 9835, 9834, 9833, 8929, 8928, 8927, 8926, 8925, 8924, 8921],
  },
  NATURES_GRASP: {
    id: 53312,
    name: "Nature's Grasp",
    icon: 'spell_nature_natureswrath',
    lowRanks: [27009, 17329, 16813, 16812, 16811, 16810],
  },
  NOURISH: {
    id: 50464,
    name: 'Nourish',
    icon: 'ability_druid_nourish',
  },
  POUNCE: {
    id: 49803,
    name: 'Pounce',
    icon: 'ability_druid_supriseattack',
    lowRanks: [27006, 9827, 9823, 9005],
  },
  PROWL: {
    id: 5215,
    name: 'Prowl',
    icon: 'ability_ambush',
  },
  RAKE: {
    id: 48574,
    name: 'Rake',
    icon: 'ability_druid_disembowel',
    lowRanks: [48573, 27003, 9904, 1824, 1823, 1822],
  },
  RAVAGE: {
    id: 48579,
    name: 'Ravage',
    icon: 'ability_druid_ravage',
    lowRanks: [48578, 27005, 9867, 9866, 6787, 6785],
  },
  REBIRTH: {
    id: 48477,
    name: 'Rebirth',
    icon: 'spell_nature_reincarnation',
    lowRanks: [26994, 20748, 20747, 20742, 20739, 20484],
  },
  REGROWTH: {
    id: 48443,
    name: 'Regrowth',
    icon: 'spell_nature_resistnature',
    lowRanks: [48442, 26980, 9858, 9857, 9856, 9750, 8941, 8940, 8939, 8938, 8936],
  },
  REJUVENATION: {
    id: 48441,
    name: 'Rejuvenation',
    icon: 'spell_nature_rejuvenation',
    lowRanks: [
      48440,
      26982,
      26981,
      25299,
      9841,
      9840,
      9839,
      8910,
      3627,
      2091,
      2090,
      1430,
      1058,
      774,
    ],
  },
  REMOVE_CURSE: {
    id: 2782,
    name: 'Remove Curse',
    icon: 'spell_holy_removecurse',
  },
  RIP: {
    id: 49800,
    name: 'Rip',
    icon: 'ability_ghoulfrenzy',
    lowRanks: [49799, 27008, 9896, 9894, 9752, 9493, 9492, 1079],
  },
  SAVAGE_ROAR: {
    id: 52610,
    name: 'Savage Roar',
    icon: 'ability_druid_skinteeth',
  },
  SHRED: {
    id: 48572,
    name: 'Shred',
    icon: 'spell_shadow_vampiricaura',
    lowRanks: [48571, 27002, 27001, 9830, 9829, 8992, 6800, 5221],
  },
  SOOTHE_ANIMAL: {
    id: 26995,
    name: 'Soothe Animal',
    icon: 'ability_hunter_beastsoothe',
    lowRanks: [9901, 8955, 2908],
  },
  STARFIRE: {
    id: 48465,
    name: 'Starfire',
    icon: 'spell_arcane_starfire',
    lowRanks: [48464, 26986, 25298, 9876, 9875, 8951, 8950, 8949, 2912],
  },
  SWIPE_BEAR: {
    id: 48562,
    name: 'Swipe (Bear)',
    icon: 'inv_misc_monsterclaw_03',
    lowRanks: [48561, 26997, 9908, 9754, 769, 780, 779],
  },
  SWIPE_CAT: {
    id: 62078,
    name: 'Swipe (Cat)',
    icon: 'inv_misc_monsterclaw_03',
  },
  THORNS: {
    id: 53307,
    name: 'Thorns',
    icon: 'spell_nature_thorns',
    lowRanks: [26992, 9910, 9756, 8914, 1075, 782, 467],
  },
  TIGERS_FURY: {
    id: 50213,
    name: "Tiger's Fury",
    icon: 'ability_mount_jungletiger',
    lowRanks: [50212, 9846, 9845, 6793, 5217],
  },
  TRANQUILITY: {
    id: 48447,
    name: 'Tranquility',
    icon: 'spell_nature_tranquility',
    lowRanks: [48446, 26983, 9863, 9862, 8918, 740],
  },
  WRATH: {
    id: 48461,
    name: 'Wrath',
    icon: 'spell_nature_abolishmagic',
    lowRanks: [48459, 26985, 26984, 9912, 8905, 6780, 5180, 5179, 5178, 5177, 5176],
  },

  // ---------
  // TALENTS
  // ---------
  // Balance
  FORCE_OF_NATURE: {
    id: 33831,
    name: 'Force of Nature',
    icon: 'ability_druid_forceofnature',
  },
  INSECT_SWARM: {
    id: 48468,
    name: 'Insect Swarm',
    icon: 'spell_nature_insectswarm',
    lowRanks: [27013, 24977, 24976, 24975, 24974, 5570],
  },
  MOONKIN_AURA: {
    id: 24907,
    name: 'Moonkin Aura',
    icon: 'spell_nature_moonglow',
  },
  MOONKIN_FORM: {
    id: 24858,
    name: 'Moonkin Form',
    icon: 'spell_nature_forceofnature',
  },
  NATURES_GRACE_BUFF: {
    id: 16886,
    name: "Nature's Grace",
    icon: 'spell_nature_naturesblessing',
  },
  STARFALL: {
    id: 53201,
    name: 'Starfall',
    icon: 'ability_druid_starfall',
    lowRanks: [53200, 53199, 48505],
  },
  TYPHOON: {
    id: 61384,
    name: 'Typhoon',
    icon: 'ability_druid_typhoon',
    lowRanks: [53226, 53225, 53223, 50516],
  },
  // Feral Combat
  FERAL_CHARGE_BEAR: {
    id: 16979,
    name: 'Feral Charge - Bear',
    icon: 'ability_hunter_pet_bear',
  },
  FERAL_CHARGE_CAT: {
    id: 49376,
    name: 'Feral Charge - Cat',
    icon: 'spell_druid_feralchargecat',
  },
  MANGLE_BEAR: {
    id: 48564,
    name: 'Mangle (Bear)',
    icon: 'ability_druid_mangle2',
    lowRanks: [48563, 33987, 33986, 33878],
  },
  MANGLE_CAT: {
    id: 48566,
    name: 'Mangle (Cat)',
    icon: 'ability_druid_mangle2',
    lowRanks: [48565, 33983, 33982, 33876],
  },
  PRIMAL_FURY: {
    id: 37117,
    name: 'Primal Fury',
    icon: 'ability_racial_cannibalize',
    lowRanks: [37116],
  },
  SURVIVAL_INSTINCTS: {
    id: 61336,
    name: 'Survival Instincts',
    icon: 'ability_druid_tigersroar',
  },
  // Restoration
  NATURES_SWIFTNESS_DRUID: {
    id: 17116,
    name: "Nature's Swiftness",
    icon: 'spell_nature_ravenform',
  },
  SWIFTMEND: {
    id: 18562,
    name: 'Swiftmend',
    icon: 'inv_relics_idolofrejuvenation',
  },
  TREE_OF_LIFE: {
    id: 33891,
    name: 'Tree of Life',
    icon: 'ability_druid_treeoflife',
  },
  WILD_GROWTH: {
    id: 53251,
    name: 'Wild Growth',
    icon: 'ability_druid_flourish',
    lowRanks: [53249, 53248, 48438],
  },
});

export default spells;
