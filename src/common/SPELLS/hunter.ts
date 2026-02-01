/**
 * All Hunter abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */
import Spell from 'common/SPELLS/Spell';

const spells = {
  MULTI_SHOT: {
    id: 2643,
    name: 'Multi-Shot',
    icon: 'ability_upgrademoonglaive',
    focusCost: 40,
  },
  //region Beast Mastery
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
  DIRE_BEAST_BUFF: {
    id: 281036,
    name: 'Dire Beast',
    icon: 'ability_hunter_longevity',
  },
  DIRE_BEAST_SUMMON: {
    id: 304051,
    name: 'Dire Beast',
    icon: 'ability_hunter_sickem',
  },
  DIRE_BEAST_GLYPHED: {
    id: 219199,
    name: 'Dire Beast',
    icon: 'ability_hunter_sickem',
  },
  DIRE_PACK_BUFF: {
    id: 378747,
    name: 'Dire Pack',
    icon: 'ability_hunter_sickem',
  },
  BEAST_CLEAVE_BUFF: {
    id: 268877,
    name: 'Beast Cleave',
    icon: 'ability_hunter_sickem',
  },
  BEAST_CLEAVE_PET_BUFF: {
    id: 118455,
    name: 'Beast Cleave',
    icon: 'ability_hunter_sickem',
  },
  BESTIAL_WRATH_BUFF_MAIN_PET: {
    id: 186254,
    name: 'Bestial Wrath Buff',
    icon: 'ability_druid_ferociousbite',
  },
  BARBED_SHOT_BUFF: {
    id: 246152,
    name: 'Barbed Shot (1)',
    icon: 'ability_hunter_barbedshot',
  },
  BARBED_SHOT_BUFF_2: {
    id: 246851,
    name: 'Barbed Shot (2)',
    icon: 'ability_hunter_barbedshot',
  },
  BARBED_SHOT_BUFF_3: {
    id: 246852,
    name: 'Barbed Shot (3)',
    icon: 'ability_hunter_barbedshot',
  },
  BARBED_SHOT_BUFF_4: {
    id: 246853,
    name: 'Barbed Shot (4)',
    icon: 'ability_hunter_barbedshot',
  },
  BARBED_SHOT_BUFF_5: {
    id: 246854,
    name: 'Barbed Shot (5)',
    icon: 'ability_hunter_barbedshot',
  },
  BARBED_SHOT_BUFF_6: {
    id: 284255,
    name: 'Barbed Shot (6)',
    icon: 'ability_hunter_barbedshot',
  },
  BARBED_SHOT_BUFF_7: {
    id: 284257,
    name: 'Barbed Shot (7)',
    icon: 'ability_hunter_barbedshot',
  },
  BARBED_SHOT_BUFF_8: {
    id: 284258,
    name: 'Barbed Shot (8)',
    icon: 'ability_hunter_barbedshot',
  },
  BARBED_SHOT_PET_BUFF: {
    id: 272790,
    name: 'Frenzy',
    icon: 'ability_hunter_barbedshot',
  },
  THRILL_OF_THE_HUNT_BUFF: {
    id: 257946,
    name: 'Thrill of the Hunt',
    icon: 'ability_hunter_thrillofthehunt',
  },
  BLOODSHED_DEBUFF: {
    id: 321538,
    name: 'Bloodshed',
    icon: 'ability_hunter_killcommand',
  },
  CALL_OF_THE_WILD_TEMPORARY_PET_BUFF: {
    id: 361582,
    name: 'Call of the Wild',
    icon: 'ability_hunter_pet_assist',
  },
  //endregion

  //region Marksmanship
  STEADY_SHOT_FOCUS: {
    id: 77443,
    name: 'Steady Shot',
    icon: 'ability_hunter_steadyshot',
  },
  TRUESHOT: {
    id: 288613,
    name: 'Trueshot',
    icon: 'ability_trueshot',
  },
  BURSTING_SHOT: {
    id: 186387,
    name: 'Bursting Shot',
    icon: 'ability_hunter_burstingshot',
  },
  RAPID_FIRE: {
    id: 257044,
    name: 'Rapid Fire',
    icon: 'ability_hunter_efficiency',
  },
  RAPID_FIRE_DAMAGE: {
    id: 257045,
    name: 'Rapid Fire',
    icon: 'ability_hunter_efficiency',
  },
  RAPID_FIRE_FOCUS: {
    id: 263585,
    name: 'Rapid Fire',
    icon: 'ability_hunter_efficiency',
  },
  MULTISHOT_MM: {
    id: 257620,
    name: 'Multi-Shot',
    icon: 'ability_upgrademoonglaive',
  },
  MASTER_MARKSMAN_DEBUFF: {
    id: 269576,
    name: 'Master Marksman',
    icon: 'ability_hunter_mastermarksman',
  },
  TRAILBLAZER_BUFF: {
    id: 231390,
    name: 'Trailblazer',
    icon: 'ability_hunter_aspectmastery',
  },
  STEADY_FOCUS_BUFF: {
    id: 193534,
    name: 'Steady Focus',
    icon: 'ability_hunter_improvedsteadyshot',
  },
  VOLLEY_DAMAGE: {
    id: 260247,
    name: 'Volley',
    icon: 'buff_epichunter',
  },
  LOCK_AND_LOAD_BUFF: {
    id: 194594,
    name: 'Lock and Load',
    icon: 'ability_hunter_lockandload',
  },
  SURVIVAL_OF_THE_FITTEST_LONE_WOLF: {
    id: 281195,
    name: 'Survival of the Fittest',
    icon: 'spell_nature_spiritarmor',
  },
  PRECISE_SHOTS: {
    id: 260242,
    name: 'Precise Shots',
    icon: 'ability_hunter_focusedaim',
  },
  TRICK_SHOTS_BUFF: {
    id: 257622,
    name: 'Trick Shots',
    icon: 'inv_trickshot',
  },
  LONE_WOLF_BUFF: {
    id: 164273,
    name: 'Lone Wolf',
    icon: 'spell_hunter_lonewolf',
  },
  STREAMLINE_BUFF: {
    id: 342076,
    name: 'Streamline',
    icon: 'ability_hunter_runningshot',
  },
  CHIMAERA_SHOT_MM_NATURE_DAMAGE: {
    id: 344120,
    name: 'Chimaera Shot',
    icon: 'ability_hunter_chimerashot2',
  },
  CHIMAERA_SHOT_MM_FROST_DAMAGE: {
    id: 344121,
    name: 'Chimaera Shot',
    icon: 'ability_hunter_chimerashot2',
  },
  DEATHBLOW_BUFF: {
    id: 378770,
    name: 'Deathblow',
    icon: 'ability_hunter_runningshot',
  },
  SERPENT_STING_MM: {
    id: 271788,
    name: 'Serpent Sting',
    icon: 'spell_hunter_exoticmunitions_poisoned',
  },
  BLEAK_ARROW_DAMAGE: {
    id: 467718,
    name: 'Bleak Arrows',
    icon: 'inv_quiver_1h_mawraid_d_01.jpg',
  },
  //endregion

  //region Survival
  WALLOP_BUFF: {
    id: 1252741,
    name: 'Furious Assault',
    icon: 'spell_druid_feralchargecat',
  },
  ASPECT_OF_THE_EAGLE: {
    id: 186289,
    name: 'Aspect of the Eagle',
    icon: 'spell_hunter_aspectoftheironhawk',
  },
  HARPOON: {
    id: 190925,
    name: 'Harpoon',
    icon: 'ability_hunter_harpoon',
  },
  TERMS_OF_ENGAGEMENT_BUFF: {
    id: 265898,
    name: 'Terms of Engagement',
    icon: 'ability_hunter_harpoon',
  },
  KILL_COMMAND_SURVIVAL_DAMAGE: {
    id: 259277,
    name: 'Kill Command',
    icon: 'ability_hunter_killcommand',
  },
  FLANKERS_ADVANTAGE: {
    id: 259285,
    name: "Flanker's Advantage",
    icon: 'ability_hunter_resistanceisfutile',
  },
  RAPTOR_STRIKE_AOTE: {
    id: 265189,
    name: 'Raptor Strike',
    icon: 'ability_hunter_raptorstrike',
  },
  MONGOOSE_FURY: {
    id: 259388,
    name: 'Mongoose Fury',
    icon: 'ability_hunter_mongoosebite',
  },
  HARPOON_DAMAGE: {
    //doesn't actually do damage, but it's categorized as that
    id: 190927,
    name: 'Harpoon',
    icon: 'ability_hunter_harpoon',
  },
  WING_CLIP: {
    id: 195645,
    name: 'Wing Clip',
    icon: 'ability_rogue_trip',
  },
  TIP_OF_THE_SPEAR_CAST: {
    id: 260286,
    name: 'Tip of the Spear',
    icon: 'ability_bossmannoroth_glaivethrust',
  },
  WILDFIRE_BOMB_DOT: {
    id: 269747,
    name: 'Wildfire Bomb',
    icon: 'inv_wildfirebomb',
  },
  WILDFIRE_BOMB_IMPACT: {
    id: 265157,
    name: 'Wildfire Bomb',
    icon: 'inv_wildfirebomb',
  },
  BLOODSEEKER_BUFF: {
    id: 260249,
    name: 'Predator',
    icon: 'ability_druid_primaltenacity',
  },
  BOOMSTICK_DAMAGE: {
    id: 1261215,
    name: 'Boomstick',
    icon: 'inv_musket_04',
  },
  RAPTOR_SWIPE_DAMAGE: {
    id: 1262293,
    name: 'Raptor Swipe',
    icon: 'inv12_apextalent_hunter_raptorswipe',
  },
  RAPTOR_SWIPE_AOTE: {
    id: 1262343,
    name: 'Raptor Swipe',
    icon: 'inv12_apextalent_hunter_raptorswipe',
  },
  TAKEDOWN_PET_DAMAGE: {
    id: 1253862,
    name: 'Takedown',
    icon: 'inv12_ability_hunter_takedown',
  },
  TAKEDOWN_PLAYER: {
    id: 1253859,
    name: 'Takedown',
    icon: 'inv12_ability_hunter_takedown',
  },
  HATCHET_TOSS: {
    id: 193265,
    name: 'Hatchet Toss',
    icon: 'ability_hunter_hatchettoss',
  },
  //endregion

  //region Hero Talents
  SENTINELS_MARK_DEBUFF: {
    id: 1253601,
    name: "Sentinel's Mark",
    icon: 'ability_ardenweald_hunter',
  },
  MOONLIGHT_CHAKRAM_CAST: {
    id: 1264949,
    name: 'Moonlight Chakram',
    icon: 'inv_ability_hunter_deathchakram',
  },
  MOONLIGHT_CHAKRAM_DAMAGE: {
    id: 1266081,
    name: 'Moonlight Chakram',
    icon: 'inv_ability_hunter_deathchakram',
  },
  URSINE_FURY_BEASTS: {
    id: 170364,
    name: 'Dire Beast',
    icon: 'Ability_hunter_bestialdiscipline',
  },
  HOWL_WYVERN_BUFF: {
    id: 462515, //Update this to the ID
    name: 'Howl of the Packleader',
    icon: 'inv_misc_elitewyvern',
  },
  WAILING_ARROW_DAMAGE: {
    id: 392058,
    name: 'Wailing Arrow',
    icon: 'ability_theblackarrow',
  },
  WAILING_ARROW_DAMAGE_FOCUS: {
    id: 392060,
    name: 'Wailing Arrow',
    icon: 'ability_theblackarrow',
  },
  BLACK_ARROW_DAMAGE: {
    id: 466930,
    name: 'Black Arrow',
    icon: 'inv_ability_darkrangerhunter_blackarrow',
  },
  BLACK_ARROW_DAMAGE_2: {
    id: 468037,
    name: 'Black Arrow',
    icon: 'inv_ability_darkrangerhunter_blackarrow',
  },
  BLACK_ARROW_DAMAGE_3: {
    id: 468572,
    name: 'Black Arrow',
    icon: 'inv_ability_darkrangerhunter_blackarrow',
  },
  //rendregion
  //region Shared Talents
  EXPLOSIVE_SHOT_DAMAGE: {
    id: 212680,
    name: 'Explosive Shot',
    icon: '6bf_explosive_shard',
  },
  KILL_COMMAND_SHARED_DAMAGE: {
    id: 83381,
    name: 'Kill Command',
    icon: 'ability_hunter_killcommand',
  },
  REJUVENATING_WIND_BUFF: {
    id: 385540,
    name: 'Rejuvenating Winds',
    icon: 'ability_druid_galewinds',
  },
  ARCANE_SHOT: {
    id: 185358,
    name: 'Arcane Shot',
    icon: 'ability_impalingbolt',
  },
  STEADY_SHOT: {
    id: 56641,
    name: 'Steady Shot',
    icon: 'ability_hunter_steadyshot',
  },
  KILL_SHOT_MM_BM: {
    id: 53351,
    name: 'Kill Shot',
    icon: 'ability_hunter_assassinate2',
  },
  KILL_SHOT_SV: {
    id: 320976,
    name: 'Kill Shot',
    icon: 'ability_hunter_assassinate2',
  },
  HUNTERS_MARK: {
    id: 257284,
    name: "Hunter's Mark",
    icon: 'ability_hunter_markedfordeath',
  },
  POSTHASTE_BUFF: {
    id: 118922,
    name: 'Posthaste',
    icon: 'ability_hunter_posthaste',
  },
  A_MURDER_OF_CROWS_DEBUFF: {
    id: 131900,
    name: 'A Murder of Crows',
    icon: 'ability_hunter_murderofcrows',
  },
  BINDING_SHOT_ROOT: {
    id: 117526,
    name: 'Binding Shot Stun',
    icon: 'spell_shaman_bindelemental',
  },
  BINDING_SHOT_TETHER: {
    id: 117405,
    name: 'Binding Shot Tether',
    icon: 'spell_shaman_bindelemental',
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
  CONCUSSIVE_SHOT: {
    id: 5116,
    name: 'Concussive Shot',
    icon: 'spell_frost_stun',
  },
  DISENGAGE: {
    id: 781,
    name: 'Disengage',
    icon: 'ability_rogue_feint',
  },
  EXHILARATION: {
    id: 109304,
    name: 'Exhilaration',
    icon: 'ability_hunter_onewithnature',
  },
  FLARE: {
    id: 1543,
    name: 'Flare',
    icon: 'spell_fire_flare',
  },
  FREEZING_TRAP: {
    id: 187650,
    name: 'Freezing Trap',
    icon: 'spell_frost_chainsofice',
  },
  MISDIRECTION: {
    id: 34477,
    name: 'Misdrection',
    icon: 'ability_hunter_misdirection',
  },
  TAR_TRAP: {
    id: 187698,
    name: 'Tar Trap',
    icon: 'spell_yorsahj_bloodboil_black',
  },
  TAR_TRAP_DEBUFF: {
    id: 135299,
    name: 'Tar Trap',
    icon: 'spell_yorsahj_bloodboil_black',
  },
  COUNTER_SHOT: {
    id: 147362,
    name: 'Counter Shot',
    icon: 'inv_ammo_arrow_03',
  },
  AUTO_SHOT: {
    id: 75,
    name: 'Auto Shot',
    icon: 'ability_whirlwind',
  },
  INTIMIDATION: {
    id: 19577,
    name: 'Intimidation',
    icon: 'ability_devour',
  },
  CHIMAERA_SHOT_FOCUS: {
    id: 204304,
    name: 'Chimaera Shot',
    icon: 'ability_hunter_chimerashot2',
  },
  TRANQUILIZING_SHOT: {
    id: 19801,
    name: 'Tranquilizing Shot',
    icon: 'spell_nature_drowsy',
  },
  //endregion

  //region Pets
  DISMISS_PET: {
    id: 2641,
    name: 'Dismiss Pet',
    icon: 'spell_nature_spiritwolf',
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
  FETCH: {
    id: 125050,
    name: 'Fetch',
    icon: 'inv_misc_bone_01',
  },
  REVIVE_PET: {
    id: 982,
    name: 'Revive Pet',
    icon: 'ability_hunter_beastsoothe',
  },
  MEND_PET: {
    id: 136,
    name: 'Mend Pet',
    icon: 'ability_hunter_mendpet',
  },
  FEIGN_DEATH: {
    id: 5384,
    name: 'Feign Death',
    icon: 'ability_rogue_feigndeath',
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
  PRIMAL_RAGE_1: {
    id: 264667,
    name: 'Primal Rage',
    icon: 'spell_shadow_unholyfrenzy',
  },
  PRIMAL_RAGE_2: {
    id: 272678,
    name: 'Primal Rage',
    icon: 'spell_shadow_unholyfrenzy',
  },
  HARRIERS_CRY: {
    id: 466904,
    name: "Harrier's Cry",
    icon: 'inv_111_hunter_ability_harrierscall',
  },
  MASTERS_CALL: {
    id: 272682,
    name: "Master's Call",
    icon: 'ability_hunter_masterscall',
  },
  FORTITUDE_OF_THE_BEAR: {
    id: 392956,
    name: 'Fortitude of the Bear',
    icon: 'spell_druid_bearhug',
  },
  SURVIVAL_OF_THE_FITTEST: {
    id: 264735,
    name: 'Survival of the Fittest',
    icon: 'spell_nature_spiritarmor',
  },
  CLAW_BASIC_ATTACK: {
    id: 16827,
    name: 'Claw',
    icon: 'ability_druid_rake',
  },
  SMACK_BASIC_ATTACK: {
    id: 49966,
    name: 'Smack',
    icon: 'ability_druid_bash',
  },
  BITE_BASIC_ATTACK: {
    id: 17253,
    name: 'Bite',
    icon: 'ability_druid_ferociousbite',
  },
  //endregion

  //region Miscellaneous
  EAGLE_EYE: {
    id: 6197,
    name: 'Eagle Eye',
    icon: 'ability_hunter_eagleeye',
  },
  EYES_OF_THE_BEAST: {
    id: 321297,
    name: 'Eyes of the Beast',
    icon: 'ability_eyeoftheowl',
  },
  SCARE_BEAST: {
    id: 1513,
    name: 'Scare Beast',
    icon: 'ability_druid_cower',
  },
  //endregion

  HOWL_OF_THE_PACKLEADER_BUFF: {
    id: 471876,
    name: 'Howl of the Pack Leader',
    icon: 'ability_hunter_killcommand',
  },
  HOWL_OF_THE_PACKLEADER_WYVERN: {
    id: 471878,
    name: 'Howl of the Pack Leader - Wyvern',
    icon: 'inv_misc_elitewyvern',
  },
  HOWL_OF_THE_PACKLEADER_BEAR: {
    id: 472325,
    name: 'Howl of the Pack Leader - Bear',
    icon: 'ability_hunter_killcommand',
  },
  HOWL_OF_THE_PACKLEADER_BEAR_SUMMON: {
    id: 471990,
    name: 'Bear Summon',
    icon: 'ability_hunter_pet_bear',
  },
  HOWL_OF_THE_PACKLEADER_BOAR: {
    id: 472324,
    name: 'Howl of the Pack Leader - Boar',
    icon: 'ability_hunter_pet_boar',
  },
  WYVERNS_CRY: {
    id: 471881,
    name: "Wyvern's Cry",
    icon: 'inv_misc_elitewyvern',
  },
  HOGSTRIDER_BUFF: {
    id: 472640,
    name: 'Hogstrider',
    icon: 'inv_misc_boarshead',
  },
  PL_HOGSTRIDER_DAMAGE_1: {
    id: 471938,
    name: 'Boar Charge',
    icon: 'ability_hunter_pet_boar',
  },
  PL_HOGSTRIDER_DAMAGE_2: {
    id: 471936,
    name: 'Boar Charge',
    icon: 'ability_hunter_pet_boar',
  },
  BEAR_REND_FLESH: {
    id: 471999,
    name: 'Rend Flesh',
    icon: 'spell_druid_bloodythrash',
  },
  LEAD_FROM_THE_FRONT: {
    id: 472743,
    name: 'Lead From the Front',
    icon: 'buff_epichunter',
  },

  //region Tier Sets
  //T29 2P
  T29_2P_BONUS_BEAST_MASTERY: {
    id: 393646,
    name: 'T29 2P',
    icon: 'ability_hunter_killcommand',
  },
  T29_2P_BONUS_MARKSMANSHIP: {
    id: 393648,
    name: 'T29 2P',
    icon: 'ability_hunter_barbedshot',
  },
  //T29 4P
  T29_4P_BONUS_BEAST_MASTERY: {
    id: 393647,
    name: 'T29 4P',
    icon: 'ability_hunter_focusfire',
  },
  T29_4P_BONUS_MARKSMANSHIP: {
    id: 393649,
    name: 'T29 4P',
    icon: 'ability_impalingbolt',
  },
  LETHAL_COMMAND: {
    id: 394298,
    name: 'Lethal Command',
    icon: 'ability_hunter_focusfire',
  },
  HIT_THE_MARK: {
    id: 394371,
    name: 'Find the Mark',
    icon: 'ability_hunter_barbedshot',
  },
  FOCUSING_AIM: {
    id: 394384,
    name: 'Focusing Aim',
    icon: 'ability_impalingbolt',
  },
  //T30 2P
  T30_2P_BONUS_BEAST_MASTERY: {
    id: 405524,
    name: 'T30 2P',
    icon: 'ability_hunter_killcommand',
  },
  //T30 4P

  T30_4P_BONUS_BEAST_MASTERY: {
    id: 405525,
    name: 'T30 4P',
    icon: 'ability_druid_ferociousbite',
  },

  //TWW Lightless 2p
  TWW_LIGHTLESS_2P_MM: {
    id: 453648,
    name: 'Hunter MM Lightless 2 Piece Set',
    icon: 'trade_engineering',
  },

  //TWW Lightless 4p
  TWW_LIGHTLESS_4P_MM: {
    id: 453650,
    name: 'Hunter MM Lightless 4 Piece Set',
    icon: 'trade_engineering',
  },
  TWW_STAMPEDE_BUFF: {
    id: 1250068,
    name: 'Stampede Buff Duration',
    icon: 'ability_hunter_bestialdiscipline',
  },
  TWW_STAMPEDE_DAMAGE: {
    id: 201594,
    name: 'Stampede',
    icon: 'inv_pet_babymurlocs_blue',
  },

  //endregion
} satisfies Record<string, Spell>;

export default spells;
