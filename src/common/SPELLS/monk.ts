/**
 * All Monk abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */
import Spell from 'common/SPELLS/Spell';
import talents from 'common/TALENTS/monk';

const spells = {
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
    manaCost: 25000,
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
    manaCost: 35000,
  },
  SAVE_THEM_ALL_BUFF: {
    id: 390105,
    name: 'Save Them All',
    icon: 'inv_weapon_hand_22',
  },
  BONEDUST_BREW_DAMAGE: {
    id: 325217,
    name: 'Bonedust Brew',
    icon: 'ability_maldraxxus_monk',
  },
  BONEDUST_BREW_HEAL: {
    id: 325218,
    name: 'Bonedust Brew',
    icon: 'ability_maldraxxus_monk',
  },
  HEALING_WINDS_HEAL: {
    id: 450559,
    name: 'Healing Winds',
    icon: 'ability_monk_pathofmists',
  },
  CELESTIAL_CONDUIT_DAMAGE: {
    id: 443038,
    name: 'Celestial Conduit',
    icon: 'inv_ability_conduitofthecelestialsmonk_celestialconduit',
  },
  CELESTIAL_CONDUIT_HEAL: {
    id: 443039,
    name: 'Celestial Conduit',
    icon: 'inv_ability_conduitofthecelestialsmonk_celestialconduit',
  },
  COURAGE_OF_THE_WHITE_TIGER_HEAL: {
    id: 443106,
    name: 'Courage of the White Tiger',
    icon: 'ability_monk_summontigerstatue',
  },
  COURAGE_OF_THE_WHITE_TIGER_DAMAGE: {
    id: 457917,
    name: 'Courage of the White Tiger',
    icon: 'ability_monk_summontigerstatue',
  },
  COURAGE_OF_THE_WHITE_TIGER_BUFF: {
    id: 460127,
    name: 'Courage of the White Tiger',
    icon: 'ability_monk_summontigerstatue',
  },
  STRENGTH_OF_THE_BLACK_OX_BUFF: {
    id: 443112,
    name: 'Strength of the Black Ox',
    icon: 'ability_monk_chargingoxwave',
  },
  STRENGTH_OF_THE_BLACK_OX_SHIELD: {
    id: 443113,
    name: 'Strength of the Black Ox',
    icon: 'ability_monk_chargingoxwave',
  },
  NIUZAOS_PROTECTION_SHIELD: {
    id: 442749,
    name: "Niuzao's Protection",
    icon: 'ability_monk_chargingoxwave',
  },
  FLIGHT_OF_THE_RED_CRANE_HEAL: {
    id: 443272,
    name: 'Flight of the Red Crane',
    icon: 'inv_pet_cranegod',
  },
  FLIGHT_OF_THE_RED_CRANE_UNITY: {
    id: 443614,
    name: 'Flight of the Red Crane',
    icon: 'inv_pet_cranegod',
  },
  HEART_OF_THE_JADE_SERPENT_STACK_WW: {
    id: 443424,
    name: 'Heart of the Jade Serpent',
    icon: 'ability_monk_chiswirl',
  },
  HEART_OF_THE_JADE_SERPENT_STACK_MW: {
    id: 443506,
    name: 'Heart of the Jade Serpent',
    icon: 'ability_monk_chiswirl',
  },
  HEART_OF_THE_JADE_SERPENT_UNITY: {
    id: 443616,
    name: 'Heart of the Jade Serpent',
    icon: 'ability_monk_summonserpentstatue',
  },
  HEART_OF_THE_JADE_SERPENT_BUFF: {
    id: 443421,
    name: 'Heart of the Jade Serpent',
    icon: 'ability_monk_summonserpentstatue',
  },
  UNITY_WITHIN_CAST: {
    id: 443591,
    name: 'Unity WIthin',
    icon: 'ability_monk_prideofthetiger',
  },
  // Mistweaver Monk Spells
  ENVELOPING_MIST_TFT: {
    id: 274062,
    name: 'Enveloping Mist',
    icon: 'spell_monk_envelopingmist',
  },
  SECRET_INFUSION_CRIT_BUFF: {
    id: 388498,
    name: 'Secret infusion',
    icon: 'ability_monk_chibrew',
  },
  SECRET_INFUSION_HASTE_BUFF: {
    id: 388497,
    name: 'Secret infusion',
    icon: 'ability_monk_chibrew',
  },
  SECRET_INFUSION_MASTERY_BUFF: {
    id: 388499,
    name: 'Secret infusion',
    icon: 'ability_monk_chibrew',
  },
  SECRET_INFUSION_VERS_BUFF: {
    id: 388500,
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
    manaCost: 75000,
  },
  VIVIFICATION_BUFF: {
    id: 392883,
    name: 'Vivifacious Vivification',
    icon: 'ability_monk_vivify',
  },
  MENDING_PROLIFERATION_BUFF: {
    id: 388510,
    name: 'Mending Proliferation',
    icon: 'inv_shoulder_inv_leather_raidmonk_s_01',
  },
  AT_BUFF: {
    id: 388026,
    name: 'Ancient Teachings',
    icon: 'inv_misc_book_07',
  },
  AT_HEAL: {
    id: 388024,
    name: 'Ancient Teachings',
    icon: 'inv_jewelcrafting_jadeserpent',
  },
  AT_CRIT_HEAL: {
    id: 388025,
    name: 'Ancient Teachings',
    icon: 'inv_jewelcrafting_jadeserpent',
  },
  INVOKERS_DELIGHT_BUFF: {
    id: 388663,
    name: "Invoker's Delight",
    icon: 'inv_inscription_80_warscroll_battleshout',
  },
  FURY_OF_XUEN_BUFF: {
    id: 396168,
    name: 'Fury of Xuen',
    icon: 'ability_monk_prideofthetiger',
  },
  FURY_OF_XUEN_STACK_BUFF: {
    id: 396167,
    name: 'Fury of Xuen',
    icon: 'ability_monk_prideofthetiger',
  },
  ENVELOPING_BREATH_HEAL: {
    id: 325209,
    name: 'Enveloping Breath',
    icon: 'ability_monk_jadeserpentbreath',
  },
  MANA_TEA_STACK: {
    id: 115867,
    name: 'Mana Tea',
    icon: 'inv_misc_herb_jadetealeaf',
  },
  MANA_TEA_CAST: {
    id: 115294,
    name: 'Mana Tea',
    icon: 'monk_ability_cherrymanatea',
  },
  MANA_TEA_BUFF: {
    id: 197908,
    name: 'Mana Tea',
    icon: 'monk_ability_cherrymanatea',
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
  CLAW_OF_THE_WHITE_TIGER: {
    id: 389541,
    name: 'Claw of the White Tiger',
    icon: 'ability_monk_summonwhitetigerstatue',
  },

  // Utility / Other
  DETOX: {
    id: 115450,
    name: 'Detox',
    icon: 'ability_rogue_imrovedrecuperate',
    manaCost: 32500,
  },

  // Talents
  BURST_OF_LIFE_HEAL: {
    id: 399230,
    name: 'Burst of Life',
    icon: 'ability_monk_counteractmagic',
  },
  CHI_BURST_TALENT_DAMAGE: {
    id: 148135,
    name: 'Chi Burst',
    icon: 'spell_arcane_arcanetorrent',
  },
  CHI_WAVE_TALENT_HEAL: {
    id: 132463,
    name: 'Chi Wave',
    icon: 'ability_monk_chiwave',
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
  CHI_BURST_PROC: {
    id: 460490,
    name: 'Chi Burst',
    icon: 'spell_arcane_arcanetorrent',
  },
  FLURRY_STRIKES_DAMAGE: {
    id: 450615,
    name: 'Flurry Strikes',
    icon: 'inv-ability-shadopanmonk-flurrystrikes',
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
  SHEILUN_CLOUD_BUFF: {
    id: 399510,
    name: "Sheilun's Gift",
    icon: 'inv_staff_2h_artifactshaohao_d_01',
  },
  LESSON_OF_DOUBT_BUFF: {
    id: 400097,
    name: 'Lesson of Doubt',
    icon: 'sha_ability_warrior_bloodnova',
  },
  LESSON_OF_DOUBT_NEXT_BUFF: {
    id: 405808,
    name: 'Lesson of Doubt',
    icon: 'sha_ability_warrior_bloodnova',
  },
  LESSON_OF_DESPAIR_BUFF: {
    id: 400100,
    name: 'Lesson of Despair',
    icon: 'sha_ability_rogue_envelopingshadows',
  },
  LESSON_OF_DESPAIR_NEXT_BUFF: {
    id: 405810,
    name: 'Lesson of Despair',
    icon: 'sha_ability_rogue_envelopingshadows',
  },
  LESSON_OF_FEAR_BUFF: {
    id: 400103,
    name: 'Lesson of Fear',
    icon: 'sha_ability_rogue_bloodyeye_nightborne',
  },
  LESSON_OF_FEAR_NEXT_BUFF: {
    id: 405809,
    name: 'Lesson of Fear',
    icon: 'sha_ability_rogue_bloodyeye_nightborne',
  },
  LESSON_OF_ANGER_BUFF: {
    id: 400106,
    name: 'Lesson of Anger',
    icon: 'sha_ability_rogue_envelopingshadows_nightmare',
  },
  LESSON_OF_ANGER_NEXT_BUFF: {
    id: 405807,
    name: 'Lesson of Anger',
    icon: 'sha_ability_rogue_envelopingshadows_nightmare',
  },
  LESSON_OF_ANGER_DAMAGE: {
    id: 400145,
    name: 'Lesson of Anger',
    icon: 'sha_ability_rogue_envelopingshadows_nightmare',
  },
  LESSON_OF_ANGER_HEAL: {
    id: 400146,
    name: 'Lesson of Anger',
    icon: 'sha_ability_rogue_envelopingshadows_nightmare',
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
  REFRESHING_JADE_WIND_BUFF: {
    id: 196725,
    name: 'Refreshing Jade Wind',
    icon: 'ability_monk_rushingjadewind',
  },
  INVOKE_CHIJI_THE_RED_CRANE_BUFF: {
    id: 343820,
    name: 'Invoke Chi-Ji, the Red Crane',
    icon: 'monk_stance_redcrane',
  },
  INVOKE_YULON_BUFF: {
    id: 322118,
    name: "Invoke Yu'lon, the Jade Serpent",
    icon: 'ability_monk_dragonkick',
  },
  CHI_COCOON_HEAL_CHIIJI: {
    id: 406220,
    name: 'Chi Cocoon',
    icon: 'inv_pet_crane',
  },
  CHI_COCOON_HEAL_YULON: {
    id: 406139,
    name: 'Chi Cocoon',
    icon: 'ability_monk_chiexplosion',
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
  WHIRLING_DRAGON_PUNCH_DAMAGE: {
    id: 158221,
    name: 'Whirling Dragon Punch',
    icon: 'ability_monk_hurricanestrike',
  },
  WHIRLING_DRAGON_PUNCH_USABLE: {
    id: 196742,
    name: 'Whirling Dragon Punch',
    icon: 'ability_monk_hurricanestrike',
  },
  YULONS_WHISPER_HEAL: {
    id: 388044,
    name: "Yu'lon's Whisper",
    icon: 'ability_monk_chiexplosion',
  },
  ZEN_PULSE_HEAL: {
    id: 198487,
    name: 'Zen Pulse',
    icon: 'ability_monk_forcesphere',
  },
  ZEN_PULSE_BUFF: {
    id: 446334,
    name: 'Zen Pulse',
    icon: 'ability_monk_forcesphere',
  },
  JADEFIRE_STOMP_HEAL: {
    id: 388207,
    name: 'Faeline Stomp',
    icon: 'ability_ardenweald_monk',
  },
  FAELINE_STOMP_PULSE_DAMAGE: {
    id: 327264,
    name: 'Faeline Stomp',
    icon: 'ability_ardenweald_monk',
  },
  FAELINE_STOMP_RESET: {
    id: 388203,
    name: 'Faeline Stomp',
    icon: 'ability_ardenweald_monk',
  },
  NOURISHING_CHI_BUFF: {
    id: 387766,
    name: 'Nourishing Chi',
    icon: 'inv_misc_gem_pearl_06',
  },
  CALMING_COALESCENCE_BUFF: {
    id: 388220,
    name: 'Calming Coalescence',
    icon: 'ability_monk_healthsphere',
  },
  ESCAPE_FROM_REALITY_CAST: {
    id: 343539,
    name: 'Escape from Reality',
    icon: 'inv_enchant_essencecosmicgreater',
  },
  OVERFLOWING_MISTS_HEAL: {
    id: 388513,
    name: 'Overflowing Mists',
    icon: 'inv_legion_faction_dreamweavers',
  },
  //Invigorating Mist Heal
  INVIGORATING_MISTS_HEAL: {
    id: 425804,
    name: 'Invigorating Mists',
    icon: 'ability_monk_vivify',
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
  CTA_INVOKE_NIUZAO_BUFF: {
    id: 358520,
    name: 'Invoke Niuzao, the Black Ox',
    icon: 'spell_monk_brewmaster_spec',
  },
  WEAPONS_OF_ORDER_BUFF_AND_HEAL: {
    id: 387184,
    name: 'Weapons of Order',
    icon: 'ability_bastion_monk',
  },
  // Conduits
  EVASIVE_STRIDE_HEAL: {
    id: 343764,
    name: 'Evasive Stride',
    icon: 'ability_monk_uplift',
  },
  COUNTERSTRIKE_BUFF: {
    id: 383800,
    name: 'Counterstrike',
    icon: 'ability_monk_palmstrike',
  },
  CHI_SURGE_DEBUFF: {
    id: 393786,
    name: 'Chi Surge',
    icon: 'ability_monk_chiexplosion',
  },
  CHARRED_PASSIONS_BUFF: {
    id: 386963,
    name: 'Charred Passions',
    icon: 'ability_monk_mightyoxkick',
  },
  // Tier 29 2-set bonus
  BREWMASTERS_RHYTHM_BUFF: {
    id: 394797,
    name: "Brewmaster's Rhythm",
    icon: 'ability_monk_standingkick',
  },
  PRESS_THE_ADVANTAGE_BUFF: {
    ...talents.PRESS_THE_ADVANTAGE_TALENT,
    id: 418361,
  },
  PRESS_THE_ADVANTAGE_DMG: {
    ...talents.PRESS_THE_ADVANTAGE_TALENT,
    id: 418360,
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
  JADE_IGNITION_BUFF: {
    id: 393057,
    name: 'Chi Energy',
    icon: 'ability_monk_chiexplosion',
  },
  JADE_IGNITION_DAMAGE: {
    id: 393056,
    name: 'Chi Explosion',
    icon: 'ability_monk_chiexplosion',
  },
  LAST_EMPERORS_CAPACITOR_BUFF: {
    id: 393039,
    name: "Last Emperor's Capacitor",
    icon: 'ability_monk_cracklingjadelightning',
  },
  PRESSURE_POINT_BUFF: {
    id: 393053,
    name: 'Pressure Point',
    icon: 'monk_stance_whitetiger',
  },
  FAELINE_HARMONY_DEBUFF: {
    id: 395414,
    name: 'Fae Exposure',
    icon: 'ability_ardenweald_monk',
  },
  FAELINE_HARMONY_BUFF: {
    id: 395413,
    name: 'Fae Exposure',
    icon: 'ability_ardenweald_monk',
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
  // Tier 31, 2P
  BLACKOUT_REINFORCEMENT: {
    id: 424454,
    name: 'Blackout Reinforcement',
    icon: 'inv_boots_cloth_19',
  },
  // TWW S1 Brewmaster 4-set
  FLOW_OF_BATTLE_KS_BUFF: {
    id: 457271,
    name: 'Flow of Battle',
    icon: 'ability_monk_energizingwine.jpg',
  },
  ASPECT_OF_HARMONY_DOT: {
    id: 450763,
    name: 'Aspect of Harmony',
    icon: 'inv-enchant-essencenethersmall',
  },
  ASPECT_OF_HARMONY_HOT: {
    id: 450769,
    name: 'Aspect of Harmony',
    icon: 'inv_enchanting_wod_essence2',
  },
  ASPECT_OF_HARMONY_BUFF: {
    id: 450711,
    name: 'Aspect of Harmony',
    icon: 'ability_evoker_essenceburst3',
  },
} satisfies Record<string, Spell>;

export default spells;
