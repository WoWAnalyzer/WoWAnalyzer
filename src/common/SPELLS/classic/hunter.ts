/**
 * All Classic Hunter spells (including talent spells) go here.
 * You need to do this manually by opening a WCL report and clicking the icons of spells to open the relevant Wowhead page. Here, you can get the icon name by clicking the icon, copy the name of the spell, and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS/classic` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import Spell from '../Spell';

const spells = {
  // --------
  // SHARED
  // --------
  ARCANE_SHOT: {
    id: 3044,
    name: 'Arcane Shot',
    icon: 'ability_impalingbolt',
  },
  ASPECT_CHEETAH: {
    id: 5118,
    name: 'Aspect of the Cheetah',
    icon: 'ability_mount_jungletiger',
  },
  ASPECT_HAWK: {
    id: 13165,
    name: 'Aspect of the Hawk',
    icon: 'spell_nature_ravenform',
  },
  ASPECT_PACK: {
    id: 13159,
    name: 'Aspect of the Pack',
    icon: 'ability_mount_whitetiger',
  },
  ASPECT_VIPER: {
    id: 34074,
    name: 'Aspect of the Viper',
    icon: 'ability_hunter_aspectoftheviper',
  },
  ASPECT_WILD: {
    id: 49071,
    name: 'Aspect of the Wild',
    icon: 'spell_nature_protectionformnature',
  },
  AUTO_SHOT: {
    id: 75,
    name: 'Auto Shot',
    icon: 'ability_whirlwind',
  },
  CALL_PET: {
    id: 883,
    name: 'Call Pet',
    icon: 'ability_hunter_beastcall',
  },

  COBRA_SHOT: { id: 77767, name: 'Cobra Shot', icon: 'ability_hunter_cobrashot.jpg' },
  CONCUSSIVE_SHOT: {
    id: 5116,
    name: 'Concussive Shot',
    icon: 'spell_frost_stun',
  },
  DETERRENCE: {
    id: 19263,
    name: 'Deterrence',
    icon: 'ability_whirlwind',
  },
  DISENGAGE: {
    id: 781,
    name: 'Disengage',
    icon: 'ability_rogue_feint',
  },
  DISMISS_PET: {
    id: 2641,
    name: 'Dismiss Pet',
    icon: 'spell_nature_spiritwolf',
  },
  DISTRACTING_SHOT: {
    id: 20736,
    name: 'Distracting Shot',
    icon: 'spell_arcane_blink',
  },
  EXPLOSIVE_TRAP: {
    id: 13813,
    name: 'Explosive Trap',
    icon: 'spell_fire_selfdestruct',
  },
  EXPLOSIVE_TRAP_LAUNCHER: {
    id: 82939,
    name: 'Explosive Trap',
    icon: 'spell_fire_selfdestruct',
  },
  EYES_OF_THE_BEAST: {
    id: 1002,
    name: 'Eyes of the Beast',
    icon: 'ability_eyeoftheowl',
  },
  FEED_PET: {
    id: 6991,
    name: 'Feed Pet',
    icon: 'ability_hunter_beasttraining',
  },
  FEIGN_DEATH: {
    id: 5384,
    name: 'Feign Death',
    icon: 'ability_rogue_feigndeath',
  },
  FLARE: {
    id: 1543,
    name: 'Flare',
    icon: 'spell_fire_flare',
  },
  FREEZING_TRAP: {
    id: 1499,
    name: 'Freezing Trap',
    icon: 'spell_frost_chainsofice',
  },
  FREEZING_TRAP_LAUNCHER: {
    id: 60192,
    name: 'Freezing Trap',
    icon: 'spell_frost_chainsofice',
  },
  ICE_TRAP: {
    id: 13809,
    name: 'Ice Trap',
    icon: 'spell_frost_freezingbreath',
  },
  ICE_TRAP_LAUNCHER: {
    id: 82941,
    name: 'Ice Trap',
    icon: 'spell_frost_freezingbreath',
  },
  HUNTERS_MARK: {
    id: 1130,
    name: "Hunter's Mark",
    icon: 'ability_hunter_snipershot',
  },
  IMMOLATION_TRAP: {
    id: 13795,
    name: 'Immolation Trap',
    icon: 'spell_fire_flameshock',
  },
  IMMOLATION_TRAP_LAUNCHER: {
    id: 82945,
    name: 'Immolation Trap',
    icon: 'spell_fire_flameshock',
  },
  IMPROVED_STEADY_SHOT: {
    id: 53220,
    name: 'Improved Steady Shot',
    icon: 'ability_hunter_improvedsteadyshot',
  },
  KILL_COMMAND: {
    id: 34026,
    name: 'Kill Command',
    icon: 'ability_hunter_killcommand',
  },
  KILL_SHOT: {
    id: 53351,
    name: 'Kill Shot',
    icon: 'ability_hunter_assassinate2',
  },
  LOCK_AND_LOAD: {
    id: 56453,
    name: 'Lock and Load',
    icon: 'ability_hunter_lockandload',
  },
  MASTERS_CALL: {
    id: 53271,
    name: "Master's Call",
    icon: 'ability_hunter_masterscall',
  },
  MEND_PET: {
    id: 48990,
    name: 'Mend Pet',
    icon: 'ability_hunter_mendpet',
  },
  MISDIRECTION: {
    id: 34477,
    name: 'Misdirection',
    icon: 'ability_hunter_misdirection',
  },
  MONGOOSE_BITE: {
    id: 53339,
    name: 'Mongoose Bite',
    icon: 'ability_hunter_swiftstrike',
  },
  MULTI_SHOT: {
    id: 2643,
    name: 'Multi-Shot',
    icon: 'ability_upgrademoonglaive',
  },
  RAPID_FIRE: {
    id: 3045,
    name: 'Rapid Fire',
    icon: 'ability_hunter_runningshot',
  },
  RAPTOR_STRIKE: {
    id: 48996,
    name: 'Raptor Strike',
    icon: 'ability_meleedamage',
  },
  REVIVE_PET: {
    id: 982,
    name: 'Revive Pet',
    icon: 'ability_hunter_beastsoothe',
  },
  SCARE_BEAST: {
    id: 14327,
    name: 'Scare Beast',
    icon: 'ability_druid_cower',
  },
  SCORPID_STING: {
    id: 3043,
    name: 'Scorpid Sting',
    icon: 'ability_hunter_criticalshot',
  },
  SERPENT_STING: {
    id: 1978,
    name: 'Serpent Sting',
    icon: 'ability_hunter_quickshot',
  },
  SNAKE_TRAP: {
    id: 34600,
    name: 'Snake Trap',
    icon: 'ability_hunter_snaketrap',
  },
  SNIPER_TRAINING: {
    id: 64420,
    name: 'Sniper Training',
    icon: 'ability_hunter_longshots',
  },
  STEADY_SHOT: {
    id: 49052,
    name: 'Steady Shot',
    icon: 'ability_hunter_steadyshot',
  },
  TRANQUILIZING_SHOT: {
    id: 19801,
    name: 'Tranquilizing Shot',
    icon: 'spell_nature_drowsy',
  },
  VIPER_STING: {
    id: 3034,
    name: 'Viper Sting',
    icon: 'ability_hunter_aimedshot',
  },
  VOLLEY: {
    id: 58434,
    name: 'Volley',
    icon: 'ability_marksmanship',
  },
  WING_CLIP: {
    id: 2974,
    name: 'Wing Clip',
    icon: 'ability_rogue_trip',
  },

  // ---------
  // TALENTS
  // ---------
  // Beast Mastery
  BESTIAL_WRATH: {
    id: 19574,
    name: 'Bestial Wrath',
    icon: 'ability_druid_ferociousbite',
  },
  INTIMIDATION: {
    id: 19577,
    name: 'Intimidation',
    icon: 'ability_devour',
  },
  // Marksmanship
  AIMED_SHOT: {
    id: 49050,
    name: 'Aimed Shot',
    icon: 'inv_spear_07',
  },
  CHIMERA_SHOT: {
    id: 53209,
    name: 'Chimera Shot',
    icon: 'ability_hunter_chimerashot2',
  },
  READINESS: {
    id: 23989,
    name: 'Readiness',
    icon: 'ability_hunter_readiness',
  },
  SILENCING_SHOT: {
    id: 34490,
    name: 'Silencing Shot',
    icon: 'ability_theblackarrow',
  },
  TRUESHOT_AURA: {
    id: 19506,
    name: 'Trueshot Aura',
    icon: 'ability_trueshot',
  },
  // Survival
  BLACK_ARROW: {
    id: 3674,
    name: 'Black Arrow',
    icon: 'spell_shadow_painspike',
  },
  COUNTERATTACK: {
    id: 48999,
    name: 'Counterattack',
    icon: 'ability_warrior_challange',
  },
  EXPLOSIVE_SHOT: {
    id: 53301,
    name: 'Explosive Shot',
    icon: 'ability_hunter_explosiveshot',
  },
  SCATTER_SHOT: {
    id: 19503,
    name: 'Scatter Shot',
    icon: 'ability_golemstormbolt',
  },
  WYVERN_STING: {
    id: 49012,
    name: 'Wyvern Sting',
    icon: 'inv_spear_02',
  },
  TRAP_LAUNCHER: { id: 77769, name: 'Trap Launcher', icon: 'ability_hunter_traplauncher.jpg' },
  ASPECT_OF_THE_FOX: {
    id: 82661,
    name: 'Aspect of the Fox',
    icon: 'ability_hunter_aspectofthefox.jpg',
  },
} satisfies Record<string, Spell>;

export default spells;
