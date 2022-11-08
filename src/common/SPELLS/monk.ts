/**
 * All Monk abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import { spellIndexableList } from './Spell';

const spells = spellIndexableList({
  // Shared
  MYSTIC_TOUCH: {
    id: 8647,
    name: 'Mystic Touch',
    icon: 'ability_monk_sparring',
  },
  MYSTIC_TOUCH_DEBUFF: {
    id: 113746,
    name: 'Mystic Touch',
    icon: 'ability_monk_sparring',
  },
  BLACKOUT_KICK: {
    id: 100784,
    name: 'Blackout Kick',
    icon: 'ability_monk_roundhousekick',
  },
  CRACKLING_JADE_LIGHTNING: {
    id: 117952,
    name: 'Crackling Jade Lightning',
    icon: 'ability_monk_cracklingjadelightning',
  },
  ROLL: {
    id: 109132,
    name: 'Roll',
    icon: 'ability_monk_roll',
  },
  SPINNING_CRANE_KICK: {
    id: 101546,
    name: 'Spinning Crane Kick',
    icon: 'ability_monk_cranekick_new',
    manaCost: 2500,
  },
  SPINNING_CRANE_KICK_DAMAGE: {
    id: 107270,
    name: 'Spinning Crane Kick',
    icon: 'ability_monk_cranekick_new',
  },
  TIGER_PALM: {
    id: 100780,
    name: 'Tiger Palm',
    icon: 'ability_monk_tigerpalm',
  },
  TOUCH_OF_DEATH: {
    id: 322109,
    name: 'Touch of Death',
    icon: 'ability_monk_touchofdeath',
  },
  TRANSCENDENCE_TRANSFER: {
    id: 119996,
    name: 'Transcendence: Transfer',
    icon: 'spell_shaman_spectraltransformation',
  },
  LEG_SWEEP: {
    id: 119381,
    name: 'Leg Sweep',
    icon: 'ability_monk_legsweep',
  },
  DETOX_ENERGY: {
    id: 218164,
    name: 'Detox',
    icon: 'ability_rogue_imrovedrecuperate',
  },
  EXPEL_HARM: {
    id: 322101,
    name: 'Expel Harm',
    icon: 'ability_monk_expelharm',
    manaCost: 7500,
  },

  // Mistweaver Monk Spells
  CLOUDED_FOCUS_BUFF: {
    id: 388048,
    name: 'Clouded Focus',
    icon: 'ability_monk_surgingmist',
  },
  ENVELOPING_MIST_TFT: {
    id: 274062,
    name: 'Enveloping Mist',
    icon: 'spell_monk_envelopingmist',
  },
  ESSENCE_FONT_BUFF: {
    id: 191840,
    name: 'Essence Font',
    icon: 'ability_monk_essencefont',
  },
  SECRET_INFUSION_HASTE_BUFF: {
    id: 388497,
    name: 'Secret infusion',
    icon: 'ability_monk_chibrew',
  },
  RENEWING_MIST_HEAL: {
    id: 119611,
    name: 'Renewing Mist',
    icon: 'ability_monk_renewingmists',
  },
  VIVIFY: {
    id: 116670,
    name: 'Vivify',
    icon: 'ability_monk_vivify',
    manaCost: 9500,
  },
  VIVIFICATION_BUFF: {
    id: 392883,
    name: 'Vivifacious Vivification',
    icon: 'ability_monk_vivify',
  },
  ATOTM_BUFF: {
    id: 388026,
    name: 'Ancient Teachings of the Monestary',
    icon: 'inv_misc_book_07',
  },
  ATOTM_HEAL: {
    id: 388024,
    name: 'Ancient Teachings of the Monestary',
    icon: 'inv_jewelcrafting_jadeserpent',
  },
  ATOTM_CRIT_HEAL: {
    id: 388025,
    name: 'Ancient Teachings of the Monestary',
    icon: 'inv_jewelcrafting_jadeserpent',
  },
  INVOKERS_DELIGHT_BUFF: {
    id: 388663,
    name: "Invoker's Delight",
    icon: 'inv_inscription_80_warscroll_battleshout',
  },
  ENVELOPING_BREATH_HEAL: {
    id: 325209,
    name: 'Enveloping Breath',
    icon: 'ability_monk_chiexplosion',
  },
  SOOTHING_BREATH: {
    id: 343737,
    name: 'Soothing Breath',
    icon: 'ability_monk_soothingmists',
  },
  EXPEL_HARM_TARGET_HEAL: {
    id: 344939,
    name: 'Expel Harm',
    icon: 'ability_monk_expelharm',
  },
  // Mastery
  GUSTS_OF_MISTS: {
    id: 191894,
    name: 'Mastery: Gust of Mists',
    icon: 'ability_monk_souldance',
  },
  // Damage Abilities
  TEACHINGS_OF_THE_MONASTERY: {
    id: 202090,
    name: 'Teachings of the Monastery',
    icon: 'passive_monk_teachingsofmonastery',
  },
  BLACKOUT_KICK_TOTM: {
    //Backout Kick from TotM
    id: 228649,
    name: 'Blackout Kick',
    icon: 'ability_monk_roundhousekick',
  },

  // Utility / Other
  DETOX: {
    id: 115450,
    name: 'Detox',
    icon: 'ability_rogue_imrovedrecuperate',
    manaCost: 650,
  },

  // Talents
  CHI_BURST_TALENT_DAMAGE: {
    id: 148135,
    name: 'Chi Burst',
    icon: 'spell_arcane_arcanetorrent',
  },
  CHI_WAVE_TALENT_DAMAGE: {
    id: 132467,
    name: 'Chi Wave',
    icon: 'ability_monk_chiwave',
  },
  CHI_BURST_HEAL: {
    id: 130654,
    name: 'Chi Burst',
    icon: 'spell_arcane_arcanetorrent',
  },
  LIFECYCLES_VIVIFY_BUFF: {
    id: 197916,
    name: 'Lifecycles (Vivify)',
    icon: 'ability_monk_uplift',
  },
  LIFECYCLES_ENVELOPING_MIST_BUFF: {
    id: 197919,
    name: 'Lifecycles (Enveloping Mist)',
    icon: 'spell_monk_envelopingmist',
  },
  SPIRIT_OF_THE_CRANE_BUFF: {
    id: 210803,
    name: 'Spirit of the Crane',
    icon: 'monk_stance_redcrane',
  },
  SOOTHING_MIST_STATUE: {
    id: 198533,
    name: 'Soothing Mist',
    icon: 'ability_monk_soothingmists',
  },
  UNISON_HEAL: {
    id: 388480,
    name: 'Unison',
    icon: 'ability_monk_soothingmists',
  },
  REFRESHING_JADE_WIND_HEAL: {
    id: 162530,
    name: 'Refreshing Jade Wind',
    icon: 'ability_monk_rushingjadewind',
  },
  INVOKE_CHIJI_THE_RED_CRANE_BUFF: {
    id: 343820,
    name: 'Invoke Chi-Ji, the Red Crane',
    icon: 'monk_stance_redcrane',
  },
  GUST_OF_MISTS_CHIJI: {
    id: 343819,
    name: 'Gust of Mists',
    icon: 'monk_stance_redcrane',
  },
  RISING_MIST_HEAL: {
    id: 274912,
    name: 'Rising Mist',
    icon: 'ability_monk_effuse',
  },
  UPLIFTED_SPIRITS_HEAL: {
    id: 388555,
    name: 'Uplifted Spirits',
    icon: 'monk_stance_wiseserpent',
  },
  WHIRLING_DRAGON_PUNCH_TALENT_TICK: {
    id: 158221,
    name: 'Whirling Dragon Punch',
    icon: 'ability_monk_hurricanestrike',
  },
  YULONS_WHISPER_HEAL: {
    id: 388044,
    name: "Yu'lon's Whisper",
    icon: 'ability_monk_chiexplosion',
  },

  // Brewmaster
  NIUZAO_STOMP_DAMAGE: {
    id: 227291,
    name: 'Stomp',
    icon: 'ability_warstomp',
  },
  BLACKOUT_KICK_BRM: {
    id: 205523,
    name: 'Blackout Kick',
    icon: 'ability_monk_roundhousekick',
  },
  SPINNING_CRANE_KICK_BRM: {
    id: 322729,
    name: 'Spinning Crane Kick',
    icon: 'ability_monk_cranekick_new',
  },
  CELESTIAL_FORTUNE_HEAL: {
    id: 216521,
    name: 'Celestial Fortune',
    icon: 'inv_celestialserpentmount',
  },
  EYE_OF_THE_TIGER_HEAL: {
    id: 196608,
    name: 'Eye of the Tiger',
    icon: 'ability_druid_primalprecision',
  },
  PURIFIED_CHI: {
    id: 325092,
    name: 'Purified Chi',
    icon: 'inv_misc_beer_06',
  },
  BREATH_OF_FIRE_DEBUFF: {
    id: 123725,
    name: 'Breath of Fire',
    icon: 'ability_monk_breathoffire',
  },
  FORTIFYING_BREW_BRM: {
    id: 115203,
    name: 'Fortifying Brew',
    icon: 'ability_monk_fortifyingale_new',
  },
  FORTIFYING_BREW_BRM_BUFF: {
    id: 120954,
    name: 'Fortifying Brew',
    icon: 'ability_monk_fortifyingale_new',
  },
  SHUFFLE: {
    id: 215479,
    name: 'Shuffle',
    icon: 'ability_monk_shuffle',
  },
  STAGGER: {
    id: 115069,
    name: 'Stagger',
    icon: 'monk_stance_drunkenox',
  },
  STAGGER_TAKEN: {
    id: 124255,
    name: 'Stagger',
    icon: 'ability_rogue_cheatdeath',
  },
  LIGHT_STAGGER_DEBUFF: {
    id: 124275,
    name: 'Light Stagger',
    icon: 'priest_icon_chakra_green',
  },
  MODERATE_STAGGER_DEBUFF: {
    id: 124274,
    name: 'Moderate Stagger',
    icon: 'priest_icon_chakra',
  },
  HEAVY_STAGGER_DEBUFF: {
    id: 124273,
    name: 'Heavy Stagger',
    icon: 'priest_icon_chakra_red',
  },
  EXPEL_HARM_DAMAGE: {
    id: 115129,
    name: 'Expel Harm',
    icon: 'ability_monk_expelharm',
  },
  PROVOKE: {
    id: 115546,
    name: 'Provoke',
    icon: 'ability_monk_provoke',
  },
  HOT_BLOODED: {
    id: 227686,
    name: 'Hot Blooded',
    icon: 'ability_monk_breathoffire',
  },
  XUENS_BATTLEGEAR_2_PIECE_BUFF_BRM: {
    id: 242255,
    name: 'Monk T20 Brewmaster 2P Bonus',
    icon: 'spell_monk_brewmaster_spec',
  },
  XUENS_BATTLEGEAR_4_PIECE_BUFF_BRM: {
    id: 242256,
    name: 'Monk T20 Brewmaster 4P Bonus',
    icon: 'spell_monk_brewmaster_spec',
  },
  T19_2_PIECE_BUFF_BRM: {
    id: 211415,
    name: 'Monk T19 Brewmaster 2P Bonus',
    icon: 'spell_monk_brewmaster_spec',
  },
  GIFT_OF_THE_OX_1: {
    id: 124507,
    name: 'Gift of the Ox',
    icon: 'ability_monk_healthsphere',
  },
  GIFT_OF_THE_OX_2: {
    id: 178173,
    name: 'Gift of the Ox',
    icon: 'ability_monk_healthsphere',
  },
  GIFT_OF_THE_OX_3: {
    id: 214417,
    name: 'Gift of the Ox',
    icon: 'ability_monk_healthsphere',
  },
  GIFT_OF_THE_OX_4: {
    id: 124503,
    name: 'Gift of the Ox',
    icon: 'inv_misc_gem_pearl_13',
  },
  GIFT_OF_THE_OX_5: {
    id: 124506,
    name: 'Gift of the Ox',
    icon: 'inv_misc_gem_pearl_13',
  },
  GIFT_OF_THE_OX_6: {
    id: 214420,
    name: 'Gift of the Ox',
    icon: 'inv_misc_gem_pearl_13',
  },
  GIFT_OF_THE_OX_7: {
    id: 214418,
    name: 'Gift of the Ox',
    icon: 'inv_misc_gem_pearl_13',
  },
  GIFT_OF_THE_OX_8: {
    id: 214416,
    name: 'Gift of the Ox',
    icon: 'ability_monk_healthsphere',
  },
  BLACKOUT_COMBO_BUFF: {
    id: 228563,
    name: 'Blackout Combo',
    icon: 'ability_monk_blackoutkick',
  },
  POTENT_KICK: {
    id: 213047,
    name: 'Potent Kick',
    icon: 'ability_monk_ironskinbrew',
  },
  QUICK_SIP: {
    id: 238129,
    name: 'Quick Sip',
    icon: 'spell_misc_drink',
  },
  STAGGERING_AROUND: {
    id: 213055,
    name: 'Staggering Around',
    icon: 'ability_monk_fortifyingale_new',
  },
  MASTERY_ELUSIVE_BRAWLER: {
    id: 117906,
    name: 'Mastery: Elusive Brawler',
    icon: 'ability_monk_shuffle',
  },
  WANDERERS_HARDINESS_TRAIT: {
    id: 214920,
    name: "Wanderer's Hardiness",
    icon: 'inv_staff_2h_artifactmonkeyking_d_02',
  },
  ENDURANCE_OF_THE_BROKEN_TEMPLE_TRAIT: {
    id: 241131,
    name: 'Endurance of the Broken Temple',
    icon: 'misc_legionfall_monk',
  },
  BREW_STACHE: {
    id: 214373,
    name: 'Brew-Stache',
    icon: 'inv_misc_archaeology_vrykuldrinkinghorn',
  },
  HOT_TRUB: {
    id: 202126,
    name: 'Hot Trub',
    icon: 'spell_brew_dark',
  },
  // Conduits
  EVASIVE_STRIDE_HEAL: {
    id: 343764,
    name: 'Evasive Stride',
    icon: 'ability_monk_uplift',
  },

  // Windwalker Spells
  COMBO_STRIKES: {
    id: 115636,
    name: 'Mastery: Combo Strikes',
    icon: 'trade_alchemy_potionb3',
  },
  STORM_EARTH_AND_FIRE: {
    id: 231627,
    name: 'Storm, Earth, and Fire',
    icon: 'spell_nature_giftofthewild',
  },
  STORM_EARTH_AND_FIRE_CAST: {
    id: 137639,
    name: 'Storm, Earth, and Fire',
    icon: 'spell_nature_giftofthewild',
  },
  STORM_EARTH_AND_FIRE_FIXATE: {
    id: 221771,
    name: 'Storm, Earth, and Fire: Fixate',
    icon: 'spell_nature_giftofthewild',
  },
  STORM_EARTH_AND_FIRE_EARTH_SPIRIT: {
    id: 138121,
    name: 'Storm, Earth, and Fire',
    icon: 'inv_elemental_primal_earth',
  },
  STORM_EARTH_AND_FIRE_FIRE_SPIRIT: {
    id: 138123,
    name: 'Storm, Earth, and Fire',
    icon: 'inv_summerfest_firespirit',
  },
  FLYING_SERPENT_KICK: {
    id: 101545,
    name: 'Flying Serpent Kick',
    icon: 'ability_monk_flyingdragonkick',
  },
  COMBO_BREAKER: {
    id: 137384,
    name: 'Combo Breaker',
    icon: 'pandarenracial_bouncy',
  },
  COMBO_BREAKER_BUFF: {
    id: 116768,
    name: 'Blackout Kick!',
    icon: 'ability_monk_roundhousekick',
  },
  CYCLONE_STRIKES: {
    id: 220357,
    name: 'Cyclone Strikes',
    icon: 'ability_monk_cranekick_new',
  },
  FISTS_OF_FURY_CAST: {
    id: 113656,
    name: 'Fists of Fury',
    icon: 'monk_ability_fistoffury',
  },
  FISTS_OF_FURY_DAMAGE: {
    id: 117418,
    name: 'Fists of Fury',
    icon: 'monk_ability_fistoffury',
  },
  TOUCH_OF_KARMA_CAST: {
    id: 122470,
    name: 'Touch of Karma',
    icon: 'ability_monk_touchofkarma',
  },
  TOUCH_OF_KARMA_DAMAGE: {
    id: 124280,
    name: 'Touch of Karma',
    icon: 'ability_monk_touchofkarma',
  },
  FLYING_SERPENT_KICK_DAMAGE: {
    id: 123586,
    name: 'Flying Serpent Kick',
    icon: 'priest_icon_chakra_green',
  },
  RISING_SUN_KICK_DAMAGE: {
    id: 185099,
    name: 'Rising Sun Kick',
    icon: 'ability_monk_risingsunkick',
  },
  HIT_COMBO_BUFF: {
    id: 196741,
    name: 'Hit Combo',
    icon: 'ability_monk_palmstrike',
  },
  CHI_SPHERE: {
    id: 163272,
    name: 'Chi Sphere',
    icon: 'ability_monk_forcesphere',
  },
  MARK_OF_THE_CRANE: {
    id: 228287,
    name: 'Mark of the Crane',
    icon: 'ability_monk_cranekick_new',
  },
  FIST_OF_THE_WHITE_TIGER_SECOND: {
    id: 261977,
    name: 'Fist of the White Tiger',
    icon: 'ability_monk_jab',
  },
  FIST_OF_THE_WHITE_TIGER_ENERGIZE: {
    id: 261978,
    name: 'Fist of the White Tiger',
    icon: 'inv_fistofthewhitetiger',
  },
  CHI_BURST_ENERGIZE: {
    id: 261682,
    name: 'Chi Burst',
    icon: 'spell_arcane_arcanetorrent',
  },
  DISABLE: {
    id: 116095,
    name: 'Disable',
    icon: 'ability_shockwave',
  },
  WINDWALKING: {
    id: 166646,
    name: 'Windwalking',
    icon: 'monk_stance_whitetiger',
  },
  INVOKE_XUEN_THE_WHITE_TIGER: {
    id: 123904,
    name: 'Invoke Xuen, the White Tiger',
    icon: 'ability_monk_summontigerstatue',
  },
  XUEN_CRACKLING_TIGER_LIGHTNING: {
    id: 123996,
    name: 'Crackling Tiger Lightning',
    icon: 'ability_monk_cracklingjadelightning',
  },
  EMPOWERED_TIGER_LIGHTNING: {
    id: 335913,
    name: 'Empowered Tiger Lightning',
    icon: 'ability_monk_summontigerstatue',
  },
  DANCE_OF_CHI_JI_BUFF: {
    id: 325202,
    name: 'Dance of Chi-Ji',
    icon: 'ability_monk_quitornado',
  },
  // Tier 28, 2P Set-Bonus
  FISTS_OF_PRIMORDIUM: {
    id: 364418,
    name: 'Fists of Primordium',
    icon: 'monk_ability_fistoffury',
  },
  // Tier 28, 4p Set-Bonus
  PRIMORDIAL_POTENTIAL: {
    id: 363734,
    name: 'Primordial Potential',
    icon: 'inv_relics_totemofrage',
  },
  PRIMORDIAL_POTENTIAL_BUFF: {
    id: 363911,
    name: 'Primordial Potential',
    icon: 'spell_priest_divinestar',
  },
  PRIMORDIAL_POWER_BUFF: {
    id: 363924,
    name: 'Primordial Power',
    icon: 'inv_relics_totemofrage',
  },
});

export default spells;
