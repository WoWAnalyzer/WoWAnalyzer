/**
 * All Monk abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

export default {
  // Mistweaver Monk Spells
  EFFUSE: {
    id: 116694,
    name: 'Effuse',
    icon: 'ability_monk_effuse',
    manaPerc: 0.02,
  },
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
  RISING_SUN_KICK: {
    id: 107428,
    name: 'Rising Sun Kick',
    icon: 'ability_monk_risingsunkick',
    manaPerc: 0.015,
  },
  SPINNING_CRANE_KICK: {
    id: 101546,
    name: 'Spinning Crane Kick',
    icon: 'ability-monk-cranekick-new',
    manaPerc: 0.01,
  },
  TIGER_PALM: {
    id: 100780,
    name: 'Tiger Palm',
    icon: 'ability_monk_tigerpalm',
  },
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
  ROLL: {
    id: 109132,
    name: 'Roll',
    icon: 'ability_monk_roll',
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
  PARALYSIS: {
    id: 115078,
    name: 'Paralysis',
    icon: 'ability_monk_paralysis',
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

  //Windwalker

  CHI_ORBIT: {
    id: 196743,
    name: 'Chi Orbit',
    icon: 'ability_monk_forcesphere',
  },
  SERENITY: {
    id: 152173,
    name: 'Serenity',
    icon: 'ability_monk_serenity',
  },
  WHIRLING_DRAGON_PUNCH: {
    id: 152175,
    name: 'Whirling Dragon Punch',
    icon: 'ability_monk_hurricanestrike',
  },
  HIT_COMBO: {
    id: 196740, 
    name: 'Hit Combo',
    icon: 'ability_monk_palmstrike',
  },
  COMBO_STRIKES: {
    id: 115636,
    name: 'Mastery: Combo Strikes',
    icon: 'trade_alchemy_potionb3',
  },
  STORM_EARTH_AND_FIRE: {
    id: 137639,
    name: 'Storm, Earth, and Fire',
    icon: 'spell_nature_giftofthewild',
  },
  TOUCH_OF_KARMA: {
    id: 122470,
    name: 'Touch of Karma',
    icon: 'ability_monk_touchofkarma',
  },
  FLYING_SERPENT_KICK: {
    id: 101545,
    name: 'Flying Serpent Kick',
    icon: 'ability_monk_flyingdragonkick',
  },
  TOUCH_OF_DEATH: {
    id: 115080,
    name: 'Touch of Death',
    icon: 'ability_monk_touchofdeath',
  },
  FISTS_OF_FURY: {
    id: 113656,
    name: 'Fists of Fury',
    icon: 'monk_ability_fistoffury',
  },

  //WW Artifact & Traits

  STRIKE_OF_THE_WINDLORD: {
    id: 205320,
    name: 'Strike of the Windlord',
    icon: 'inv_hand_1h_artifactskywall_d_01',
  },
  GALE_BURST: {
    id: 195399,
    name: 'Gale Burst',
    icon: 'ability_monk_palmstrike',
  },
  CROSSWINDS: {
    id: 195650,
    name: 'Crosswinds',
    icon: 'ability_monk_cranekick',
  },
  THUNDERFIST: {
    id: 238131,
    name: 'Thunderfist',
    icon: 'inv_hand_1h_artifactskywall_d_01',
  },
  CONCORDANCE_OF_THE_LEGIONFALL: {
    id: 239042,
    name: 'Concordance of the Legionfall',
    icon: 'trade_archaeology_shark-jaws',
  },

  //TODO: Artifact Traits

  //Items and shiz

  CENEDRIL_REFLECTOR_OF_HATRED: {
    id: 208842,
    name: 'Cenedril, Reflector of Hatred',
    icon: 'inv_cape_pandaria_b_02',
  },
  DRINKING_HORN_COVER: {
    id: 209256,
    name: 'Drinking Horn Cover',
    icon: 'inv_bracer_26',
  },
  THE_EMPERORS_CAPACITOR: {
    id: 235053,
    name: 'The Emperor\'s capacitor',
    icon: 'inv_chest_leather_raidrogue_l_01',
  },
  KATSUOS_ECLIPSE: {
    id: 208045,
    name: 'Katsuo\'s Eclipse',
    icon: 'inv_boots_cloth_33v4',
  },
  THE_WIND_BLOWS: {
    id: 248101,
    name: 'The Wind Blows',
    icon: 'inv_helmet_leather_raidmonk_l_01',
  },
  MONK_T19_WINDWALKER_2P_BONUS: {
    id: 211427,
    name: 'Tier 19 Windwalker 2 Piece Bonus',
    icon: 'monk_stance_whitetiger',
  },
  MONK_T20_WINDWALKER_4P_BONUS: {
    id: 211430,
    name: 'Windwalker Tier 19 4 Piece Bonus',
    icon: 'monk_stance_whitetiger',
  },
  MONK_T20_WINDWALKER_2P_BONUS: {
    id: 242259,
    name: 'Windwalker Tier 19 2 Piece',
    icon: 'monk_stance_whitetiger',
  },
  MONK_T20_WINDWALKER_4P_BONUS: {
    id: 242259,
    name: 'Windwalker Tier 19 4 Piece',
    icon: 'monk_stance_whitetiger',
  },
};
