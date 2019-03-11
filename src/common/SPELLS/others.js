/**
 * Anything that isn't a class specific ability nor a racial goes in here. You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

export default {
  // General:
  FAKE_SPELL: {
    id: -100,
    name: 'Fake Spell',
    icon: 'spell_super_duper_fake02',
  },
  // I think both `Word of Recall (OLD)` and `Melee` may be seen as spell id 1, so this is a bit complicated.
  // WORD_OF_RECALL_OLD: {
  //   id: 1,
  //   name: 'Word of Recall (OLD)',
  //   icon: 'trade_engineering',
  // },
  MELEE: {
    id: 1,
    name: 'Auto attack',
    icon: 'inv_axe_02',
  },
  LEECH: {
    id: 143924,
    name: 'Leech',
    icon: 'spell_shadow_lifedrain02',
  },
  AVOIDANCE: {
    id: 143927,
    name: 'Avoidance',
    icon: 'ability_rogue_quickrecovery',
  },
  SPEED: {
    id: 143922,
    name: 'Speed',
    icon: 'petbattle_speed',
  },
  ANCIENT_HEALING_POTION: {
    id: 188016,
    name: 'Ancient Healing Potion',
    icon: 'inv_alchemy_70_red',
  },
  ASTRAL_HEALING_POTION: {
    id: 251645,
    name: 'Astral Healing Potion',
    icon: 'inv_alchemy_70_red',
  },
  POTION_OF_PROLONGED_POWER: {
    id: 229206,
    name: 'Potion of Prolonged Power',
    icon: 'trade_alchemy_dpotion_a28',
  },
  POTION_OF_THE_OLD_WAR: {
    id: 188028,
    name: 'Potion of the Old War',
    icon: 'inv_alchemy_70_orange',
  },
  FLASK_OF_THE_WHISPERED_PACT: {
    id: 188031,
    name: 'Flask of the Whispered Pact',
    icon: 'inv_alchemy_70_flask03purple',
  },
  FLASK_OF_THE_SEVENTH_DEMON: {
    id: 188033,
    name: 'Flask of the Seventh Demon',
    icon: 'inv_alchemy_70_flask03orange',
  },
  FLASK_OF_THE_COUNTLESS_ARMIES: {
    id: 188034,
    name: 'Flask of the Countless Armies',
    icon: 'inv_alchemy_70_flask03red',
  },
  FLASK_OF_TEN_THOUSAND_SCARS: {
    id: 188035,
    name: 'Flask of Ten Thousand Scars',
    icon: 'inv_alchemy_70_flask03green',
  },
  FLASK_OF_THE_CURRENTS: {
    id: 251836,
    name: 'Flask of the Currents',
    icon: 'inv_alchemy_80_flask01green',
  },
  FLASK_OF_ENDLESS_FATHOMS: {
    id: 251837,
    name: 'Flask of Endless Fathoms',
    icon: 'inv_alchemy_80_flask01purple',
  },
  FLASK_OF_THE_UNDERTOW: {
    id: 251839,
    name: 'Flask of the Undertow',
    icon: 'inv_alchemy_80_flask01orange',
  },
  FLASK_OF_THE_VAST_HORIZON: {
    id: 251838,
    name: 'Flask of the Vast Horizon',
    icon: 'inv_alchemy_80_flask01red',
  },
  KUL_TIRAMISU: {
    id: 257408,
    name: 'Kul Tiramisu',
    icon: 'inv_cooking_80_kultiramisu',
  },
  LOA_LEAF: {
    id: 257418,
    name: 'Loa Leaf',
    icon: 'inv_cooking_80_loaloaf',
  },
  RAVENBERRY_TARTS: {
    id: 257413,
    name: 'Ravenberry Tarts',
    icon: 'inv_cooking_80_ravenberrytart',
  },
  MON_DAZI: {
    id: 257422,
    name: 'Mon\'Dazi',
    icon: 'inv_cooking_80_mondazi',
  },
  HONEY_GLAZED_HAUNCHES: {
    id: 257410,
    name: 'Honey-Glazed Haunches',
    icon: 'inv_cooking_80_honeyglazedhaunch',
  },
  SAILOR_PIE: {
    id: 257420,
    name: 'Sailor\'s Pie',
    icon: 'inv_cooking_80_sailorspie',
  },
  SWAMP_FISH_N_CHIPS: {
    id: 257415,
    name: 'Swamp Fish \'n Chips',
    icon: 'inv_cooking_80_swampfishnchips',
  },
  SPICED_SNAPPER: {
    id: 257424,
    name: 'Spiced Snapper',
    icon: 'inv_cooking_80_spicedcatfish',
  },
  GALLEY_BANQUET_INT: {
    id: 259449,
    name: 'Galley Banquet',
    icon: 'inv_misc_food_157_fish_80',
  },
  GALLEY_BANQUET_STR: {
    id: 259452,
    name: 'Galley Banquet',
    icon: 'inv_misc_food_157_fish_80',
  },
  GALLEY_BANQUET_AGI: {
    id: 259448,
    name: 'Galley Banquet',
    icon: 'inv_misc_food_157_fish_80',
  },
  GALLEY_BANQUET_STA: {
    id: 259453,
    name: 'Galley Banquet',
    icon: 'inv_misc_food_157_fish_80',
  },
  BOUNTIFUL_CAPTAIN_FEAST_INT: {
    id: 259455,
    name: 'Bountiful Captain\'s Feast',
    icon: 'inv_cooking_80_majorfeast',
  },
  BOUNTIFUL_CAPTAIN_FEAST_STR: {
    id: 259456,
    name: 'Bountiful Captain\'s Feast',
    icon: 'inv_cooking_80_majorfeast',
  },
  BOUNTIFUL_CAPTAIN_FEAST_AGI: {
    id: 259454,
    name: 'Bountiful Captain\'s Feast',
    icon: 'inv_cooking_80_majorfeast',
  },
  BOUNTIFUL_CAPTAIN_FEAST_STA: {
    id: 259457,
    name: 'Bountiful Captain\'s Feast',
    icon: 'inv_cooking_80_majorfeast',
  },
  DEFILED_AUGMENT_RUNE: {
    id: 224001,
    name: 'Defiled Augment Rune',
    icon: 'ability_bossfellord_felspike',
  },
  UNBENDING_POTION: {
    id: 127845,
    name: 'Unbending Potion',
    icon: 'inv_alchemy_70_flask04',
  },
  SPIRIT_BERRIES: {
    id: 223573,
    name: 'Spirit Berries',
    icon: 'inv_misc_food_93_skethylberries',
  },
  PURE_RAGE_POTION: {
    id: 175821,
    name: 'Pure Rage Potion',
    icon: 'trade_alchemy_dpotion_a13',
  },
  SUNFRUIT: {
    id: 223595,
    name: 'Sunfruit',
    icon: 'inv_misc_food_42',
  },
  HEALTHSTONE: {
    id: 6262,
    name: 'Healthstone',
    icon: 'warlock_healthstone',
  },
  ANCIENT_REJUVENATION_POTION: {
    id: 188018,
    name: 'Ancient Rejuvenation Potion',
    icon: 'inv_alchemy_70_purple',
  },
  MARK_OF_THE_CLAW: {
    id: 190909,
    name: 'Mark of the Claw',
    icon: 'classicon_druid',
  },
  // Food Buffs
  THE_HUNGRY_MAGISTER: {
    id: 225602,
    name: 'The Hungry Magister',
    icon: 'spell_misc_food',
  },
  AZSHARI_SALAD: {
    id: 225603,
    name: 'Azshari Salad',
    icon: 'spell_misc_food',
  },
  NIGHTBORNE_DELICACY_PLATTER: {
    id: 225604,
    name: 'Nightborne Delicacy Platter',
    icon: 'spell_misc_food',
  },
  SEED_BATTERED_FISH_PLATE: {
    id: 225605,
    name: 'Seed-Battered Fish Plate',
    icon: 'spell_misc_food',
  },
  STAM_FEAST: {
    id: 201637,
    name: 'Lavish Suramar Feast',
    icon: 'spell_misc_food',
  },
  STR_FEAST: {
    id: 201638,
    name: 'Lavish Suramar Feast',
    icon: 'spell_misc_food',
  },
  AGI_FEAST: {
    id: 201639,
    name: 'Lavish Suramar Feast',
    icon: 'spell_misc_food',
  },
  INT_FEAST: {
    id: 201640,
    name: 'Lavish Suramar Feast',
    icon: 'spell_misc_food',
  },
  DARKMOON_VERS_FOOD: {
    id: 185736,
    name: 'Lemon Herb Filet',
    icon: 'spell_misc_food',
  },
  // Items buffs:
  JACINS_RUSE: {
    id: 224149,
    name: 'Jacin\'s Ruse',
    icon: 'sha_ability_rogue_bloodyeye',
  },
  FRAGILE_ECHO_ENERGIZE: {
    id: 215270,
    name: 'Fragile Echo',
    icon: 'spell_warlock_demonsoul',
  },
  MARK_OF_THE_ANCIENT_PRIESTESS: {
    id: 228401,
    name: 'Mark of the Ancient Priestess',
    icon: 'ability_priest_ascension',
  },

  // Item Abilities
  DRUMS_OF_FURY: {
    id: 178207,
    name: 'Drums of Fury',
    icon: 'inv_misc_drum_01',
  },
  DRUMS_OF_RAGE: {
    id: 146555,
    name: 'Drums of Rage',
    icon: 'inv_misc_drum_05',
  },
  DRUMS_OF_THE_MOUNTAIN: {
    id: 230935,
    name: 'Drums of the Mountain',
    icon: 'inv_archaeology_70_tauren_drum',
  },
  ETERNAL_ALCHEMIST_STONE_STRENGTH_BUFF: {
    id: 60229,
    name: 'Strength',
    icon: 'spell_nature_strength',
  },
  ETERNAL_ALCHEMIST_STONE_AGILITY_BUFF: {
    id: 60233,
    name: 'Agility',
    icon: 'ability_hunter_onewithnature',
  },
  ETERNAL_ALCHEMIST_STONE_INTELLECT_BUFF: {
    id: 60234,
    name: 'Intellect',
    icon: 'spell_arcane_focusedpower',
  },

  // Encounter mechanics
  RECURSIVE_STRIKES_ENEMY: {
    id: 218508,
    name: 'Recursive Strikes',
    icon: 'ability_mage_massinvisibility',
  },
  MAGIC_MELEE: {
    id: -32, // No idea why it's negative, but adds with "magic melee attacks" (eels on Mistress/tank add on KJ melee) cast an ability with this ID
    name: 'Melee',
    icon: 'inv_axe_02',
  },
  ASTRAL_VULNERABILITY: {
    id: 236330,
    name: 'Astral Vulnerability',
    icon: 'spell_frost_wisp',
  },
  ANNIHILATION_TRILLIAX: {
    id: 207631,
    name: 'Annihilation',
    icon: 'spell_arcane_arcanetorrent',
  },
  //Toys
  BLOW_DARKMOON_WHISTLE: { //Blows the whistle making an annoying voice
    id: 132568,
    name: 'Blow Darkmoon Whistle',
    icon: 'ability_hunter_beastcall',
  },
  DARKMOON_FIREWORK: { //Darkmoon Firework toy
    id: 103740,
    name: 'Darkmoon Firework',
    icon: 'inv_misc_missilesmallcluster_green',
  },
  BIG_RED_RAYS: {
    id: 229837,
    name: 'Big Red Rays',
    icon: 'priest_icon_chakra_red',
  },
};
