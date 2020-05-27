/**
 * All Monk abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

export default {
  // Shared
  MYSTIC_TOUCH: {
    id: 8647,
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
  PARALYSIS: {
    id: 115078,
    name: 'Paralysis',
    icon: 'ability_monk_paralysis',
  },
  RISING_SUN_KICK: {
    id: 107428,
    name: 'Rising Sun Kick',
    icon: 'ability_monk_risingsunkick',
    manaCost: 1500,
  },
  ROLL: {
    id: 109132,
    name: 'Roll',
    icon: 'ability_monk_roll',
  },
  SPEAR_HAND_STRIKE: {
    id: 116705,
    name: 'Spear Hand Strike',
    icon: 'ability_monk_spearhand',
  },
  SPINNING_CRANE_KICK: {
    id: 101546,
    name: 'Spinning Crane Kick',
    icon: 'ability_monk_cranekick_new',
    manaCost: 1000,
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
  TRANSCENDENCE: {
    id: 101643,
    name: 'Transcendence',
    icon: 'monk_ability_transcendence',
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

  // Mistweaver Monk Spells
  RISING_MIST_HEAL: {
    id: 274912,
    name: 'Rising Mist',
    icon: 'ability_monk_effuse',
  },
  ENVELOPING_MIST: {
    id: 124682,
    name: 'Enveloping Mist',
    icon: 'spell_monk_envelopingmist',
    manaCost: 5200,
  },
  ENVELOPING_MIST_TFT: {
    id: 274062,
    name: 'Enveloping Mist',
    icon: 'spell_monk_envelopingmist',
  },
  ESSENCE_FONT: {
    id: 191837,
    name: 'Essence Font',
    icon: 'ability_monk_essencefont',
    manaCost: 7200,
  },
  ESSENCE_FONT_BUFF: {
    id: 191840,
    name: 'Essence Font Buff',
    icon: 'ability_monk_essencefont',
  },
  LIFE_COCOON: {
    id: 116849,
    name: 'Life Cocoon',
    icon: 'ability_monk_chicocoon',
    manaCost: 2400,
  },
  RENEWING_MIST: {
    id: 115151,
    name: 'Renewing Mist',
    icon: 'ability_monk_renewingmists',
    manaCost: 2500,
  },
  RENEWING_MIST_HEAL: {
    id: 119611,
    name: 'Renewing Mist',
    icon: 'ability_monk_renewingmists',
  },
  REVIVAL: {
    id: 115310,
    name: 'Revival',
    icon: 'spell_monk_revival',
    manaCost: 4374,
  },
  THUNDER_FOCUS_TEA: {
    id: 116680,
    name: 'Thunder Focus Tea',
    icon: 'ability_monk_thunderfocustea',
  },
  VIVIFY: {
    id: 116670,
    name: 'Vivify',
    icon: 'ability_monk_vivify',
    manaCost: 3500,
  },
  SOOTHING_MIST: {
    id: 115175,
    name: 'Soothing Mist',
    icon: 'ability_monk_soothingmists',
    manaCost: 400,
  },
  SOOTHING_MIST_STATUE: {
    id: 198533,
    name: 'Soothing Mist',
    icon: 'ability_monk_soothingmists',
  },
  SPIRIT_OF_THE_CRANE_BUFF: {
    id: 210803,
    name: 'Spirit of the Crane',
    icon: 'monk_stance_redcrane',
    manaRet: 0.0065,
  },
  CHI_BURST_HEAL: {
    id: 130654,
    name: 'Chi Burst',
    icon: 'spell_arcane_arcanetorrent',
  },
  REFRESHING_JADE_WIND_HEAL: {
    id: 162530,
    name: 'Refreshing Jade Wind',
    icon: 'ability_monk_rushingjadewind',
  },
  // Ch-Ji Heal
  CRANE_HEAL: {
    id: 198756,
    name: 'Crane Heal',
    icon: 'inv_pet_cranegod',
  },
  // Lifecycles buffs
  LIFECYCLES_VIVIFY_BUFF: {
    id: 197916,
    name: 'Lifecycles (Vivify)',
    icon: 'ability_monk_uplift',
    manaPercRed: 0.25,
  },
  LIFECYCLES_ENVELOPING_MIST_BUFF: {
    id: 197919,
    name: 'Lifecycles (Enveloping Mist)',
    icon: 'spell_monk_envelopingmist',
    manaPercRed: 0.25,
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
    buffDur: 12000,
    manaRet: 0.0065,
  },
  BLACKOUT_KICK_TOTM : {//blackoutkick from totm
    id: 228649,
    name: 'Blackout Kick',
    icon: 'ability_monk_roundhousekick',
  },
  WAY_OF_THE_CRANE: {
    id: 216113,
    name: 'Way of the Crane',
    icon: 'monk_stance_redcrane',
  },

  // Utility / Other
  DETOX: {
    id: 115450,
    name: 'Detox',
    icon: 'ability_rogue_imrovedrecuperate',
    manaCost: 1300,
  },
  FORTIFYING_BREW: {
    id: 243435,
    name: 'Fortifying Brew',
    icon: 'ability_monk_fortifyingelixir',
  },

  // Mistweaver Azerite Traits
  OVERFLOWING_MISTS_HEAL: {
    id: 273354,
    name: 'Overflowing Mists',
    icon: 'spell_monk_envelopingmist',
  },
  BURST_OF_LIFE_HEAL: {
  id: 278564,
  name: 'Burst of Life',
  icon: 'ability_monk_chicocoon',
  },

  // Brewmaster
  BLACKOUT_STRIKE: {
    id: 205523,
    name: 'Blackout Strike',
    icon: 'ability_monk_blackoutstrike',
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
  KEG_SMASH: {
    id: 121253,
    name: 'Keg Smash',
    icon: 'achievement_brewery_2',
  },
  IRONSKIN_BREW: {
    id: 115308,
    name: 'Ironskin Brew',
    icon: 'ability_monk_ironskinbrew',
  },
  IRONSKIN_BREW_BUFF: {
    id: 215479,
    name: 'Ironskin Brew',
    icon: 'ability_monk_ironskinbrew',
  },
  PURIFYING_BREW: {
    id: 119582,
    name: 'Purifying Brew',
    icon: 'inv_misc_beer_06',
  },
  BREATH_OF_FIRE: {
    id: 115181,
    name: 'Breath of Fire',
    icon: 'ability_monk_breathoffire',
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
  RUSHING_JADE_WIND: {
    id: 148187,
    name: 'Rushing Jade Wind',
    icon: 'ability_monk_rushingjadewind',
  },
  EXPEL_HARM: {
    id: 115072,
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
  ZEN_MEDITATION: {
    id: 115176,
    name: 'Zen Meditation',
    icon: 'ability_monk_zenmeditation',
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
    icon: "inv_staff_2h_artifactmonkeyking_d_02",
  },
  ENDURANCE_OF_THE_BROKEN_TEMPLE_TRAIT: {
    id: 241131,
    name: "Endurance of the Broken Temple",
    icon: "misc_legionfall_monk",
  },
  BREW_STACHE: {
    id: 214373,
    name: "Brew-Stache",
    icon: "inv_misc_archaeology_vrykuldrinkinghorn",
  },
  HOT_TRUB: {
    id: 202126,
    name: "Hot Trub",
    icon: "spell_brew_dark",
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
  TOUCH_OF_DEATH: {
    id: 115080,
    name: 'Touch of Death',
    icon: 'ability_monk_touchofdeath',
  },
  TOUCH_OF_DEATH_DAMAGE: {
    id: 229980,
    name: 'Touch of Death',
    icon: 'ability_monk_touchofdeath',
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
  RISING_SUN_KICK_SECOND: {
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
  REVERSE_HARM: {
    id: 287771,
    name: 'Reverse Harm',
    icon: 'ability_monk_expelharm',
  },
  REVERSE_HARM_DAMAGE: {
    id: 290461,
    name: 'Reverse Harm',
    icon: 'ability_monk_expelharm',
  },
  WINDWALKING: {
    id: 166646,
    name: 'Windwalking',
    icon: 'monk_stance_whitetiger',
  },
};
