/**
 * All Hunter abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

export default {
  // Beast Mastery:
  ASPECT_OF_THE_WILD: {
    id: 193530,
    name: 'Aspect of the Wild',
    icon: 'spell_nature_protectionformnature',
  },
  BESTIAL_WRATH: {
    id: 19574,
    name: 'Bestial Wrath',
    icon: 'ability_druid_ferociousbite',
  },
  BESTIAL_WRATH_BUFF_HATI: {
    id: 207033,
    name: 'Bestial Wrath Buff',
    icon: 'ability_druid_ferociousbite',
  },
  BESTIAL_WRATH_BUFF_MAIN_PET: {
    id: 186254,
    name: 'Bestial Wrath Buff',
    icon: 'ability_druid_ferociousbite',
  },
  DIRE_BEAST_SUMMON: {
    id: 224573,
    name: 'Dire Beast Summon',
    icon: 'ability_hunter_sickem',
  },
  DIRE_BEAST_SUMMON_2: {
    id: 219199,
    name: 'Dire Beast Summon',
    icon: 'ability_hunter_bestialdiscipline',
  },
  DIRE_BEAST_SUMMON_3: {
    id: 255283,
    name: 'Dire Beast Summon',
    icon: 'ability_hunter_sickem',
  },
  DIRE_BEAST_SUMMON_4: {
    id: 212386,
    name: 'Dire Beast Summon',
    icon: 'ability_hunter_bestialdiscipline',
  },
  DIRE_BEAST_SUMMON_5: {
    id: 212382,
    name: 'Dire Beast Summon',
    icon: 'ability_hunter_bestialdiscipline',
  },
  DIRE_BEAST_SUMMON_6: {
    id: 212389,
    name: 'Dire Beast Summon',
    icon: 'ability_hunter_bestialdiscipline',
  },
  DIRE_BEAST_SUMMON_7: {
    id: 212381,
    name: 'Dire Beast Summon',
    icon: 'ability_hunter_bestialdiscipline',
  },
  DIRE_BEAST_SUMMON_8: {
    id: 212388,
    name: 'Dire Beast Summon',
    icon: 'ability_hunter_bestialdiscipline',
  },
  COBRA_SHOT: {
    id: 193455,
    name: 'Cobra Shot',
    icon: 'ability_hunter_cobrashot',
  },
  DIRE_BEAST: {
    id: 120679,
    name: 'Dire Beast',
    icon: 'ability_hunter_longevity',
  },
  DIRE_BEAST_BUFF: {
    id: 120694,
    name: 'Dire Beast',
    icon: 'ability_hunter_longevity',
  },
  DIRE_FRENZY_TALENT_BUFF: {
    id: 246152,
    name: 'Dire Frenzy Buff',
    icon: 'ability_druid_mangle',
  },
  EAGLE_EYE: {
    id: 6197,
    name: 'Eagle Eye',
    icon: 'ability_hunter_eagleeye',
  },
  KILL_COMMAND: {
    id: 34026,
    name: 'Kill Command',
    icon: 'ability_hunter_killcommand',
  },
  KILL_COMMAND_PET: {
    id: 83381,
    name: 'Kill Command',
    icon: 'ability_hunter_killcommand',
  },
  WILD_CALL: {
    id: 185789,
    name: 'Wild Call',
    icon: 'ability_hunter_masterscall',
  },
  WILD_CALL_PROC: {
    id: 185791,
    name: 'Wild Call Proc',
    icon: 'ability_hunter_masterscall',
  },

  //Beast Mastery Artifact Traits
  TITANS_THUNDER: {
    id: 207068,
    name: 'Titan\'s Thunder',
    icon: 'inv_firearm_2h_artifactlegion_d_01',
  },
  TITANS_THUNDER_BUFF: {
    id: 207094,
    name: 'Titans Thunder Buff',
    icon: 'inv_firearm_2h_artifactlegion_d_01',
  },
  BEAST_CLEAVE_BUFF: {
    id: 118455,
    name: 'Beast Cleave',
    icon: 'ability_hunter_sickem',
  },
  COBRA_COMMANDER_TRAIT: {
    id: 238123,
    name: 'Cobra Commander',
    icon: 'inv_waepon_bow_zulgrub_d_01',
  },
  COBRA_COMMANDER: {
    id: 243042,
    name: 'Cobra Commander',
    icon: 'inv_waepon_bow_zulgrub_d_01',
  },
  DEATHSTRIKE_VENOM: {
    id: 243121,
    name: 'Deathstrike Venom',
    icon: 'spell_nature_nullifypoison',
  },

  //Beast Mastery Tier
  HUNTER_BM_T19_2P_BONUS: {
    id: 211181, //WoWHead has this as 4p, but it's actually the 2p
    name: 'T19 2 set bonus',
    icon: 'trade_engineering',
  },
  HUNTER_BM_T19_2P_BONUS_BUFF: {
    id: 211183,
    name: 'T19 2 set bonus',
    icon: 'ability_druid_ferociousbite',
  },
  HUNTER_BM_T19_4P_BONUS: {
    id: 211172,
    name: 'T19 2 set bonus',
    icon: 'trade_engineering',
  },
  HUNTER_BM_T20_2P_BONUS: {
    id: 242239,
    name: 'T20 2 set bonus',
    icon: 'ability_hunter_bestialdiscipline',
  },
  HUNTER_BM_T20_2P_BONUS_BUFF: {
    id: 246126,
    name: 'T20 2 set bonus',
    icon: 'ability_hunter_bestialdiscipline',
  },
  HUNTER_BM_T20_4P_BONUS: {
    id: 242240,
    name: 'T20 4 set bonus',
    icon: 'ability_hunter_bestialdiscipline',
  },
  HUNTER_BM_T20_4P_BONUS_BUFF: {
    id: 246116,
    name: 'T20 4 set bonus',
    icon: 'ability_hunter_fervor',
  },
  HUNTER_BM_T21_2P_BONUS: {
    id: 251755,
    name: 'T21 2 set bonus',
    icon: 'ability_hunter_killcommand',
  },
  HUNTER_BM_T21_4P_BONUS: {
    id: 251756,
    name: 'T21 4 set bonus',
    icon: 'spell_nature_protectionformnature',
  },

  // MarksmanshipHunter:
  // Marksmanship spells

  WINDBURST: {
    id: 204147,
    name: 'Windburst',
    icon: 'inv_bow_1h_artifactwindrunner_d_02',
  },
  WINDBURST_MOVEMENT_SPEED: {
    id: 204477,
    name: 'Windburst',
    icon: 'ability_hunter_focusedaim',
  },
  AIMED_SHOT: {
    id: 19434,
    name: 'Aimed Shot', //TODO: T204p cost reduction (46 focus instead of 50)
    icon: 'inv_spear_07',
  },
  ARCANE_SHOT: {
    id: 185358,
    name: 'Arcane Shot',
    icon: 'ability_impalingbolt',
  },
  MARKED_SHOT: {
    id: 185901,
    name: 'Marked Shot',
    icon: 'ability_hunter_markedshot',
  },
  TRUESHOT: {
    id: 193526,
    name: 'Trueshot',
    icon: 'ability_trueshot',
  },
  BURSTING_SHOT: {
    id: 224729,
    name: 'Bursting Shot',
    icon: 'ability_hunter_burstingshot',
  },
  VULNERABLE: {
    id: 187131,
    name: 'Vulnerable',
    icon: 'ability_hunter_mastermarksman',
  },
  ARCANE_TORRENT_FOCUS: {
    id: 80483,
    name: 'Arcane Torrent',
    icon: 'spell_shadow_teleport',
  },
  MARKING_TARGETS: {
    id: 223138,
    name: 'Marking Targets',
    icon: 'ability_marksmanship',
  },

  //CATEGORY
  AUTO_SHOT: {
    id: 75,
    name: 'Auto Shot',
    icon: 'ability_whirlwind',
  },
  CRITICAL_FOCUS_FOCUSMODULE: {
    id: 215107,
    name: 'Critical Focus',
    icon: 'ability_druid_replenish',
  },
  MULTISHOT_FOCUSMODULE: {
    id: 213363,
    name: 'Multi-Shot',
    icon: 'ability_upgrademoonglaive',
  },
  ARCANE_SHOT_FOCUSMODULE: {
    id: 187675,
    name: 'Arcane Shot',
    icon: 'ability_impalingbolt',
  },

  // Marksmanship tier sets
  HUNTER_MM_T19_2P_BONUS: {
    id: 211331,
    name: 'T19 2 set bonus',
    icon: 'trade_engineering',
  },
  HUNTER_MM_T20_2P_BONUS: {
    id: 242242,
    name: 'T20 2 set bonus',
    icon: 'ability_hunter_focusedaim',
  },
  HUNTER_MM_T20_2P_BONUS_BUFF: {
    id: 242243,
    name: 'T20 2 set bonus',
    icon: 'inv_misc_ammo_arrow_03',
  },
  HUNTER_MM_T20_4P_BONUS: {
    id: 242241,
    name: 'T20 4 set bonus',
    icon: 'ability_hunter_focusedaim',
  },
  HUNTER_MM_T20_4P_BONUS_BUFF: {
    id: 246153,
    name: 'T20 4 set bonus',
    icon: 'inv_spear_07',
  },
  HUNTER_MM_T21_2P_BONUS: {
    id: 251754,
    name: 'T21 2 set bonus',
    icon: 'ability_hunter_focusedaim',
  },
  HUNTER_MM_T21_4P_BONUS: {
    id: 251753,
    name: 'T21 4 set bonus',
    icon: 'ability_hunter_focusedaim',
  },

  // Marksmanship artifact traits
  BULLSEYE_TRAIT: {
    id: 204090,
    name: 'Bullseye',
    icon: 'ability_hunter_focusedaim',
  },
  QUICK_SHOT_TRAIT: {
    id: 190462,
    name: 'Quick Shot',
    icon: 'ability_trueshot',
  },
  CYCLONIC_BURST_TRAIT: {
    id: 238124,
    name: 'Cyclonic burst',
    icon: 'inv_bow_1h_artifactwindrunner_d_02',
  },
  CYCLONIC_BURST_IMPACT_TRAIT: {
    id: 242712,
    name: 'Cyclonic Burst',
    icon: 'inv_bow_1h_artifactwindrunner_d_02',
  },
  UNERRING_ARROWS_TRAIT: {
    id: 238052,
    name: 'Unerring Arrows',
    icon: 'creatureportrait_blackrockv2_shieldgong_broken',
  },

  //Marksmanship legendary buffs
  SENTINELS_SIGHT: {
    id: 208913,
    name: 'Sentinel\'s sight',
    icon: 'inv_belt_66green',
  },
  GYROSCOPIC_STABILIZATION: {
    id: 235712,
    name: 'Gyroscopic stabilization',
    icon: 'inv_glove_mail_raidshamanmythic_o_01',
  },

  //Talent buffs/debuffs
  LOCK_AND_LOAD_BUFF: {
    id: 194594,
    name: 'Lock and Load',
    icon: 'ability_hunter_lockandload',
  },
  TRUE_AIM_DEBUFF: {
    id: 199803,
    name: 'True Aim',
    icon: 'spell_hunter_focusingshot',
  },
  EXPLOSIVE_SHOT_SHOT: {
    id: 212680,
    name: 'Explosive Shot',
    icon: '6bf_explosive_shard',
  },
  TRICK_SHOT_BUFF: {
    id: 227272,
    name: 'Trick Shot',
    icon: 'ability_hunter_runningshot',
  },
  // Survival:
  // ...

  // Shared:
  // ...
  NETHERWINDS: {
    id: 160452,
    name: 'Netherwinds',
    icon: 'spell_arcane_massdispel',
  },
  ANCIENT_HYSTERIA: {
    id: 90355,
    name: 'Ancient Hysteria',
    icon: 'spell_shadow_unholyfrenzy',
  },
  //The buff given by volley when it's activated (and also what does the damage)
  VOLLEY_ACTIVATED: {
    id: 194392,
    name: 'Volley buff',
    icon: 'ability_marksmanship',
  },
  FLARE: {
    id: 1543,
    name: 'Flare',
    icon: 'spell_fire_flare',
  },
  FEIGN_DEATH: {
    id: 5384,
    name: 'Feign Death',
    icon: 'ability_rogue_feigndeath',
  },
  PLAY_DEAD: {
    id: 209997,
    name: 'Play Dead',
    icon: 'inv_misc_pelt_bear_03',
  },
  WAKE_UP: {
    id: 210000,
    name: 'Wake Up',
    icon: 'warrior_disruptingshout',
  },
  REVIVE_PET_AND_MEND_PET: {
    id: 982,
    name: 'Revive Pet',
    icon: 'ability_hunter_beastsoothe',
  },
  EXHILARATION: {
    id: 109304,
    name: 'Exhilaration',
    icon: 'ability_hunter_onewithnature',
  },
  ASPECT_OF_THE_CHEETAH: {
    id: 186257,
    name: 'Aspect of the Cheetah',
    icon: 'ability_mount_jungletiger',
  },
  ASPECT_OF_THE_TURTLE: {
    id: 186265,
    name: 'Aspect of the Turtle',
    icon: 'ability_hunter_pet_turtle',
  },
  /*  DISENGAGE: {
      id: 781,
      name: 'Disengage',
      icon: 'ability_rogue_feint',
    },*/
  FREEZING_TRAP: {
    id: 187650,
    name: 'Freezing Trap',
    icon: 'spell_frost_chainsofice',
  },
  TAR_TRAP: {
    id: 187698,
    name: 'Tar Trap',
    icon: 'spell_yorsahj_bloodboil_black',
  },
  A_MURDER_OF_CROWS_SPELL: {
    id: 131900,
    name: 'A Murder of Crows',
    icon: 'ability_hunter_murderofcrows',
  },
  CALL_PET_1: {
    id: 883,
    name: 'Call Pet 1',
    icon: 'ability_hunter_beastcall',
  },
  CALL_PET_2: {
    id: 83242,
    name: 'Call Pet 2',
    icon: 'ability_hunter_beastcall',
  },
  CALL_PET_3: {
    id: 83243,
    name: 'Call Pet 3',
    icon: 'ability_hunter_beastcall',
  },
  CALL_PET_4: {
    id: 83244,
    name: 'Call Pet 4',
    icon: 'ability_hunter_beastcall',
  },
  CALL_PET_5: {
    id: 83245,
    name: 'Call Pet 5',
    icon: 'ability_hunter_beastcall',
  },
  CONCUSSIVE_SHOT: {
    id: 27634,
    name: 'Concussive Shot',
    icon: 'spell_frost_stun',
  },
  COUNTER_SHOT: {
    id: 147362,
    name: 'Counter Shot',
    icon: 'inv_ammo_arrow_03',
  },
  MISDIRECTION: {
    id: 34477,
    name: 'Misdrection',
    icon: 'ability_hunter_misdirection',
  },
  MULTISHOT: {
    id: 2643,
    name: 'Multi-Shot',
    icon: 'ability_upgrademoonglaive',
  },
  DISMISS_PET: {
    id: 2641,
    name: 'Dismiss Pet',
    icon: 'spell_nature_spiritwolf',
  },
  BINDING_SHOT_STUN: {
    id: 117526,
    name: 'Binding Shot Stun',
    icon: 'spell_shaman_bindelemental',
  },
  BINDING_SHOT_TETHER: {
    id: 117405,
    name: 'Binding Shot Tether',
    icon: 'spell_shaman_bindelemental',
  },
};
