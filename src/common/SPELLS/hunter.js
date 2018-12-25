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
  COBRA_SHOT: {
    id: 193455,
    name: 'Cobra Shot',
    icon: 'ability_hunter_cobrashot',
  },
  BARBED_SHOT: {
    id: 217200,
    name: 'Barbed Shot',
    icon: 'ability_hunter_barbedshot',
  },
  KILL_COMMAND_CAST_BM: {
    id: 34026,
    name: 'Kill Command',
    icon: 'ability_hunter_killcommand',
  },
  KILL_COMMAND_DAMAGE_BM: {
    id: 83381,
    name: 'Kill Command',
    icon: 'ability_hunter_killcommand',
  },
  MULTISHOT_BM: {
    id: 2643,
    name: 'Multi-Shot',
    icon: 'ability_upgrademoonglaive',
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
  DIRE_BEAST_BUFF: {
    id: 281036,
    name: 'Dire Beast',
    icon: 'ability_hunter_longevity',
  },
  DIRE_BEAST_GENERATOR: {
    id: 120694,
    name: 'Dire Beast',
    icon: 'ability_hunter_longevity',
  },
  DIRE_BEAST_SECONDARY_WITH_SCENT: { // Dire Beast ID with Scent of Blood talent
    id: 132764,
    name: 'Dire Beast',
    icon: 'ability_hunter_sickem',
  },
  DIRE_BEAST_SECONDARY_WITHOUT_SCENT: { // Dire Beast ID without Scent of Blood talent
    id: 219199,
    name: 'Dire Beast',
    icon: 'ability_hunter_longevity',
  },
  STAMPEDE_DAMAGE: {
    id: 201594,
    name: 'Stampede',
    icon: 'ability_hunter_bestialdiscipline',
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
  SPITTING_COBRA_DAMAGE: {
    id: 206685,
    name: 'Cobra Spit',
    icon: 'ability_creature_poison_02',
  },

  //Beast Mastery BFA Buffs
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
  BARBED_SHOT_BUFF: { //1st stack of Barbed Shot on the player
    id: 246152,
    name: 'Barbed Shot 1',
    icon: 'ability_hunter_barbedshot',
  },
  BARBED_SHOT_BUFF_STACK_2: { //2nd stack of Barbed Shot on the player
    id: 246851,
    name: 'Barbed Shot 2',
    icon: 'ability_hunter_barbedshot',
  },
  BARBED_SHOT_BUFF_STACK_3: { //3rd stack of Barbed Shot on the player
    id: 246852,
    name: 'Barbed Shot 3',
    icon: 'ability_hunter_barbedshot',
  },
  BARBED_SHOT_BUFF_STACK_4: { //4th stack of Barbed Shot on the player
    id: 246853,
    name: 'Barbed Shot 4',
    icon: 'ability_hunter_barbedshot',
  },
  BARBED_SHOT_BUFF_STACK_5: { //5th stack of Barbed Shot on the player
    id: 246854,
    name: 'Barbed Shot 5',
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
  CHIMAERA_SHOT_FOCUS: {
    id: 204304,
    name: 'Chimaera Shot',
    icon: 'ability_hunter_chimerashot2',
  },

  // Marksmanship Hunter:
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
  STEADY_SHOT: {
    id: 56641,
    name: 'Steady Shot',
    icon: 'ability_hunter_steadyshot',
  },
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
  EXPLOSIVE_SHOT_DETONATION: {
    id: 212679,
    name: 'Explosive Shot: Detonate!',
    icon: '6bf_explosive_shard',
  },
  EXPLOSIVE_SHOT_DAMAGE: {
    id: 212680,
    name: 'Explosive Shot',
    icon: '6bf_explosive_shard',
  },
  RAPID_FIRE: {
    id: 257044,
    name: 'Rapid Fire',
    icon: 'ability_hunter_efficiency',
  },
  RAPID_FIRE_TICKS: {
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

  //Marksmanship Buffs
  MASTER_MARKSMAN_BUFF: {
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
  LETHAL_SHOTS_BUFF: {
    id: 260395,
    name: 'Lethal Shots',
    icon: 'ability_hunter_resistanceisfutile',
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
    icon: 'ability_hunter_focusfire',
  },
  LONE_WOLF_BUFF: {
    id: 164273,
    name: 'Lone Wolf',
    icon: 'spell_hunter_lonewolf',
  },
  HUNTERS_MARK_FOCUS: {
    id: 259558,
    name: 'Hunter\'s Mark',
    icon: 'ability_hunter_markedfordeath',
  },

  //Survival:
  ASPECT_OF_THE_EAGLE: {
    id: 186289,
    name: 'Aspect of the Eagle',
    icon: 'spell_hunter_aspectoftheironhawk',
  },
  CARVE: {
    id: 187708,
    name: 'Carve',
    icon: 'ability_hunter_carve',
  },
  COORDINATED_ASSAULT: {
    id: 266779,
    name: 'Coordinated Assault',
    icon: 'inv_coordinatedassault',
  },
  HARPOON: {
    id: 190925,
    name: 'Harpoon',
    icon: 'ability_hunter_harpoon',
  },
  KILL_COMMAND_CAST_SV: {
    id: 259489,
    name: 'Kill Command',
    icon: 'ability_hunter_killcommand',
  },
  KILL_COMMAND_DAMAGE_SV: {
    id: 259277,
    name: 'Kill Command',
    icon: 'ability_hunter_killcommand',
  },
  FLANKERS_ADVANTAGE: {
    id: 259285,
    name: 'Flanker\'s Advantage',
    icon: 'ability_hunter_resistanceisfutile',
  },
  MUZZLE: {
    id: 187707,
    name: 'Muzzle',
    icon: 'ability_hunter_negate',
  },
  WILDFIRE_BOMB: {
    id: 259495,
    name: 'Wildfire Bomb',
    icon: 'inv_wildfirebomb',
  },
  RAPTOR_STRIKE: {
    id: 186270,
    name: 'Raptor Strike',
    icon: 'ability_hunter_raptorstrike',
  },
  RAPTOR_STRIKE_AOTE: {
    id: 265189,
    name: 'Raptor Strike',
    icon: 'ability_hunter_raptorstrike',
  },
  SERPENT_STING_SV: {
    id: 259491,
    name: 'Serpent Sting',
    icon: 'spell_hunter_exoticmunitions_poisoned',
  },
  MONGOOSE_FURY: {
    id: 259388,
    name: 'Mongoose Fury',
    icon: 'ability_hunter_mongoosebite',
  },
  HARPOON_DAMAGE: { //doesn't actually do damage, but it's categorized as that
    id: 190927,
    name: 'Harpoon',
    icon: 'ability_hunter_harpoon',
  },
  WING_CLIP: {
    id: 195645,
    name: 'Wing Clip',
    icon: 'ability_rogue_trip',
  },
  MONGOOSE_BITE_TALENT_AOTE: {
    id: 265888,
    name: 'Mongoose Bite',
    icon: 'ability_hunter_mongoosebite',
  },
  STEEL_TRAP_DAMAGE: { //the event is a damage event, but it merely applies the debuff
    id: 162480,
    name: 'Steel Trap',
    icon: 'inv_pet_pettrap02',
  },
  STEEL_TRAP_DEBUFF: {
    id: 162487,
    name: 'Steel Trap',
    icon: 'inv_pet_pettrap02',
  },
  TIP_OF_THE_SPEAR_CAST: {
    id: 260286,
    name: 'Tip of the Spear',
    icon: 'ability_bossmannoroth_glaivethrust',
  },
  VIPERS_VENOM_BUFF: {
    id: 268552,
    name: 'Viper\'s Venom',
    icon: 'ability_hunter_potentvenom',
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
  SHRAPNEL_BOMB_WFI: {
    id: 270335,
    name: 'Shrapnel Bomb',
    icon: 'inv_wildfirebomb_shrapnel',
  },
  SHRAPNEL_BOMB_WFI_IMPACT: {
    id: 270338,
    name: 'Shrapnel Bomb',
    icon: 'inv_wildfirebomb_shrapnel',
  },
  SHRAPNEL_BOMB_WFI_DOT: {
    id: 270339,
    name: 'Shrapnel Bomb',
    icon: 'inv_wildfirebomb_shrapnel',
  },
  INTERNAL_BLEEDING_SV: {
    id: 270343,
    name: 'Internal Bleeding',
    icon: 'ability_gouge',
  },
  VOLATILE_BOMB_WFI: {
    id: 271045,
    name: 'Volatile Bomb',
    icon: 'inv_wildfirebomb_poison',
  },
  VOLATILE_BOMB_WFI_IMPACT: {
    id: 271048,
    name: 'Volatile Bomb',
    icon: 'inv_wildfirebomb_poison',
  },
  VOLATILE_BOMB_WFI_DOT: {
    id: 271049,
    name: 'Volatile Bomb',
    icon: 'inv_wildfirebomb_poison',
  },
  PHEROMONE_BOMB_WFI: {
    id: 270323,
    name: 'Pheromone Bomb',
    icon: 'inv_wildfirebomb_blood',
  },
  PHEROMONE_BOMB_WFI_IMPACT: {
    id: 270329,
    name: 'Pheromone Bomb',
    icon: 'inv_wildfirebomb_blood',
  },
  PHEROMONE_BOMB_WFI_DOT: {
    id: 270332,
    name: 'Pheromone Bomb',
    icon: 'inv_wildfirebomb_blood',
  },
  CHAKRAMS_TO_MAINTARGET: {
    id: 259398,
    name: 'Chakrams',
    icon: 'ability_glaivetoss',
  },
  CHAKRAMS_BACK_FROM_MAINTARGET: {
    id: 267666,
    name: 'Chakrams',
    icon: 'ability_glaivetoss',
  },
  CHAKRAMS_NOT_MAINTARGET: {
    id: 259396,
    name: 'Chakrams',
    icon: 'ability_glaivetoss',
  },
  BLOODSEEKER_BUFF: {
    id: 260249,
    name: 'Predator',
    icon: 'ability_druid_primaltenacity',
  },

  //Shared BFA buffs/debuffs/misc
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
  BARRAGE_DAMAGE: {
    id: 120361,
    name: 'Barrage',
    icon: 'ability_hunter_rapidregeneration',
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
  FEIGN_DEATH: {
    id: 5384,
    name: 'Feign Death',
    icon: 'ability_rogue_feigndeath',
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
  TAR_TRAP: {
    id: 187698,
    name: 'Tar Trap',
    icon: 'spell_yorsahj_bloodboil_black',
  },
  COUNTER_SHOT: {
    id: 147362,
    name: 'Counter Shot',
    icon: 'inv_ammo_arrow_03',
  },
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
  AUTO_SHOT: {
    id: 75,
    name: 'Auto Shot',
    icon: 'ability_whirlwind',
  },
  EAGLE_EYE: {
    id: 6197,
    name: 'Eagle Eye',
    icon: 'ability_hunter_eagleeye',
  },
  INTIMIDATION: {
    id: 19577,
    name: 'Intimidation',
    icon: 'ability_devour',
  },

  //BFA Pet abilities
  PRIMAL_RAGE: {
    id: 264667,
    name: 'Primal Rage',
    icon: 'spell_shadow_unholyfrenzy',
  },
  MASTERS_CALL: {
    id: 272682,
    name: 'Master\'s Call',
    icon: 'ability_hunter_masterscall',
  },
  SURVIVAL_OF_THE_FITTEST: {
    id: 272679,
    name: 'Survival of the Fittest',
    icon: 'spell_nature_spiritarmor',
  },
  CLAW: {
    id: 16827,
    name: 'Claw',
    icon: 'ability_druid_rake',
  },
  SMACK: {
    id: 49966,
    name: 'Smack',
    icon: 'ability_druid_bash',
  },
  BITE: {
    id: 17253,
    name: 'Bite',
    icon: 'ability_druid_ferociousbite',
  },
};
