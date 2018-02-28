/**
 * All Monk abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

export default {
  // Shared 
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
  EFFUSE: {
    id: 116694,
    name: 'Effuse',
    icon: 'ability_monk_effuse',
    manaPerc: 0.02,
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
    manaPerc: 0.015,
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
    manaPerc: 0.01,
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
    name: 'Trancendance',
    icon: 'monk_ability_transcendence',
  },
  TRANSCENDENCE_TRANSFER: {
    id: 119996,
    name: 'Trancendance: Transfer',
    icon: 'spell_shaman_spectraltransformation',
  },
  // Mistweaver Monk Spells
  ENVELOPING_MISTS: {
    id: 124682,
    name: 'Enveloping Mists',
    icon: 'spell_monk_envelopingmist',
    manaPerc: 0.052,
  },
  ESSENCE_FONT: {
    id: 191837,
    name: 'Essence Font',
    icon: 'ability_monk_essencefont',
    manaPerc: 0.072,
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
    manaPerc: 0.024,
  },
  RENEWING_MIST: {
    id: 115151,
    name: 'Renewing Mist',
    icon: 'ability_monk_renewingmists',
    manaPerc: 0.03,
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
    manaPerc: 0.04375,
  },
  SHEILUNS_GIFT: {
    id: 205406,
    name: 'Sheilun\'s Gift',
    icon: 'inv_staff_2h_artifactshaohao_d_01',
  },
  SHEILUNS_GIFT_BUFF: {
    id: 214502,
    name: 'Sheilun\'s Gift',
    icon: 'inv_staff_2h_artifactshaohao_d_01',
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
    manaPerc: 0.045,
  },
  SOOTHING_MIST: {
    id: 115175,
    name: 'Soothing Mist',
    icon: 'ability_monk_soothingmists',
  },
  SOOTHING_MIST_CAST: {
    id: 198533,
    name: 'Soothing Mist',
    icon: 'ability_monk_soothingmists',
  },
  UPLIFTING_TRANCE_BUFF: {
    id: 197206,
    name: 'Uplifting Trance',
    icon: 'ability_monk_vivify',
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
    manaPercRed: 0.2,
  },
  LIFECYCLES_ENVELOPING_MIST_BUFF: {
    id: 197919,
    name: 'Lifecycles (Enveloping Mist)',
    icon: 'spell_monk_envelopingmist',
    manaPercRed: 0.2,
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

  // Utility / Other
  DETOX: {
    id: 115450,
    name: 'Detox',
    icon: 'ability_rogue_imrovedrecuperate',
    manaPerc: 0.026,
  },
  FORTIFYING_BREW: {
    id: 243435,
    name: 'Fortifying Brew',
    icon: 'ability_monk_fortifyingelixir',
  },
  // Talents:
  REFRESHING_JADE_WIND_TALENT: {
    id: 196725,
    name: 'Refreshing Jade Wind',
    icon: 'ability_monk_rushingjadewind',
    manaPerc: 0.035,
  },

  // Traits:
  // Mistweaver Monk
  DANCING_MISTS: {
    id: 199573,
    name: 'Dancing Mists',
    icon: 'ability_monk_souldance',
  },
  TENDRILS_OF_REVIVAL: {
    id: 238058,
    name: 'Tendrils of Revival',
    icon: 'spell_monk_revival',
  },
  WHISPERS_OF_SHAOHAO: {
    id: 242400,
    name: 'Whispers of Shaohao',
    icon: 'inv_cloudserpent_egg_green',
  },
  WHISPERS_OF_SHAOHAO_TRAIT: {
    id: 238130,
    name: 'Whispers of Shaohao',
    icon: 'inv_cloudserpent_egg_green',
  },
  MISTS_OF_SHEILUN: {
    id: 199894,
    name: 'The Mists of Sheilun',
    icon: 'ability_monk_chiexplosion',
  },
  MISTS_OF_SHEILUN_TRAIT: {
    id: 199887,
    name: 'The Mists of Sheilun',
    icon: 'ability_monk_chibrew',
  },
  MISTS_OF_SHEILUN_BUFF: {
    id: 199888,
    name: 'The Mists of Sheilun',
    icon: 'ability_monk_chibrew',
  },
  CELESTIAL_BREATH: {
    id: 199656,
    name: 'Celestial Breath',
    icon: 'ability_monk_chiexplosion',
  },
  CELESTIAL_BREATH_BUFF: {
    id: 199641,
    name: 'Celestial Breath',
    icon: 'ability_monk_chiexplosion',
  },
  CELESTIAL_BREATH_TRAIT: {
    id: 199640,
    name: 'Celestial Breath',
    icon: 'ability_monk_dragonkick',
  },
  BLESSINGS_OF_YULON: {
    id: 199668,
    name: 'Blessings of Yu\'lon',
    icon: 'ability_monk_summonserpentstatue',
  },
  EFFUSIVE_MISTS: {
    id: 238094,
    name: 'Effusive Mists',
    icon: 'ability_monk_effuse',
  },
  SPIRIT_TETHER: {
    id: 199387,
    name: 'Spirit Tether',
    icon: 'monk_ability_transcendence',
  },
  COALESCING_MISTS: {
    id: 199364,
    name: 'Coalescing Mists',
    icon: 'ability_monk_effuse',
  },
  SOOTHING_REMEDIES: {
    id: 199377,
    name: 'Soothing Remedies',
    icon: 'ability_monk_soothingmists',
  },
  ESSENCE_OF_THE_MIST: {
    id: 199485,
    name: 'Essence of the Mist',
    icon: 'ability_monk_essencefont',
  },
  WAY_OF_THE_MISTWEAVER: {
    id: 199366,
    name: 'Way of the Mistweaver',
    icon: 'spell_monk_envelopingmist',
  },
  INFUSION_OF_LIFE: {
    id: 199380,
    name: 'Infusion of Life',
    icon: 'ability_monk_vivify',
  },
  EXTENDED_HEALING: {
    id: 199372,
    name: 'Extended Healing',
    icon: 'ability_monk_renewingmists',
  },
  PROTECTION_OF_SHAOHAO: {
    id: 199367,
    name: 'Protection of Shaohao',
    icon: 'ability_monk_chicocoon',
  },

  // Legendary Effects
  SHELTER_OF_RIN_HEAL: {
    id: 235750,
    name: 'Shelter of Rin',
    icon: 'ability_monk_chiwave',
  },
  DOORWAY_TO_NOWHERE_SUMMON: {
    id: 248293,
    name: 'Doorway to Nowhere',
    icon: 'inv_pet_cranegod',
  },
  OVYDS_WINTER_WRAP_BUFF: {
    id: 217642,
    name: 'Ovyd\'s Winter Wrap',
    icon: 'ability_monk_souldance',
  },

  // Tier Set Bonus's
  XUENS_BATTLEGEAR_4_PIECE_BUFF: {
    id: 242258,
    name: 'Monk T20 Mistweaver 4P Bonus',
    icon: 'spell_monk_mistweaver_spec',
  },
  DANCE_OF_MISTS: {
    id: 247891,
    name: 'Dance of Mists',
    icon: 'ability_monk_effuse',
  },
  XUENS_BATTLEGEAR_2_PIECE_BUFF: {
    id: 242257,
    name: 'Monk T20 Mistweaver 2P Bonus',
    icon: 'spell_monk_mistweaver_spec',
  },
  SURGE_OF_MISTS: {
    id: 246328,
    name: 'Surge of Mists',
    icon: 'spell_monk_mistweaver_spec',
  },
  CHIJIS_BATTLEGEAR_2_PIECE_BUFF: {
    id: 251825,
    name: 'Monk T21 Mistweaver 2P Bonus',
    icon: 'ability_monk_surgingmist',
  },
  CHIJIS_BATTLEGEAR_4_PIECE_BUFF: {
    id: 251826,
    name: 'Monk T21 Mistweaver 4P Bonus',
    icon: 'ability_monk_effuse',
  },
  CHI_BOLT: {
    id: 253581,
    name: 'Chi Bolt',
    icon: 'ability_monk_effuse',
  },
  TRANQUIL_MIST: {
    id: 253448,
    name: 'Tranquil Mist',
    icon: 'ability_monk_surgingmist',
  },

  // Brewmaster
  BLACKOUT_STRIKE: {
    id: 205523,
    name: 'Blackout Strike',
    icon: 'ability_monk_blackoutstrike',
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
  EXPLODING_KEG: {
    id: 214326,
    name: 'Exploding Keg',
    icon: 'inv_staff_2h_artifactmonkeyking_d_02',
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
  // Windwalker Artifact
  STRIKE_OF_THE_WINDLORD: {
    id: 205320,
    name: 'Strike of the Windlord',
    icon: 'inv_hand_1h_artifactskywall_d_01',
  },
  // Windwalker Articfact Traits
  CROSSWINDS: {
    id: 196061,
    name: 'Crosswinds',
    icon: 'inv_pandarenserpentgodmount_black',
  },
  SPLIT_PERSONALITY: {
    id: 238059,
    name: 'Split Personality',
    icon: 'spell_nature_giftofthewild',
  },
  STRENGTH_OF_XUEN: {
    id: 195267,
    name: 'Strength of Xuen',
    icon: 'ability_monk_summontigerstatue'
  },
  INNER_PEACE: {
    id: 195243,
    name: 'Inner Peace',
    icon: 'ability_monk_jasminforcetea',
  },
  GALE_BURST: {
    id: 195399,
    name: 'Gale Burst',
    icon: 'ability_monk_palmstrike',
  },
  GALE_BURST_DAMAGE: {
    id: 195403,
    name: 'Gale Burst',
    icon: 'ability_monk_palmstrike',
  },
  MARK_OF_THE_CRANE: {
    id: 228287,
    name: 'Mark of the Crane',
    icon: 'ability_monk_cranekick_new',
  },
  // Windwalker Talents
  POWER_STRIKES: {
    id: 121283,
    name: 'Power Strikes',
    icon: 'ability_monk_powerstrikes',
  },
  CHI_ORBIT_DAMAGE: {
    id: 196748,
    name: 'Chi Orbit',
    icon: 'ability_monk_forcesphere',
  },
  // Windwalker legendaries
  KATSUOS_ECLIPSE: {
    id: 208045,
    name: "Katsuo's Eclipse",
    icon: 'ability_monk_fistoffury',
  },
  THE_WIND_BLOWS: {
    id: 248101,
    name: 'The Wind Blows',
    icon: 'inv_hand_1h_artifactskywall_d_01',
  },
  THE_EMPERORS_CAPACITOR_STACK: {
    id: 235054,
    name: "The Emperor's Capacitor",
    icon: 'ability_monk_cracklingjadeligthing',
  },
  DRINKING_HORN_COVER: {
    id: 209256,
    name: 'Drinking Horn Cover',
    icon: 'spell_nature_giftofthewild',
  },
  HIDDEN_MASTERS_FORBIDDEN_TOUCH: {
    id: 213112,
    name: "Hidden Master's Forbidden Touch",
    icon: 'ability_monk_touchofdeath',
  },
  CENEDRIL_REFLECTOR_OF_HATRED: {
    id: 208842,
    name: 'Cenedril, Reflector of Hatred',
    icon: 'ability_monk_touchofkarma',
  },
  // Windwalker Tiersets
  WW_TIER19_2PC: {
    id: 211427,
    name: 'Windwalker T19 2PC',
    icon: 'ability_monk_risingsunkick',
  },
  WW_TIER20_2PC: {
    id: 242260,
    name: 'Windwalker T20 2PC',
    icon: 'ability_monk_fistoffury',
  },
  WW_TIER20_4PC: {
    id: 242259,
    name: 'Windwalker T20 4PC',
    icon: 'ability_monk_risingsunkick',
  },
  PRESSURE_POINT: {
    id: 247255,
    name: 'Pressure Point',
    icon: 'spell_monk_windwalker_spec',
  },
  WW_TIER21_4PC: {
    id: 251821,
    name: 'Windwalker T21 4PC',
    icon: 'ability_monk_roundhousekick',
  },
  WW_TIER21_2PC: {
    id: 251823,
    name: 'Windwalker T21 2PC',
    icon: 'ability_monk_roundhousekick',
  },
  // this is the chi gain from T21 2pc
  FOCUS_OF_XUEN: {
    id: 252768,
    name: 'Focus of Xuen',
    icon: 'ability_monk_roundhousekick',
  },
};
