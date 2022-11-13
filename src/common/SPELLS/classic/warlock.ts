/**
 * All WotLK Warlock spells (including talent spells) go here.
 * You need to do this manually by opening a WCL report and clicking the icons of spells to open the relevant Wowhead page. Here, you can get the icon name by clicking the icon, copy the name of the spell, and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS/classic` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import { spellIndexableList } from '../Spell';

const spells = spellIndexableList({
  // --------
  // SHARED
  // --------

  BANISH: {
    id: 18647,
    name: 'Banish',
    icon: 'spell_shadow_cripple',
    lowRanks: [710],
  },
  CORRUPTION: {
    id: 47813,
    name: 'Corruption',
    icon: 'spell_shadow_abominationexplosion',
    lowRanks: [47812, 27216, 11672, 11671, 7648, 6223, 6222, 172],
  },
  CURSE_OF_AGONY: {
    id: 47864,
    name: 'Curse of Agony',
    icon: 'spell_shadow_curseofsargeras',
    lowRanks: [47863, 27218, 11713, 11712, 11711, 6217, 1014, 980],
  },
  CURSE_OF_DOOM: {
    id: 47867,
    name: 'Curse of Doom',
    icon: 'spell_shadow_auraofdarkness',
    lowRanks: [30910, 603],
  },
  CURSE_OF_THE_ELEMENTS: {
    id: 47865,
    name: 'Curse of the Elements',
    icon: 'spell_shadow_chilltouch',
    lowRanks: [27228, 11722, 11721, 1490],
  },
  CURSE_OF_TONGUES: {
    id: 11719,
    name: 'Curse of Tongues',
    icon: 'spell_shadow_curseoftounges',
    lowRanks: [1714],
  },
  CURSE_OF_WEAKNESS: {
    id: 50511,
    name: 'Curse of Weakness',
    icon: 'spell_shadow_curseofmannoroth',
    lowRanks: [30909, 27224, 11708, 11707, 7646, 6205, 1108, 702],
  },
  DEATH_COIL: {
    id: 47860,
    name: 'Death Coil',
    icon: 'spell_shadow_deathcoil',
    lowRanks: [47859, 27223, 17926, 17925, 6789],
  },
  DEMON_ARMOR: {
    id: 47889,
    name: 'Demon Armor',
    icon: 'spell_shadow_ragingscream',
    lowRanks: [47793, 27260, 11735, 11734, 11733, 1086, 706],
  },
  DEMONIC_CIRCLE_SUMMON: {
    id: 48018,
    name: 'Demonic Circle: Summon',
    icon: 'spell_shadow_demoniccirclesummon',
  },
  DEMONIC_CIRCLE_TELEPORT: {
    id: 48020,
    name: 'Demonic Circle: Teleport',
    icon: 'spell_shadow_demoniccircleteleport',
  },
  DEMON_SKIN: {
    id: 696,
    name: 'Demon Skin',
    icon: 'spell_shadow_ragingscream',
    lowRanks: [687],
  },
  DETECT_INVISIBILITY: {
    id: 132,
    name: 'Detect Invisibility',
    icon: 'spell_shadow_detectlesserinvisibility',
  },
  DRAIN_LIFE: {
    id: 47857,
    name: 'Drain Life',
    icon: 'spell_shadow_lifedrain02',
    lowRanks: [27220, 27219, 11700, 11699, 7651, 709, 699, 689],
  },
  DRAIN_MANA: {
    id: 5138,
    name: 'Drain Mana',
    icon: 'spell_shadow_siphonmana',
  },
  DRAIN_SOUL: {
    id: 47855,
    name: 'Drain Soul',
    icon: 'spell_shadow_haunting',
    lowRanks: [27217, 11675, 8289, 8288, 1120],
  },
  EYE_OF_KILROGG: {
    id: 126,
    name: 'Eye of Kilrogg',
    icon: 'spell_shadow_evileye',
  },
  FIRESTONE_CREATE: {
    id: 60220,
    name: 'Create Firestone',
    icon: 'inv_misc_gem_bloodstone_02',
    lowRanks: [60219, 27250, 17953, 17952, 17951, 6366],
    soulShardsCost: 1,
  },
  FEAR: {
    id: 6215,
    name: 'Fear',
    icon: 'spell_shadow_possession',
    lowRanks: [6213, 5782],
  },
  FEL_ARMOR: {
    id: 47893,
    name: 'Fel Armor',
    icon: 'spell_shadow_felarmour',
    lowRanks: [47892, 28189, 28176],
  },
  FIRESTONE_USE: {
    id: 41174,
    name: 'Firestone',
    icon: 'inv_misc_gem_bloodstone_02',
    lowRanks: [41173, 40773, 41172, 41171, 41169, 41170],
  },
  HEALTH_FUNNEL: {
    id: 47856,
    name: 'Health Funnel',
    icon: 'spell_shadow_lifedrain',
    lowRanks: [27259, 11695, 11694, 11693, 3700, 3699, 3698, 755],
  },
  HEALTHSTONE_CREATE: {
    id: 47878,
    name: 'Create Healthstone',
    icon: 'inv_stone_04',
    lowRanks: [47871, 27230, 11730, 11729, 5699, 6202, 6201],
  },
  HEALTHSTONE_USE: {
    id: 47877,
    name: 'Healthstone',
    icon: 'inv_stone_04',
    lowRanks: [47876, 47875],
  },
  HELLFIRE: {
    id: 47823,
    name: 'Hellfire',
    icon: 'spell_fire_incinerate',
    lowRanks: [27213, 11684, 11683, 1949],
  },
  HOWL_OF_TERROR: {
    id: 17928,
    name: 'Howl of Terror',
    icon: 'spell_shadow_deathscream',
    lowRanks: [5484],
  },
  IMMOLATE: {
    id: 47811,
    name: 'Immolate',
    icon: 'spell_fire_immolation',
    lowRanks: [47810, 27215, 25309, 11668, 11667, 11665, 2941, 1094, 707, 348],
  },
  INCINERATE: {
    id: 47838,
    name: 'Incinerate',
    icon: 'spell_fire_burnout',
    lowRanks: [47837, 32231, 29722],
  },
  LIFE_TAP: {
    id: 57946,
    name: 'Life Tap',
    icon: 'spell_shadow_burningspirit',
    lowRanks: [27222, 11689, 11688, 11687, 1456, 1455, 1454],
  },
  LIFE_TAP_GLYPH: {
    id: 63321,
    name: 'Life Tap Glyph', // buff
    icon: 'spell_shadow_burningspirit',
  },
  RAIN_OF_FIRE: {
    id: 47820,
    name: 'Rain of Fire',
    icon: 'spell_shadow_rainoffire',
    lowRanks: [47819, 27212, 11678, 11677, 6219, 5740],
  },
  RITUAL_OF_DOOM: {
    id: 18540,
    name: 'Ritual of Doom',
    icon: 'spell_shadow_antimagicshell',
  },
  RITUAL_OF_SOULS: {
    id: 58887,
    name: 'Ritual of Souls',
    icon: 'spell_shadow_shadesofdarkness',
    lowRanks: [29893],
  },
  RITUAL_OF_SUMMONING: {
    id: 698,
    name: 'Ritual of Summoning',
    icon: 'spell_shadow_twilight',
  },
  SEARING_PAIN: {
    id: 47815,
    name: 'Searing Pain',
    icon: 'spell_fire_soulburn',
    lowRanks: [47814, 30459, 27210, 17923, 17922, 17921, 17920, 17919, 5676],
  },
  SEED_OF_CORRUPTION: {
    id: 47836,
    name: 'Seed of Corruption',
    icon: 'spell_shadow_seedofdestruction',
    lowRanks: [47835, 27243],
  },
  SENSE_DEMONS: {
    id: 5500,
    name: 'Sense Demons',
    icon: 'spell_shadow_metamorphosis',
  },
  SHADOW_BOLT: {
    id: 47809,
    name: 'Shadow Bolt',
    icon: 'spell_shadow_shadowbolt',
    lowRanks: [47808, 27209, 25307, 11661, 11660, 11659, 7641, 1106, 1088, 705, 695, 686],
  },
  SHADOW_WARD: {
    id: 47891,
    name: 'Shadow Ward',
    icon: 'spell_shadow_antishadow',
    lowRanks: [47890, 28610, 11740, 11739, 6229],
  },
  SHADOWFLAME: {
    id: 61290,
    name: 'Shadowflame',
    icon: 'ability_warlock_shadowflame',
    lowRanks: [47897],
  },
  SOUL_FIRE: {
    id: 47825,
    name: 'Soul Fire',
    icon: 'spell_fire_fireball02',
    lowRanks: [47824, 30545, 27211, 17924, 6353],
  },
  SOULSHATTER: {
    id: 29858,
    name: 'Soulshatter',
    icon: 'spell_arcane_arcane01',
    soulShardsCost: 1,
  },
  SOULSTONE_CREATE: {
    id: 47884,
    name: 'Create Spellstone',
    icon: 'inv_misc_orb_04',
    lowRanks: [27238, 20757, 20756, 20755, 20752, 693],
    soulShardsCost: 1,
  },
  SPELLSTONE_CREATE: {
    id: 47888,
    name: 'Create Spellstone',
    icon: 'inv_misc_gem_sapphire_01',
    lowRanks: [47886, 28172, 17728, 17727, 2362],
    soulShardsCost: 1,
  },
  SPELLSTONE_USE: {
    id: 41196,
    name: 'Spellstone',
    icon: 'inv_misc_gem_sapphire_01',
    lowRanks: [41195, 41194, 41193, 41192, 41191],
  },
  SUBJUGATE_DEMON: {
    id: 61191,
    name: 'Subjugate Demon',
    icon: 'spell_shadow_enslavedemon',
    lowRanks: [11726, 11725, 1098],
  },
  SUMMON_DREADSTEED: {
    id: 23161,
    name: 'Dreadsteed',
    icon: 'ability_mount_dreadsteed',
  },
  SUMMON_FELHUNTER: {
    id: 691,
    name: 'Summon Felhunter',
    icon: 'spell_shadow_summonfelhunter',
    soulShardsCost: 1,
  },
  SUMMON_FELSTEED: {
    id: 5784,
    name: 'Felsteed',
    icon: 'spell_nature_swiftness',
  },
  SUMMON_IMP: {
    id: 688,
    name: 'Summon Imp',
    icon: 'spell_shadow_summonimp',
  },
  SUMMON_INCUBUS: {
    id: 713,
    name: 'Summon Incubus',
    icon: 'ability_warlock_incubus',
    soulShardsCost: 1,
  },
  SUMMON_INFERNO: {
    id: 1122,
    name: 'Inferno',
    icon: 'spell_shadow_summoninfernal',
  },
  SUMMON_SUCCUBUS: {
    id: 712,
    name: 'Summon Succubus',
    icon: 'spell_shadow_summonsuccubus',
    soulShardsCost: 1,
  },
  SUMMON_VOIDWALKER: {
    id: 697,
    name: 'Summon Voidwalker',
    icon: 'spell_shadow_summonvoidwalker',
    soulShardsCost: 1,
  },
  UNENDING_BREATH: {
    id: 5697,
    name: 'Unending Breath',
    icon: 'spell_shadow_demonbreath',
  },

  // ---------
  // TALENTS
  // ---------

  // Affliction
  HAUNT: {
    id: 59164,
    name: 'Haunt',
    icon: 'ability_warlock_haunt',
    lowRanks: [59163, 59161, 48181],
  },
  SHADOW_EMBRACE: {
    id: 32394,
    name: 'Shadow Embrace',
    icon: 'spell_shadow_shadowembrace',
  },
  SHADOW_TRANCE: {
    id: 17941,
    name: 'Shadow Trance',
    icon: 'spell_shadow_twilight',
  },
  UNSTABLE_AFFLICTION: {
    id: 47843,
    name: 'Unstable Affliction',
    icon: 'spell_shadow_unstableaffliction_3',
    lowRanks: [47841, 30405, 30404, 30108],
  },

  // Demonology

  DEMONIC_EMPOWERMENT: {
    id: 47193,
    name: 'Demonic Empowerment',
    icon: 'ability_warlock_demonicempowerment',
  },

  FEL_DOMINATION: {
    id: 18708,
    name: 'Fel Domination',
    icon: 'spell_nature_removecurse',
  },

  METAMORPHOSIS: {
    // --------------------------------
    id: 47241,
    name: 'Metamorphosis',
    icon: 'spell_shadow_demonform',
  },
  DEMON_CHARGE: {
    id: 54785,
    name: 'Demon Charge',
    icon: 'ability_warstomp',
  },
  CHALLENGING_HOWL: {
    id: 59671,
    name: 'Challenging Howl',
    icon: 'spell_nature_shamanrage',
  },
  IMMOLATION_AURA: {
    id: 50589,
    name: 'Immolation Aura',
    icon: 'spell_fire_incinerate',
  },
  SHADOW_CLEAVE: {
    id: 50581,
    name: 'Shadow Cleave',
    icon: 'ability_warlock_avoidance',
  },
  // --------------------------------

  SUMMON_FELGUARD: {
    id: 30146,
    name: 'Summon Felguard',
    icon: 'spell_shadow_summonfelguard',
    soulShardsCost: 1,
  },
});

export default spells;
