/**
 * All Rogue abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

const spells = {
  // Defensive general spells
  FEINT: {
    id: 1966,
    name: 'Feint',
    icon: 'ability_rogue_feint',
  },
  CRIMSON_VIAL: {
    id: 185311,
    name: 'Crimson Vial',
    icon: 'ability_rogue_crimsonvial',
  },
  CLOAK_OF_SHADOWS: {
    id: 31224,
    name: 'Cloak of Shadows',
    icon: 'spell_shadow_nethercloak',
  },
  EVASION: {
    id: 5277,
    name: 'Evasion',
    icon: 'spell_shadow_shadowward',
  },
  RIPOSTE: {
    id: 199754,
    name: 'Riposte',
    icon: 'ability_parry',
  },

  // General spells
  KICK: {
    id: 1766,
    name: 'Kick',
    icon: 'ability_kick',
  },
  SPRINT: {
    id: 2983,
    name: 'Sprint',
    icon: 'ability_rogue_sprint',
  },
  TRICKS_OF_THE_TRADE: {
    id: 57934,
    name: 'Tricks of the Trade',
    icon: 'ability_rogue_tricksofthetrade',
  },
  STEALTH: {
    id: 1784,
    name: 'Stealth',
    icon: 'ability_stealth',
  },
  STEALTH_BUFF: {
    id: 115191,
    name: 'Stealth',
    icon: 'ability_stealth',
  },
  VANISH: {
    id: 1856,
    name: 'Vanish',
    icon: 'ability_vanish',
  },
  VANISH_BUFF: {
    id: 11327,
    name: 'Vanish',
    icon: 'ability_vanish',
  },
  SHADOWSTEP: {
    id: 36554,
    name: 'Shadowstep',
    icon: 'ability_rogue_shadowstep',
  },
  SAP: {
    id: 6770,
    name: 'Sap',
    icon: 'ability_sap',
  },
  SHROUD_OF_CONCEALMENT: {
    id: 114018,
    name: 'Shroud of Concealment',
    icon: 'ability_rogue_shroudofconcealment',
  },
  CHEAP_SHOT: {
    id: 1833,
    name: 'Cheap Shot',
    icon: 'ability_cheapshot',
  },
  KIDNEY_SHOT: {
    id: 408,
    name: 'Kidney Shot',
    icon: 'ability_rogue_kidneyshot',
  },
  DISTRACT: {
    id: 1725,
    name: 'Distract',
    icon: 'ability_rogue_distract',
  },
  GOUGE: {
    id: 1776,
    name: 'Gouge',
    icon: 'ability_gouge',
  },
  GRAPPLING_HOOK: {
    id: 195457,
    name: 'Grappling Hook',
    icon: 'ability_rogue_grapplinghook',
  },
  PICK_LOCK: {
    id: 1804,
    name: 'Pick Lock',
    icon: 'spell_nature_moonkey',
  },
  PICK_POCKET: {
    id: 921,
    name: 'Pick Pocket',
    icon: 'inv_misc_bag_11',
  },
  SLICE_AND_DICE: {
    id: 315496,
    name: 'Slice and Dice',
    icon: 'ability_rogue_slicedice',
  },

  // Subtlety spells
  // Combo point generating damage ability
  BACKSTAB: {
    id: 53,
    name: 'Backstab',
    icon: 'ability_backstab',
  },
  SHADOWSTRIKE: {
    id: 185438,
    name: 'Shadowstrike',
    icon: 'ability_rogue_shadowstrike',
  },
  SHURIKEN_STORM: {
    id: 197835,
    name: 'Shuriken Storm',
    icon: 'ability_rogue_shurikenstorm',
  },
  SHURIKEN_TOSS: {
    id: 114014,
    name: 'Shuriken Toss',
    icon: 'inv_throwingknife_07',
  },
  // Main finishing move
  NIGHTBLADE: {
    id: 195452,
    name: 'Nightblade',
    icon: 'ability_rogue_nightblade',
  },
  EVISCERATE: {
    id: 196819,
    name: 'Eviscerate',
    icon: 'ability_rogue_eviscerate',
  },
  BLACK_POWDER: {
    id: 319175,
    name: 'Black Powder',
    icon: 'spell_priest_divinestar_shadow',
  },
  // Offensive cooldown
  SHADOW_BLADES: {
    id: 121471,
    name: 'Shadow Blades',
    icon: 'inv_knife_1h_grimbatolraid_d_03',
  },
  SHADOW_DANCE: {
    id: 185313,
    name: 'Shadow Dance',
    icon: 'ability_rogue_shadowdance',
  },
  SHADOW_DANCE_BUFF: {
    id: 185422,
    name: 'Shadow Dance',
    icon: 'ability_rogue_shadowdance',
  },
  SYMBOLS_OF_DEATH: {
    id: 212283,
    name: 'Symbols of Death',
    icon: 'spell_shadow_rune',
  },

  // CP Generation
  SHADOW_TECHNIQUES: {
    id: 196911,
    name: 'Shadow Techniques',
    icon: 'ability_rogue_masterofsubtlety',
  },
  SHURIKEN_STORM_CP: {
    id: 212743,
    name: 'Shuriken Storm',
    icon: 'ability_rogue_shurikenstorm',
  },
  // ENERGY REGEN
  RELENTLESS_STRIKES: {
    id: 98440,
    name: 'Relentless Strikes',
    icon: 'ability_warrior_decisivestrike',
  },
  SHADOW_SATYRS_WALK_ENERGY_BASE: {
    id: 224914,
    name: 'Shadow Satyr\'s Walk',
    icon: 'inv_boots_mail_dungeonmail_c_04',
  },
  SHADOW_SATYRS_WALK_ENERGY_EXTRA: {
    id: 208440,
    name: "Shadow Satyr's Walk",
    icon: 'inv_boots_mail_dungeonmail_c_04',
  },
  MASTER_OF_SHADOWS_ENERGY: {
    id: 196980,
    name: 'Master of Shadows',
    icon: 'spell_shadow_charm',
  },

  //Buffs
  MASTER_ASSASSINS_INITIATIVE_BUFF: {
    id: 235027,
    name: "Master Assassin's Initiative",
    icon: 'inv_weapon_shortblade_25',
  },
  THE_FIRST_OF_THE_DEAD_BUFF: {
    id: 248210,
    name: 'The First of the Dead',
    icon: 'inv_glove_cloth_raidwarlockmythic_q_01',
  },

  // Sets

  //Tooltips for T20 are swapped on Wowhead.
  //Names of variables correctly reflect in-game.
  SUB_ROGUE_T20_2SET_BONUS: {
    id: 242280,
    name: 'T20 2 set bonus',
    icon: 'spell_shadow_rune',
  },
  SUB_ROGUE_T20_4SET_BONUS: {
    id: 242279,
    name: 'T20 4 set bonus',
    icon: 'ability_stealth',
  },

  SUB_ROGUE_T21_2SET_BONUS: {
    id: 251785,
    name: 'T21 2 set bonus',
    icon: 'ability_rogue_eviscerate',
  },
  SUB_ROGUE_T21_4SET_BONUS: {
    id: 251788,
    name: 'T21 4 set bonus',
    icon: 'ability_rogue_eviscerate',
  },
  SUB_ROGUE_T21_4SET_BONUS_BUFF: {
    id: 257945,
    name: 'Shadow Gestures',
    icon: 'spell_shadow_painspike',
  },
  SUB_ROGUE_T21_4SET_BONUS_CP_EFFECT: {
    id: 252732,
    name: 'Shadow Gestures',
    icon: 'ability_rogue_eviscerate',
  },

  //Assassination
  DEADLY_POISON: {
    id: 2823,
    name: 'Deadly Poison',
    icon: 'ability_rogue_dualweild',
  },
  WOUND_POISON: {
    id: 8679,
    name: 'Wound Poison',
    icon: 'inv_misc_herb_16',
  },
  CRIPPLING_POISON: {
    id: 3408,
    name: 'Crippling Poison',
    icon: 'ability_poisonsting',
  },

  //Builders
  MUTILATE: {
    id: 1329,
    name: 'Mutilate',
    icon: 'ability_rogue_shadowstrikes',
  },
  MUTILATE_MAINHAND: {
    id: 5374,
    name: 'Mutilate',
    icon: 'ability_dualwield',
  },
  MUTILATE_OFFHAND: {
    id: 27576,
    name: 'Mutilate Off-Hand',
    icon: 'ability_dualwield',
  },
  GARROTE: {
    id: 703,
    name: 'Garrote',
    icon: 'ability_rogue_garrote',
  },
  FAN_OF_KNIVES: {
    id: 51723,
    name: 'Fan of Knives',
    icon: 'ability_rogue_fanofknives',
  },
  FAN_OF_KNIVES_COMBOPOINTS: {
    id: 234278,
    name: 'Fan of Knives',
    icon: 'ability_rogue_fanofknives',
  },
  POISONED_KNIFE: {
    id: 185565,
    name: 'Poisoned Knife',
    icon: 'ability_rogue_poisonedknife',
  },

  //Finishers
  ENVENOM: {
    id: 32645,
    name: 'Envenom',
    icon: 'ability_rogue_disembowel',
  },
  RUPTURE: {
    id: 1943,
    name: 'Rupture',
    icon: 'ability_rogue_rupture',
  },

  //Cooldowns
  VENDETTA: {
    id: 79140,
    name: 'Vendetta',
    icon: 'ability_rogue_deadliness',
  },

  //Procs/Poisons
  DEADLY_POISON_PROC: {
    id: 113780,
    name: 'Deadly Poison',
    icon: 'ability_poisons',
  },
  DEADLY_POISON_DOT: {
    id: 2818,
    name: 'Deadly Poison',
    icon: 'ability_rogue_dualweild',
  },
  POISON_BOMB: {
    id: 192660,
    name: 'Poison Bomb',
    icon: 'rogue_paralytic_poison',
  },
  VENOMOUS_VIM: {
    id: 51637,
    name: 'Venomous Vim',
    icon: 'ability_rogue_venomouswounds',
  },
  URGE_TO_KILL: {
    id: 242164,
    name: 'Urge to Kill',
    icon: 'ability_rogue_improvedrecuperate',
  },
  SEAL_FATE: {
    id: 14189,
    name: 'Seal Fate',
    icon: 'ability_rogue_sealfate',
  },
  POISON_KNIVES: {
    id: 192380,
    name: 'Poison Knives',
    icon: 'ability_rogue_dualweild',
  },
  VENOM_RUSH_ENERGY: {
    id: 256522,
    name: 'Venom Rush',
    icon: 'rogue_venomzest',
  },
  BLINDSIDE_BUFF: {
    id: 121153,
    name: 'Blindside',
    icon: 'ability_rogue_focusedattacks',
  },
  ELABORATE_PLANNING_BUFF: {
    id: 193641,
    name: 'Elaborate Planning',
    icon: 'inv_misc_map08',
  },
  SUBTERFUGE_BUFF: {
    id: 115192,
    name: 'Subterfuge',
    icon: 'rogue_subterfuge',
  },
  MASTER_ASSASSIN_BUFF: {
    id: 256735,
    name: 'Master Assasin',
    icon: 'ability_criticalstrike',
  },
  TOXIC_BLADE_DEBUFF: {
    id: 245389,
    name: 'Toxic Blade',
    icon: 'inv_weapon_shortblade_62',
  },

  //Outlaw

  //Builders
  SINISTER_STRIKE: {
    id: 193315,
    name: 'Sinister Strike',
    icon: 'spell_shadow_ritualofsacrifice',
  },
  SINISTER_STRIKE_PROC: {
    id: 197834,
    name: 'Sinister Strike',
    icon: 'ability_rogue_sabreslash',
  },
  PISTOL_SHOT: {
    id: 185763,
    name: 'Pistol Shot',
    icon: 'ability_rogue_pistolshot',
  },
  AMBUSH: {
    id: 8676,
    name: 'Ambush',
    icon: 'ability_rogue_ambush',
  },

  //Finishers
  DISPATCH: {
    id: 2098,
    name: 'Dispatch',
    icon: 'ability_rogue_waylay',
  },
  BETWEEN_THE_EYES: {
    id: 315341,
    name: 'Between the Eyes',
    icon: 'inv_weapon_rifle_01',
  },
  BLIND: {
    id: 2094,
    name: 'Blind',
    icon: 'spell_shadow_mindsteal',
  },
  ROLL_THE_BONES: {
    id: 315508,
    name: 'Roll the Bones',
    icon: 'ability_rogue_rollthebones',
  },

  //CDs
  ADRENALINE_RUSH: {
    id: 13750,
    name: 'Adrenaline Rush',
    icon: 'spell_shadow_shadowworddominate',
  },

  //Other
  BLADE_FLURRY: {
    id: 13877,
    name: 'Blade Flurry',
    icon: 'ability_warrior_punishingblow',
  },
  BLADE_FLURRY_DAMAGE: {
    id: 22482,
    name: 'Blade Flurry',
    icon: 'ability_warrior_punishingblow',
  },

  //Buffs
  SKULL_AND_CROSSBONES: {
    id: 199603,
    name: 'Skull and Crossbones',
    icon: 'ability_rogue_rollthebones01',
  },
  GRAND_MELEE: {
    id: 193358,
    name: 'Grand Melee',
    icon: 'ability_rogue_rollthebones02',
  },
  RUTHLESS_PRECISION: {
    id: 193357,
    name: 'Ruthless Precision',
    icon: 'ability_rogue_rollthebones03',
  },
  TRUE_BEARING: {
    id: 193359,
    name: 'True Bearing',
    icon: 'ability_rogue_rollthebones04',
  },
  BURIED_TREASURE: {
    id: 199600,
    name: 'Buried Treasure',
    icon: 'ability_rogue_rollthebones05',
  },
  BROADSIDE: {
    id: 193356,
    name: 'Broadside',
    icon: 'ability_rogue_rollthebones06',
  },
  BLADE_RUSH_TALENT_BUFF: {
    // This is the energy gain buff
    id: 271896,
    name: 'Blade Rush',
    icon: 'ability_arakkoa_spinning_blade',
  },
  DREADBLADES_TALENT_BUFF: {
    id: 343143,
    name: 'Dreadblades',
    icon: 'ability_rogue_restlessblades',
  },
  FIND_WEAKNESS: {
    id: 316220,
    name: 'Find Weakness',
    icon: 'ability_rogue_findweakness',
  },

  //Procs
  COMBO_POINT: {
    id: 139546,
    name: 'Combo Point',
    icon: 'ability_druid_catformattack',
  },
  COMBAT_POTENCY: {
    id: 35546,
    name: 'Combat Potency',
    icon: 'inv_weapon_shortblade_38',
  },
  MAIN_GAUCHE: {
    id: 86392,
    name: 'Main Gauche',
    icon: 'inv_weapon_shortblade_15',
  },
  OPPORTUNITY: {
    id: 195627,
    name: 'Opportunity',
    icon: 'ability_rogue_pistolshot',
  },
} as const;

export default spells;
