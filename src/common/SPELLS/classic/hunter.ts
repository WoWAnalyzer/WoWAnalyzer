/**
 * All WotLK Hunter spells (including talent spells) go here.
 * You need to do this manually by opening a WCL report and clicking the icons of spells to open the relevant Wowhead page. Here, you can get the icon name by clicking the icon, copy the name of the spell, and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS/classic` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import { spellIndexableList } from '../Spell';

const spells = spellIndexableList({
  // --------
  // SHARED
  // --------
  ARCANE_SHOT: {
    id: 49045,
    name: 'Arcane Shot',
    icon: 'ability_impalingbolt',
    lowRanks: [49044, 27019, 14287, 14286, 14285, 14284, 14283, 14282, 14281, 3044],
  },
  ASPECT_BEAST: {
    id: 13161,
    name: 'Aspect of the Beast',
    icon: 'ability_mount_pinktiger',
  },
  ASPECT_CHEETAH: {
    id: 5118,
    name: 'Aspect of the Cheetah',
    icon: 'ability_mount_jungletiger',
  },
  ASPECT_DRAGONHAWK: {
    id: 61847,
    name: 'Aspect of the Dragonhawk',
    icon: 'ability_hunter_pet_dragonhawk',
    lowRanks: [61846],
  },
  ASPECT_HAWK: {
    id: 27044,
    name: 'Aspect of the Hawk',
    icon: 'spell_nature_ravenform',
    lowRanks: [25296, 14322, 14321, 14320, 14319, 14318, 13165],
  },
  ASPECT_MONKEY: {
    id: 13163,
    name: 'Aspect of the Monkey',
    icon: 'ability_hunter_aspectofthemonkey',
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
    lowRanks: [27045, 20190, 20043],
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
    id: 49067,
    name: 'Explosive Trap',
    icon: 'spell_fire_selfdestruct',
    lowRanks: [49066, 27025, 14317, 14316, 13813],
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
  FREEZING_ARROW: {
    id: 60192,
    name: 'Freezing Arrow',
    icon: 'spell_frost_chillingbolt',
  },
  FREEZING_TRAP: {
    id: 14311,
    name: 'Freezing Trap',
    icon: 'spell_frost_chainsofice',
    lowRanks: [14310, 1499],
  },
  FROST_TRAP: {
    id: 13809,
    name: 'Frost Trap',
    icon: 'spell_frost_freezingbreath',
  },
  HUNTERS_MARK: {
    id: 53338,
    name: "Hunter's Mark",
    icon: 'ability_hunter_snipershot',
    lowRanks: [14325, 14324, 14323, 1130],
  },
  IMMOLATION_TRAP: {
    id: 49056,
    name: 'Immolation Trap',
    icon: 'spell_fire_flameshock',
    lowRanks: [49055, 27023, 14305, 14304, 14303, 14302, 13795],
  },
  KILL_COMMAND: {
    id: 34026,
    name: 'Kill Command',
    icon: 'ability_hunter_killcommand',
  },
  KILL_SHOT: {
    id: 61006,
    name: 'Kill Shot',
    icon: 'ability_hunter_assassinate2',
    lowRanks: [61005, 53351],
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
    lowRanks: [48989, 27046, 13544, 13543, 13542, 3662, 3661, 3111, 136],
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
    lowRanks: [36916, 14271, 14270, 14269, 1495],
  },
  MULTI_SHOT: {
    id: 49048,
    name: 'Multi-Shot',
    icon: 'ability_upgrademoonglaive',
    lowRanks: [49047, 27021, 25294, 14290, 14289, 14288, 2643],
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
    lowRanks: [48995, 27014, 14266, 14265, 14264, 14263, 14262, 14261, 14260, 2973],
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
    lowRanks: [14326, 1513],
  },
  SCORPID_STING: {
    id: 3043,
    name: 'Scorpid Sting',
    icon: 'ability_hunter_criticalshot',
  },
  SERPENT_STING: {
    id: 49001,
    name: 'Serpent Sting',
    icon: 'ability_hunter_quickshot',
    lowRanks: [49000, 27016, 25295, 13555, 13554, 13553, 13552, 13551, 13550, 13549, 1978],
  },
  SNAKE_TRAP: {
    id: 34600,
    name: 'Snake Trap',
    icon: 'ability_hunter_snaketrap',
  },
  STEADY_SHOT: {
    id: 49052,
    name: 'Steady Shot',
    icon: 'ability_hunter_steadyshot',
    lowRanks: [49051, 34120, 56641],
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
    lowRanks: [58431, 27022, 14295, 14294, 1510],
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
    lowRanks: [49049, 27065, 20904, 20903, 20902, 20901, 20900, 19434],
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
    id: 63672,
    name: 'Black Arrow',
    icon: 'spell_shadow_painspike',
    lowRanks: [63671, 63670, 63669, 63668],
  },
  COUNTERATTACK: {
    id: 48999,
    name: 'Counterattack',
    icon: 'ability_warrior_challange',
    lowRanks: [48998, 27067, 20910, 20909, 19306],
  },
  EXPLOSIVE_SHOT: {
    id: 60053,
    name: 'Explosive Shot',
    icon: 'ability_hunter_explosiveshot',
    lowRanks: [60052, 60051, 53301],
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
    lowRanks: [49011, 27068, 24133, 24132, 19386],
  },
});

export default spells;
