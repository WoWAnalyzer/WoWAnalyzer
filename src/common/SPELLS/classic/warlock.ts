/**
 * All WotLK Warlock spells (including talent spells) go here.
 * You need to do this manually by opening a WCL report and clicking the icons of spells to open the relevant Wowhead page. Here, you can get the icon name by clicking the icon, copy the name of the spell, and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS/classic` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import Spell from '../Spell';

const spells = {
  // --------
  // SHARED
  // --------

  BANISH: {
    id: 18647,
    name: 'Banish',
    icon: 'spell_shadow_cripple',
  },
  BANE_OF_DOOM: { id: 603, name: 'Bane of Doom', icon: 'spell_shadow_auraofdarkness.jpg' },
  BANE_OF_HAVOC: { id: 80240, name: 'Bane of Havoc', icon: 'ability_warlock_baneofhavoc.jpg' },
  BANE_OF_AGONY: { id: 980, name: 'Bane of Agony', icon: 'spell_shadow_curseofsargeras.jpg' },
  CHAOS_BOLT: { id: 50796, name: 'Chaos Bolt', icon: 'ability_warlock_chaosbolt.jpg' },
  CORRUPTION: {
    id: 172,
    name: 'Corruption',
    icon: 'spell_shadow_abominationexplosion',
  },
  CONFLAGRATE: { id: 17962, name: 'Conflagrate', icon: 'spell_fire_fireball.jpg' },
  // TODO remove this after updating aff/demo
  CURSE_OF_AGONY: {
    id: 47864,
    name: 'Curse of Agony',
    icon: 'spell_shadow_curseofsargeras',
  },
  // TODO remove this after updating aff/demo
  CURSE_OF_DOOM: {
    id: 47867,
    name: 'Curse of Doom',
    icon: 'spell_shadow_auraofdarkness',
  },
  CURSE_OF_THE_ELEMENTS: {
    id: 1490,
    name: 'Curse of the Elements',
    icon: 'spell_shadow_chilltouch',
  },
  CURSE_OF_TONGUES: {
    id: 11719,
    name: 'Curse of Tongues',
    icon: 'spell_shadow_curseoftounges',
  },
  CURSE_OF_WEAKNESS: {
    id: 50511,
    name: 'Curse of Weakness',
    icon: 'spell_shadow_curseofmannoroth',
  },
  DEATH_COIL: {
    id: 47860,
    name: 'Death Coil',
    icon: 'spell_shadow_deathcoil',
  },
  DEMON_ARMOR: {
    id: 47889,
    name: 'Demon Armor',
    icon: 'spell_shadow_ragingscream',
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
    soulShardsCost: 1,
  },
  FEAR: {
    id: 6215,
    name: 'Fear',
    icon: 'spell_shadow_possession',
  },
  FEL_ARMOR: {
    id: 47893,
    name: 'Fel Armor',
    icon: 'spell_shadow_felarmour',
  },
  FIRESTONE_USE: {
    id: 41174,
    name: 'Firestone',
    icon: 'inv_misc_gem_bloodstone_02',
  },
  HEALTH_FUNNEL: {
    id: 47856,
    name: 'Health Funnel',
    icon: 'spell_shadow_lifedrain',
  },
  HEALTHSTONE_CREATE: {
    id: 47878,
    name: 'Create Healthstone',
    icon: 'inv_stone_04',
  },
  HELLFIRE: {
    id: 47823,
    name: 'Hellfire',
    icon: 'spell_fire_incinerate',
  },
  HOWL_OF_TERROR: {
    id: 17928,
    name: 'Howl of Terror',
    icon: 'spell_shadow_deathscream',
  },
  IMMOLATE: {
    id: 348,
    name: 'Immolate',
    icon: 'spell_fire_immolation',
  },
  INCINERATE: {
    id: 29722,
    name: 'Incinerate',
    icon: 'spell_fire_burnout',
  },
  LIFE_TAP: {
    id: 1454,
    name: 'Life Tap',
    icon: 'spell_shadow_burningspirit',
  },
  LIFE_TAP_GLYPH: {
    id: 63321,
    name: 'Life Tap Glyph', // buff
    icon: 'spell_shadow_burningspirit',
  },
  MORTAL_COIL: { id: 6789, name: 'Mortal Coil', icon: 'ability_warlock_mortalcoil.jpg' },
  NETHER_WARD: { id: 91711, name: 'Nether Ward', icon: 'spell_fire_felfireward.jpg' },
  RAIN_OF_FIRE: {
    id: 5740,
    name: 'Rain of Fire',
    icon: 'spell_shadow_rainoffire',
  },
  RAIN_OF_FIRE_DAMAGE: { id: 42223, name: 'Rain of Fire', icon: 'spell_shadow_rainoffire.jpg' },
  RITUAL_OF_SOULS: {
    id: 58887,
    name: 'Ritual of Souls',
    icon: 'spell_shadow_shadesofdarkness',
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
  },
  SEED_OF_CORRUPTION: {
    id: 47836,
    name: 'Seed of Corruption',
    icon: 'spell_shadow_seedofdestruction',
  },
  SENSE_DEMONS: {
    id: 5500,
    name: 'Sense Demons',
    icon: 'spell_shadow_metamorphosis',
  },
  SHADOWBURN: { id: 17877, name: 'Shadowburn', icon: 'spell_shadow_scourgebuild.jpg' },
  SHADOWFURY: { id: 30283, name: 'Shadowfury', icon: 'ability_warlock_shadowfurytga.jpg' },
  SHADOW_BOLT: {
    id: 47809,
    name: 'Shadow Bolt',
    icon: 'spell_shadow_shadowbolt',
  },
  SHADOW_MASTERY_DEBUFF: {
    id: 17800,
    name: 'Shadow Mastery',
    icon: 'spell_shadow_shadowbolt',
  },
  SHADOW_WARD: {
    id: 47891,
    name: 'Shadow Ward',
    icon: 'spell_shadow_antishadow',
  },
  SHADOWFLAME: {
    id: 47897,
    name: 'Shadowflame',
    icon: 'ability_warlock_shadowflame',
  },

  SOULBURN: { id: 74434, name: 'Soulburn', icon: 'spell_warlock_soulburn.jpg' },
  SOUL_FIRE: {
    id: 6353,
    name: 'Soul Fire',
    icon: 'spell_fire_fireball02',
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
    soulShardsCost: 1,
  },
  SPELLSTONE_CREATE: {
    id: 47888,
    name: 'Create Spellstone',
    icon: 'inv_misc_gem_sapphire_01',
    soulShardsCost: 1,
  },
  SPELLSTONE_USE: {
    id: 41196,
    name: 'Spellstone',
    icon: 'inv_misc_gem_sapphire_01',
  },
  SUBJUGATE_DEMON: {
    id: 61191,
    name: 'Subjugate Demon',
    icon: 'spell_shadow_enslavedemon',
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
  SUMMON_DOOMGUARD: { id: 18540, name: 'Summon Doomguard', icon: 'warlock_summon_doomguard.jpg' },
  UNENDING_BREATH: {
    id: 5697,
    name: 'Unending Breath',
    icon: 'spell_shadow_demonbreath',
  },
  DEMON_SOUL: { id: 77801, name: 'Demon Soul', icon: 'spell_warlock_demonsoul.jpg' },
  DEMON_SOUL_IMP_BUFF: { id: 79459, name: 'Demon Soul: Imp', icon: 'spell_warlock_demonsoul.jpg' },
  // ---------
  // TALENTS
  // ---------

  // Affliction
  HAUNT: {
    id: 59164,
    name: 'Haunt',
    icon: 'ability_warlock_haunt',
  },
  ERADICATION_BUFF_6: {
    id: 64368,
    name: 'Eradication',
    icon: 'ability_warlock_eradication',
  },
  ERADICATION_BUFF_12: {
    id: 64370,
    name: 'Eradication',
    icon: 'ability_warlock_eradication',
  },
  ERADICATION_BUFF_20: {
    id: 64371,
    name: 'Eradication',
    icon: 'ability_warlock_eradication',
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
  },

  // Demonology
  DECIMATION: {
    id: 63167,
    name: 'Decimation',
    icon: 'spell_fire_fireball02',
  },
  DEMONIC_EMPOWERMENT: {
    id: 47193,
    name: 'Demonic Empowerment',
    icon: 'ability_warlock_demonicempowerment',
  },
  DEMONIC_PACT: {
    id: 47240,
    name: 'Demonic Pact',
    icon: 'spell_shadow_demonicpact',
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
  MOLTEN_CORE_BUFF: {
    id: 71165,
    name: 'Molten Core',
    icon: 'ability_warlock_moltencore',
  },
  SOUL_LINK: {
    id: 19028,
    name: 'Soul Link',
    icon: 'spell_shadow_gathershadows',
  },
  SUMMON_FELGUARD: {
    id: 30146,
    name: 'Summon Felguard',
    icon: 'spell_shadow_summonfelguard',
    soulShardsCost: 1,
  },

  // Destruction
  FEL_FLAME: { id: 77799, name: 'Fel Flame', icon: 'spell_fire_felfirenova.jpg' },
} satisfies Record<string, Spell>;

export default spells;
