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
  DIRE_FRENZY_TALENT_BUFF_1: {
    id: 246152,
    name: 'Dire Frenzy',
    icon: 'ability_druid_mangle',
  },
  DIRE_FRENZY_TALENT_BUFF_2: {
    id: 246851,
    name: 'Dire Frenzy',
    icon: 'ability_druid_mangle',
  },
  DIRE_FRENZY_TALENT_BUFF_3: {
    id: 246852,
    name: 'Dire Frenzy',
    icon: 'ability_druid_mangle',
  },
  DIRE_FRENZY_TALENT_BUFF_4: {
    id: 246853,
    name: 'Dire Frenzy',
    icon: 'ability_druid_mangle',
  },
  DIRE_FRENZY_TALENT_BUFF_5: {
    id: 246854,
    name: 'Dire Frenzy',
    icon: 'ability_druid_mangle',
  },
  DIRE_FRENZY_DAMAGE: {
    id: 217207,
    name: 'Dire Frenzy',
    icon: 'ability_druid_mangle',
  },
  STAMPEDE_DAMAGE: {
    id: 201594,
    name: 'Stampede',
    icon: 'ability_hunter_bestialdiscipline',
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
  BEAST_CLEAVE: {
    id: 115939,
    name: 'Beast Cleave',
    icon: 'ability_hunter_sickem',
  },
  BEAST_CLEAVE_BUFF: {
    id: 118455,
    name: 'Beast Cleave',
    icon: 'ability_hunter_sickem',
  },
  BEAST_CLEAVE_DAMAGE: {
    id: 118459,
    name: 'Beast Cleave',
    icon: 'ability_hunter_sickem',
  },
  STOMP_DAMAGE: {
    id: 201754,
    name: 'Stomp',
    icon: 'ability_warstomp',
  },
  ASPECT_OF_THE_BEAST_BESTIAL_FEROCITY: {
    id: 191413,
    name: 'Bestial Ferocity',
    icon: 'ability_hunter_invigeration',
  },
  CHIMAERA_SHOT_NATURE_DAMAGE: {
    id: 171457,
    name: 'Chimaera Shot',
    icon: 'ability_hunter_chimerashot2',
  },
  CHIMAERA_SHOT_FROST_DAMAGE: {
    id: 171454,
    name: 'Chimaera Shot',
    icon: 'ability_hunter_chimerashot2',
  },
  //Beast Mastery Artifact Traits
  TITANS_THUNDER: {
    id: 207068,
    name: 'Titan\'s Thunder',
    icon: 'inv_firearm_2h_artifactlegion_d_01',
  },
  TITANS_THUNDER_BUFF: {
    id: 207094,
    name: 'Titan\'s Thunder Buff',
    icon: 'inv_firearm_2h_artifactlegion_d_01',
  },
  TITANS_THUNDER_DAMAGE: {
    id: 207097,
    name: 'Titan\'s Thunder',
    icon: 'inv_firearm_2h_artifactlegion_d_01',
  },
  TITANS_THUNDER_DIRE_FRENZY_PET_BUFF: {
    id: 218638,
    name: 'Titan\'s Thunder',
    icon: 'ability_hunter_longevity',
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
  MASTER_OF_BEASTS_TRAIT: {
    id: 197248,
    name: 'Master of Beasts',
    icon: 'ability_hunter_masterscall',
  },
  SURGE_OF_THE_STORMGOD_TRAIT: {
    id: 197354,
    name: 'Surge of the Stormgod',
    icon: 'ability_monk_forcesphere',
  },
  SURGE_OF_THE_STORMGOD_DAMAGE: {
    id: 197465,
    name: 'Surge of the Stormgod',
    icon: 'ability_monk_forcesphere',
  },
  THUNDERSLASH_TRAIT: {
    id: 238087,
    name: 'Thunderslash',
    icon: 'warrior_talent_icon_thunderstruck',
  },
  THUNDERSLASH_DAMAGE: {
    id: 243234,
    name: 'Thunderslash',
    icon: 'warrior_talent_icon_thunderstruck',
  },
  DEATHSTRIKE_VENOM: {
    id: 243121,
    name: 'Deathstrike Venom',
    icon: 'spell_nature_nullifypoison',
  },
  PATHFINDER_TRAIT: {
    id: 197343,
    name: 'Pathfinder',
    icon: 'ability_mount_jungletiger',
  },
  SPIRIT_BOND_HEAL: {
    id: 197205,
    name: 'Spirit Bond',
    icon: 'ability_mount_jungletiger',
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
  //Beast Mastery Legendary buffs
  PARSELS_TONGUE_BUFF: {
    id: 248085,
    name: 'Parsel\'s Tongue',
    icon: 'ability_hunter_cobrashot',
  },
  THE_MANTLE_OF_COMMAND_BUFF: {
    id: 247993,
    name: 'The Mantle of Command',
    icon: 'inv_shoulder_mail_raidshaman_m_01',
  },

  //------------------------------------------------------------

  // Marksmanship Hunter:
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
    name: 'Aimed Shot',
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
  MARKED_SHOT_DAMAGE: {
    id: 212621,
    name: 'Marked Shot',
    icon: 'ability_hunter_markedshot',
  },
  HUNTERS_MARK: {
    id: 185987,
    name: 'Hunter\'s Mark',
    icon: 'ability_hunter_markedfordeath',
  },
  TRUESHOT: {
    id: 193526,
    name: 'Trueshot',
    icon: 'ability_trueshot',
  },
  BURSTING_SHOT: {
    id: 186387,
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
  SIDEWINDERS_DAMAGE: {
    id: 214581,
    name: 'Sidewinders',
    icon: 'ability_hunter_serpentswiftness',
  },
  SIDEWINDERS_CAST: {
    id: 240711,
    name: 'Sidewinders',
    icon: 'ability_hunter_serpentswiftness',
  },
  CAREFUL_AIM_DAMAGE: {
    id: 63468,
    name: 'Careful Aim',
    icon: 'ability_hunter_piercingshots',
  },
  BOMBARDMENT: {
    id: 82921,
    name: 'Bombardment',
    icon: 'ability_hunter_focusfire',
  },
  HUNTERS_MARK_DEBUFF: {
    id: 185365,
    name: 'Hunter\'s Mark',
    icon: 'ability_hunter_markedfordeath',
  },
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
  BULLSEYE_BUFF: {
    id: 204090,
    name: 'Bullseye',
    icon: 'ability_hunter_focusedaim',
  },
  BULLSEYE_TRAIT: {
    id: 204089,
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
  CALL_OF_THE_HUNTER_TRAIT: {
    id: 191048,
    name: 'Call of the Hunter',
    icon: 'ability_hunter_assassinate',
  },
  CALL_OF_THE_HUNTER_DAMAGE: {
    id: 191070,
    name: 'Call of the Hunter',
    icon: 'ability_hunter_assassinate',
  },
  LEGACY_OF_THE_WINDRUNNERS_TRAIT: {
    id: 190852,
    name: 'Legacy of the Windrunners',
    icon: 'artifactability_marksmanhunter_legacyofthewindrunners',
  },
  LEGACY_OF_THE_WINDRUNNERS_DAMAGE: {
    id: 191043,
    name: 'Legacy of the Windrunners',
    icon: 'artifactability_marksmanhunter_legacyofthewindrunners',
  },
  RAPID_KILLING_TRAIT: {
    id: 191339,
    name: 'Rapid Killing',
    icon: 'ability_marksmanship',
  },
  RAPID_KILLING: {
    id: 191342,
    name: 'Rapid Killing',
    icon: 'ability_hunter_assassinate',
  },
  SURVIVAL_OF_THE_FITTEST_BUFF: {
    id: 190515,
    name: 'Survival of the Fittest',
    icon: 'ability_rogue_feint',
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
  CELERITY_OF_THE_WINDRUNNERS_BUFF: {
    id: 248088,
    name: 'Celerity of the Windrunners',
    icon: 'inv_bow_1h_artifactwindrunner_d_02',
  },

  //Marksmanship talent buffs/debuffs
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
  EXPLOSIVE_SHOT_DETONATION: {
    id: 212680,
    name: 'Explosive Shot',
    icon: '6bf_explosive_shard',
  },
  TRICK_SHOT_BUFF: {
    id: 227272,
    name: 'Trick Shot',
    icon: 'ability_hunter_runningshot',
  },
  POSTHASTE_BUFF: {
    id: 118922,
    name: 'Posthaste',
    icon: 'ability_hunter_posthaste',
  },
  SENTINEL_TICK: {
    id: 236348,
    name: 'Sentinel',
    icon: 'spell_nature_sentinal',
  },

  //---------------------------------------------------------------

  //Survival:
  MONGOOSE_BITE: {
    id: 190928,
    name: 'Mongoose Bite',
    icon: 'ability_hunter_mongoosebite',
  },
  RAPTOR_STRIKE: {
    id: 186270,
    name: 'Raptor Strike',
    icon: 'ability_hunter_raptorstrike',
  },
  EXPLOSIVE_TRAP_DAMAGE: {
    id: 13812,
    name: 'Explosive Trap',
    icon: 'spell_fire_selfdestruct',
  },
  EXPLOSIVE_TRAP_CAST: {
    id: 191433,
    name: 'Explosive Trap',
    icon: 'spell_fire_selfdestruct',
  },
  MONGOOSE_FURY: {
    id: 190931,
    name: 'Mongoose Fury',
    icon: 'ability_hunter_mongoosebite',
  },
  LACERATE: {
    id: 185855,
    name: 'Lacerate',
    icon: 'ability_hunter_laceration',
  },
  CARVE: {
    id: 187708,
    name: 'Carve',
    icon: 'ability_hunter_carve',
  },
  CALTROPS_DAMAGE: {
    id: 194279,
    name: 'Caltrops',
    icon: 'ability_ironmaidens_incindiarydevice',
  },
  ASPECT_OF_THE_EAGLE: {
    id: 186289,
    name: 'Aspect of the Eagle',
    icon: 'spell_hunter_aspectoftheironhawk',
  },
  FLANKING_STRIKE: {
    id: 202800,
    name: 'Flanking Strike',
    icon: 'ability_hunter_invigeration',
  },
  HATCHET_TOSS: {
    id: 193265,
    name: 'Hatchet Toss',
    icon: 'ability_hunter_hatchettoss',
  },
  HARPOON: {
    id: 190925,
    name: 'Harpoon',
    icon: 'ability_hunter_harpoon',
  },
  MUZZLE: {
    id: 187707,
    name: 'Muzzle',
    icon: 'ability_hunter_negate',
  },
  WING_CLIP: {
    id: 195645,
    name: 'Wing Clip',
    icon: 'ability_rogue_trip',
  },
  //Survival talent buff/debuffs:
  MOKNATHAL_TACTICS: {
    id: 201081,
    name: 'Mok\'Nathal Tactics',
    icon: 'achievement_character_orc_male_brn',
  },
  SERPENT_STING_DEBUFF: {
    id: 118253,
    name: 'Serpent Sting',
    icon: 'ability_hunter_serpentswiftness',
  },
  //Survival traits:
  ECHOES_OF_OHNARA_TRAIT: {
    id: 238125,
    name: 'Echoes of Ohn\'ara',
    icon: 'ability_hunter_invigeration',
  },
  ECHOES_OF_OHNARA_DAMAGE: {
    id: 242798,
    name: 'Echoes of Ohn\'ara',
    icon: 'ability_hunter_eagleeye',
  },
  ON_THE_TRAIL_DAMAGE: {
    id: 204081,
    name: 'On The Trail',
    icon: 'artifactability_survivalhunter_eaglesbite',
  },
  FURY_OF_THE_EAGLE_TRAIT: {
    id: 203415,
    name: 'Fury of the Eagle',
    icon: 'inv_polearm_2h_artifacteagle_d_01',
  },
  FURY_OF_THE_EAGLE_DAMAGE: {
    id: 203413,
    name: 'Fury of the Eagle',
    icon: 'inv_polearm_2h_artifacteagle_d_01',
  },
  TALON_STRIKE_TRAIT: {
    id: 203563,
    name: 'Talon Strike',
    icon: 'inv_misc_bone_06',
  },
  TALON_STRIKE_DAMAGE: {
    id: 203525,
    name: 'Talon Strike',
    icon: 'inv_misc_bone_06',
  },
  HUNTERS_GUILE_TRAIT: {
    id: 203752,
    name: 'Hunter\'s Guile',
    icon: 'ability_mage_potentspirit',
  },
  ASPECT_OF_THE_SKYLORD_BUFF: {
    id: 203927,
    name: 'Aspect of the Skylord',
    icon: 'inv_pet_undeadeagle',
  },
  BIRD_OF_PREY_HEAL: {
    id: 224765,
    name: 'Bird of Prey',
    icon: 'ability_hunter_eagleeye',
  },
  EMBRACE_OF_THE_ASPECTS: {
    id: 225092,
    name: 'Embrace of the Aspects',
    icon: 'spell_hunter_aspectofthehawk',
  },
  JAWS_OF_THE_MONGOOSE: {
    id: 238053,
    name: 'Jaws of the Mongoose',
    icon: 'ability_hunter_mongoosebite',
  },
  //Survival tier and their buffs
  HUNTER_SV_T20_2P_BONUS: {
    id: 242244,
    name: 'T20 2 set bonus',
    icon: 'ability_hunter_camouflage',
  },
  HUNTER_SV_T20_4P_BONUS: {
    id: 242245,
    name: 'T20 4 set bonus',
    icon: 'ability_hunter_camouflage',
  },
  HUNTER_SV_T21_2P_BONUS: {
    id: 251751,
    name: 'T21 2 set bonus',
    icon: 'ability_rogue_findweakness',
  },
  HUNTER_SV_T21_2P_BONUS_BUFF: {
    id: 252094,
    name: 'Exposed Flank',
    icon: 'ability_rogue_findweakness',
  },
  HUNTER_SV_T21_4P_BONUS: {
    id: 251752,
    name: 'T21 4 set bonus',
    icon: 'ability_hunter_combatexperience',
  },
  HUNTER_SV_T21_4P_BONUS_BUFF: {
    id: 252095,
    name: 'In for the Kill',
    icon: 'ability_hunter_combatexperience',
  },
  //Survival legendaries
  NESINGWARYS_TRAPPING_TREADS_FOCUS_GAIN: {
    id: 212575,
    name: 'Nesingwary\'s Trapping Treads',
    icon: 'inv_boots_mail_panda_b_02',
  },

  //------------------------------------------------------------

  // Shared:
  THE_SHADOW_HUNTERS_VOODOO_MASK_HEAL: {
    id: 208888,
    name: 'The Shadow Hunter\'s Voodoo Mask',
    icon: 'ability_creature_cursed_04',
  },
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
  BARRAGE_DAMAGE: {
    id: 120361,
    name: 'Barrage',
    icon: 'ability_hunter_rapidregeneration',
  },
  FETCH: {
    id: 125050,
    name: 'Fetch',
    icon: 'inv_misc_bone_01',
  },

};
