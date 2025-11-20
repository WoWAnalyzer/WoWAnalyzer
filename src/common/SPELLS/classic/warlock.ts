/**
 * All Classic Warlock spells (including talent spells) not included in generated spell lists go here.
 * You need to do this manually by opening a WCL report and clicking the icons of spells to open the relevant Wowhead page. Here, you can get the icon name by clicking the icon, copy the name of the spell, and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS/classic` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import Spell from '../Spell';

const spells = {
  // Pet casts
  SHADOW_BULWARK: {
    // Voidwalker
    id: 132413,
    name: 'Shadow Bulwark',
    icon: 'spell_shadow_antishadow.jpg',
  },
  // Talents
  GRIMOIRE_OF_SACRIFICE: {
    id: 108503,
    name: 'Grimoire of Sacrifice',
    icon: 'warlock_grimoireofsacrifice.jpg',
  },
  SHADOWFURY: {
    id: 30283,
    name: 'Shadowfury',
    icon: 'ability_warlock_shadowfurytga.jpg',
  },

  // ---------------
  // OLD LISTS BELOW - Todo: clean up / remove unneeded
  // ---------------
  BANISH: {
    id: 710,
    name: 'Banish',
    icon: 'spell_shadow_cripple.jpg',
  },
  COMMAND_DEMON: {
    id: 119898,
    name: 'Command Demon',
    icon: 'ability_warlock_demonicempowerment.jpg',
  },
  CORRUPTION: {
    id: 172,
    name: 'Corruption',
    icon: 'spell_shadow_abominationexplosion.jpg',
  },
  CREATE_HEALTHSTONE: {
    id: 6201,
    name: 'Create Healthstone',
    icon: 'warlock_-healthstone.jpg',
  },
  CREATE_SOULWELL: {
    id: 29893,
    name: 'Create Soulwell',
    icon: 'spell_shadow_shadesofdarkness.jpg',
  },
  CURSE_OF_ENFEEBLEMENT: {
    id: 109466,
    name: 'Curse of Enfeeblement',
    icon: 'warlock_curse_weakness.jpg',
  },
  CURSE_OF_THE_ELEMENTS: {
    id: 1490,
    name: 'Curse of the Elements',
    icon: 'spell_shadow_chilltouch.jpg',
  },
  DARK_INTENT: {
    id: 109773,
    name: 'Dark Intent',
    icon: 'spell_warlock_focusshadow.jpg',
  },
  DARK_SOUL: {
    id: 77801,
    name: 'Dark Soul',
    icon: 'spell_warlock_demonsoul.jpg',
  },
  DEMONIC_CIRCLE_SUMMON: {
    id: 48018,
    name: 'Demonic Circle: Summon',
    icon: 'spell_shadow_demoniccirclesummon.jpg',
  },
  DEMONIC_CIRCLE_TELEPORT: {
    id: 48020,
    name: 'Demonic Circle: Teleport',
    icon: 'spell_shadow_demoniccircleteleport.jpg',
  },
  DEMONIC_GATEWAY: {
    id: 111771,
    name: 'Demonic Gateway',
    icon: 'spell_warlock_demonicportal_green.jpg',
  },
  DRAIN_LIFE: {
    id: 689,
    name: 'Drain Life',
    icon: 'spell_shadow_lifedrain02.jpg',
  },
  DRAIN_LIFE_SOULBURN: {
    id: 89420,
    name: 'Drain Life Soulburn',
    icon: 'spell_shadow_lifedrain02.jpg',
  },
  EYE_OF_KILROGG: {
    id: 126,
    name: 'Eye of Kilrogg',
    icon: 'spell_shadow_evileye.jpg',
  },
  FEAR: {
    id: 5782,
    name: 'Fear',
    icon: 'spell_shadow_possession.jpg',
  },
  FEL_FLAME: {
    id: 77799,
    name: 'Fel Flame',
    icon: 'spell_fire_felfirenova.jpg',
  },
  HEALTH_FUNNEL: {
    id: 755,
    name: 'Health Funnel',
    icon: 'spell_shadow_lifedrain.jpg',
  },
  HOWL_OF_TERROR: {
    id: 5484,
    name: 'Howl of Terror',
    icon: 'spell_shadow_deathscream.jpg',
  },
  LIFE_TAP: {
    id: 1454,
    name: 'Life Tap',
    icon: 'spell_shadow_burningspirit.jpg',
  },
  SHADOW_BOLT: {
    id: 686,
    name: 'Shadow Bolt',
    icon: 'spell_shadow_shadowbolt.jpg',
  },
  SOULSHATTER: {
    id: 29858,
    name: 'Soulshatter',
    icon: 'spell_arcane_arcane01.jpg',
  },
  SOULSTONE: {
    id: 20707,
    name: 'Soulstone',
    icon: 'spell_shadow_soulgem.jpg',
  },
  SUBJUGATE_DEMON: {
    id: 1098,
    name: 'Subjugate Demon',
    icon: 'spell_shadow_enslavedemon.jpg',
  },
  SUMMON_DOOMGUARD: {
    id: 18540,
    name: 'Summon Doomguard',
    icon: 'warlock_summon_doomguard.jpg',
  },
  SUMMON_FELHUNTER: {
    id: 691,
    name: 'Summon Felhunter',
    icon: 'spell_shadow_summonfelhunter.jpg',
  },
  SUMMON_IMP: {
    id: 688,
    name: 'Summon Imp',
    icon: 'spell_shadow_summonimp.jpg',
  },
  SUMMON_INFERNAL: {
    id: 1122,
    name: 'Summon Infernal',
    icon: 'spell_shadow_summoninfernal.jpg',
  },
  SUMMON_SUCCUBUS: {
    id: 712,
    name: 'Summon Succubus',
    icon: 'spell_shadow_summonsuccubus.jpg',
  },
  SUMMON_VOIDWALKER: {
    id: 697,
    name: 'Summon Voidwalker',
    icon: 'spell_shadow_summonvoidwalker.jpg',
  },
  TWILIGHT_WARD: {
    id: 6229,
    name: 'Twilight Ward',
    icon: 'spell_fire_twilightfireward.jpg',
  },
  UNENDING_BREATH: {
    id: 5697,
    name: 'Unending Breath',
    icon: 'spell_shadow_demonbreath.jpg',
  },
  UNENDING_RESOLVE: {
    id: 104773,
    name: 'Unending Resolve',
    icon: 'spell_shadow_demonictactics.jpg',
  },
  // ----------------
  // SPECIALIZATIONS
  // ----------------
  // Affliction + Destruction
  RAIN_OF_FIRE: {
    id: 5740,
    name: 'Rain of Fire',
    icon: 'spell_shadow_rainoffire.jpg',
  },
  // Affliction
  AGONY: {
    id: 980,
    name: 'Agony',
    icon: 'spell_shadow_curseofsargeras.jpg',
  },
  CURSE_OF_EXHAUSTION: {
    id: 18223,
    name: 'Curse of Exhaustion',
    icon: 'spell_shadow_grimward.jpg',
  },
  DARK_SOUL_MISERY: {
    id: 113860,
    name: 'Dark Soul: Misery',
    icon: 'spell_warlock_demonsoul.jpg',
  },
  DRAIN_SOUL: {
    id: 1120,
    name: 'Drain Soul',
    icon: 'spell_shadow_haunting.jpg',
  },
  HAUNT: {
    id: 48181,
    name: 'Haunt',
    icon: 'ability_warlock_haunt.jpg',
  },
  MALEFIC_GRASP: {
    id: 103103,
    name: 'Malefic Grasp',
    icon: 'ability_warlock_everlastingaffliction.jpg',
  },
  SEED_OF_CORRUPTION: {
    id: 27243,
    name: 'Seed of Corruption',
    icon: 'spell_shadow_seedofdestruction.jpg',
  },
  SOUL_SWAP: {
    id: 86121,
    name: 'Soul Swap',
    icon: 'ability_warlock_soulswap.jpg',
  },
  SOUL_SWAP_EXHALE: {
    id: 86213,
    name: 'Soul Swap Exhale',
    icon: 'ability_rogue_envelopingshadows.jpg',
  },
  SOULBURN: {
    id: 74434,
    name: 'Soulburn',
    icon: 'spell_warlock_soulburn.jpg',
  },
  UNSTABLE_AFFLICTION: {
    id: 30108,
    name: 'Unstable Affliction',
    icon: 'spell_shadow_unstableaffliction_3.jpg',
  },
  // Demonology
  CARRION_SWARM: {
    id: 103967,
    name: 'Carrion Swarm',
    icon: 'ability_warlock_demonicpower.jpg',
  },
  DARK_SOUL_KNOWLEDGE: {
    id: 113861,
    name: 'Dark Soul: Knowledge',
    icon: 'spell_warlock_demonsoul.jpg',
  },
  DEMONIC_LEAP: {
    id: 109151,
    name: 'Demonic Leap',
    icon: 'ability_warstomp.jpg',
  },
  HAND_OF_GULDAN: {
    id: 105174,
    name: 'Hand of Guldan',
    icon: 'ability_warlock_handofguldan.jpg',
  },
  HELLFIRE: {
    id: 1949,
    name: 'Hellfire',
    icon: 'spell_fire_incinerate.jpg',
  },
  METAMORPHOSIS: {
    id: 103958,
    name: 'Metamorphosis',
    icon: 'spell_shadow_demonform.jpg',
  },
  SOUL_FIRE: {
    id: 6353,
    name: 'Soul Fire',
    icon: 'spell_fire_fireball02.jpg',
  },
  SUMMON_FELGUARD: {
    id: 30146,
    name: 'Summon Felguard',
    icon: 'spell_shadow_summonfelguard.jpg',
  },
  // Destruction
  CHAOS_BOLT: {
    id: 116858,
    name: 'Chaos Bolt',
    icon: 'ability_warlock_chaosbolt.jpg',
  },
  CONFLAGRATE: {
    id: 17962,
    name: 'Conflagrate',
    icon: 'spell_fire_fireball.jpg',
  },
  DARK_SOUL_INSTABILITY: {
    id: 113858,
    name: 'Dark Soul: Instability',
    icon: 'spell_warlock_demonsoul.jpg',
  },
  EMBER_TAP: {
    id: 114635,
    name: 'Ember Tap',
    icon: 'inv_ember.jpg',
  },
  FIRE_AND_BRIMSTONE: {
    id: 108683,
    name: 'Fire and Brimstone',
    icon: 'ability_warlock_fireandbrimstone.jpg',
  },
  FLAMES_OF_XOROTH: {
    id: 120451,
    name: 'Flames of Xoroth',
    icon: 'ability_mount_fireravengodmount.jpg',
  },
  HAVOC: {
    id: 80240,
    name: 'Havoc',
    icon: 'ability_warlock_baneofhavoc.jpg',
  },
  IMMOLATE: {
    id: 348,
    name: 'Immolate',
    icon: 'spell_fire_immolation.jpg',
  },
  INCINERATE: {
    id: 29722,
    name: 'Incinerate',
    icon: 'spell_fire_burnout.jpg',
  },
  SHADOWBURN: {
    id: 17877,
    name: 'Shadowburn',
    icon: 'spell_shadow_scourgebuild.jpg',
  },
  // ---------
  // TALENTS
  // ---------
  BLOOD_HORROR: {
    id: 111397,
    name: 'Blood Horror',
    icon: 'ability_deathwing_bloodcorruption_earth.jpg',
  },
  BURNING_RUSH: {
    id: 111400,
    name: 'Burning Rush',
    icon: 'ability_deathwing_sealarmorbreachtga.jpg',
  },
  DARK_BARGAIN: {
    id: 110913,
    name: 'Dark Bargain',
    icon: 'ability_deathwing_bloodcorruption_death.jpg',
  },
  DARK_REGENERATION: {
    id: 108359,
    name: 'Dark Regeneration',
    icon: 'spell_warlock_darkregeneration.jpg',
  },
  DEMONIC_BREATH: {
    id: 47897,
    name: 'Demonic Breath',
    icon: 'ability_warlock_shadowflame.jpg',
  },
  GRIMOIRE_OF_SERVICE: {
    id: 108501,
    name: 'Grimoire of Service',
    icon: 'warlock_grimoireofservice.jpg',
  },
  MANNOROTHS_FURY: {
    id: 108508,
    name: 'Mannoroths Fury',
    icon: 'achievement_boss_magtheridon.jpg',
  },
  MORTAL_COIL: {
    id: 6789,
    name: 'Mortal Coil',
    icon: 'ability_warlock_mortalcoil.jpg',
  },
  SACRIFICIAL_PACT: {
    id: 108416,
    name: 'Sacrificial Pact',
    icon: 'warlock_sacrificial_pact.jpg',
  },
  UNBOUND_WILL: {
    id: 108482,
    name: 'Unbound Will',
    icon: 'warlock_spelldrain.jpg',
  },
  // ---------
  // MISC
  // ---------
  // Casts that aren't casts
  RAIN_OF_FIRE_DAMAGE: {
    id: 42223,
    name: 'Rain of Fire',
    icon: 'spell_shadow_rainoffire.jpg',
  },
  // Pet casts
  DOOM_BOLT: {
    id: 85692,
    name: 'Doom Bolt',
    icon: 'spell_shadow_shadowbolt.jpg',
  },
} satisfies Record<string, Spell>;

export default spells;
