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
  BANE_OF_AGONY: {
    id: 980,
    name: 'Bane of Agony',
    icon: 'spell_shadow_curseofsargeras.jpg',
  },
  BANE_OF_DOOM: {
    id: 603,
    name: 'Bane of Doom',
    icon: 'spell_shadow_auraofdarkness.jpg',
  },
  BANISH: {
    id: 710,
    name: 'Banish',
    icon: 'spell_shadow_cripple.jpg',
  },
  CORRUPTION: {
    id: 172,
    name: 'Corruption',
    icon: 'spell_shadow_abominationexplosion.jpg',
  },
  CURSE_OF_THE_ELEMENTS: {
    id: 1490,
    name: 'Curse of the Elements',
    icon: 'spell_shadow_chilltouch.jpg',
  },
  CURSE_OF_TONGUES: {
    id: 1714,
    name: 'Curse of Tongues',
    icon: 'spell_shadow_curseoftounges.jpg',
  },
  CURSE_OF_WEAKNESS: {
    id: 702,
    name: 'Curse of Weakness',
    icon: 'spell_shadow_curseofmannoroth.jpg',
  },
  DARK_INTENT: {
    id: 80398,
    name: 'Dark Intent',
    icon: 'spell_warlock_focusshadow.jpg',
  },
  DARK_INTENT_HASTE: {
    id: 85767,
    name: 'Dark Intent',
    icon: 'spell_warlock_focusshadow.jpg',
  },
  DEATH_COIL: {
    id: 6789,
    name: 'Death Coil',
    icon: 'spell_shadow_deathcoil.jpg',
  },
  DEMON_ARMOR: {
    id: 687,
    name: 'Demon Armor',
    icon: 'spell_shadow_ragingscream.jpg',
  },
  DEMON_SOUL: {
    id: 77801,
    name: 'Demon Soul',
    icon: 'spell_warlock_demonsoul.jpg',
  },
  DEMON_SOUL_FELGUARD_BUFF: {
    id: 79462,
    name: 'Demon Soul: Felguard',
    icon: 'spell_warlock_demonsoul.jpg',
  },
  DEMON_SOUL_FELHUNTER_BUFF: {
    id: 79460,
    name: 'Demon Soul: Felhunter',
    icon: 'spell_warlock_demonsoul.jpg',
  },
  DEMON_SOUL_IMP_BUFF: {
    id: 79459,
    name: 'Demon Soul: Imp',
    icon: 'spell_warlock_demonsoul.jpg',
  },
  DEMON_SOUL_SUCCUBUS_BUFF: {
    id: 79463,
    name: 'Demon Soul: Succubus',
    icon: 'spell_warlock_demonsoul.jpg',
  },
  DEMON_SOUL_VOIDWALKER_BUFF: {
    id: 79464,
    name: 'Demon Soul: Voidwalker',
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
  DRAIN_LIFE: {
    id: 689,
    name: 'Drain Life',
    icon: 'spell_shadow_lifedrain02.jpg',
  },
  DRAIN_LIFE_SOULBURN: {
    id: 89420,
    name: 'Drain Life',
    icon: 'spell_shadow_lifedrain02.jpg',
  },
  DRAIN_SOUL: {
    id: 1120,
    name: 'Drain Soul',
    icon: 'spell_shadow_haunting.jpg',
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
  FEL_ARMOR: {
    id: 28176,
    name: 'Fel Armor',
    icon: 'spell_shadow_felarmour.jpg',
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
  HEALTHSTONE_CREATE: {
    id: 6201,
    name: 'Create Healthstone',
    icon: 'inv_stone_04.jpg',
  },
  HELLFIRE: {
    id: 1949,
    name: 'Hellfire',
    icon: 'spell_fire_incinerate.jpg',
  },
  HOWL_OF_TERROR: {
    id: 5484,
    name: 'Howl of Terror',
    icon: 'spell_shadow_deathscream.jpg',
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
  LIFE_TAP: {
    id: 1454,
    name: 'Life Tap',
    icon: 'spell_shadow_burningspirit.jpg',
  },
  RAIN_OF_FIRE: {
    id: 5740,
    name: 'Rain of Fire',
    icon: 'spell_shadow_rainoffire.jpg',
  },
  RAIN_OF_FIRE_DAMAGE: {
    id: 42223,
    name: 'Rain of Fire',
    icon: 'spell_shadow_rainoffire.jpg',
  },
  RITUAL_OF_SOULS: {
    id: 29893,
    name: 'Ritual of Souls',
    icon: 'spell_shadow_shadesofdarkness.jpg',
  },
  RITUAL_OF_SUMMONING: {
    id: 698,
    name: 'Ritual of Summoning',
    icon: 'spell_shadow_twilight.jpg',
  },
  SEARING_PAIN: {
    id: 5676,
    name: 'Searing Pain',
    icon: 'spell_fire_soulburn.jpg',
  },
  SEED_OF_CORRUPTION: {
    id: 27243,
    name: 'Seed of Corruption',
    icon: 'spell_shadow_seedofdestruction.jpg',
  },
  SHADOW_BOLT: {
    id: 686,
    name: 'Shadow Bolt',
    icon: 'spell_shadow_shadowbolt.jpg',
  },
  SHADOW_WARD: {
    id: 6229,
    name: 'Shadow Ward',
    icon: 'spell_shadow_antishadow.jpg',
  },
  SHADOWFLAME: {
    id: 47897,
    name: 'Shadowflame',
    icon: 'ability_warlock_shadowflame.jpg',
  },
  SOUL_FIRE: {
    id: 6353,
    name: 'Soul Fire',
    icon: 'spell_fire_fireball02.jpg',
  },
  SOUL_LINK: {
    id: 19028,
    name: 'Soul Link',
    icon: 'spell_shadow_gathershadows.jpg',
  },
  SOULBURN: {
    id: 74434,
    name: 'Soulburn',
    icon: 'spell_warlock_soulburn.jpg',
    soulShardsCost: 1,
  },
  SOULSHATTER: {
    id: 29858,
    name: 'Soulshatter',
    icon: 'spell_arcane_arcane01.jpg',
  },
  SOULSTONE_CREATE: {
    id: 693,
    name: 'Create Soulstone',
    icon: 'inv_misc_orb_04.jpg',
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
  SUMMON_INCUBUS: {
    id: 713,
    name: 'Summon Incubus',
    icon: 'ability_warlock_incubus.jpg',
  },
  SUMMON_INFERNO: {
    id: 1122,
    name: 'Inferno',
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
  UNENDING_BREATH: {
    id: 5697,
    name: 'Unending Breath',
    icon: 'spell_shadow_demonbreath.jpg',
  },

  // ---------
  // TALENTS
  // ---------

  // Affliction
  HAUNT: {
    id: 48181,
    name: 'Haunt',
    icon: 'ability_warlock_haunt.jpg',
  },
  ERADICATION_BUFF_6: {
    id: 64368,
    name: 'Eradication',
    icon: 'ability_warlock_eradication.jpg',
  },
  ERADICATION_BUFF_12: {
    id: 64370,
    name: 'Eradication',
    icon: 'ability_warlock_eradication.jpg',
  },
  ERADICATION_BUFF_20: {
    id: 64371,
    name: 'Eradication',
    icon: 'ability_warlock_eradication.jpg',
  },
  SHADOW_EMBRACE: {
    id: 32385,
    name: 'Shadow Embrace',
    icon: 'spell_shadow_shadowembrace.jpg',
  },
  SHADOW_TRANCE: {
    id: 17941,
    name: 'Shadow Trance',
    icon: 'spell_shadow_twilight.jpg',
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
  UNSTABLE_AFFLICTION: {
    id: 30108,
    name: 'Unstable Affliction',
    icon: 'spell_shadow_unstableaffliction_3.jpg',
  },

  // Demonology
  DECIMATION: {
    id: 63158,
    name: 'Decimation',
    icon: 'spell_fire_fireball02.jpg',
  },
  DEMONIC_EMPOWERMENT: {
    id: 47193,
    name: 'Demonic Empowerment',
    icon: 'ability_warlock_demonicempowerment.jpg',
  },
  DEMONIC_PACT: {
    id: 47236,
    name: 'Demonic Pact',
    icon: 'spell_shadow_demonicpact.jpg',
  },
  DEMONIC_REBIRTH: {
    id: 88447,
    name: 'Demonic Rebirth',
    icon: 'spell_shadow_demonictactics.jpg',
  },
  HAND_OF_GULDAN: {
    id: 71521,
    name: "Hand of Gul'dan",
    icon: 'inv_summerfest_firespirit.jpg',
  },
  METAMORPHOSIS: {
    // --------------------------------
    id: 47241,
    name: 'Metamorphosis',
    icon: 'spell_shadow_demonform.jpg',
  },
  DEMON_LEAP: {
    id: 54785,
    name: 'Demon Leap',
    icon: 'ability_warstomp.jpg',
  },
  IMMOLATION_AURA: {
    id: 50589,
    name: 'Immolation Aura',
    icon: 'spell_fire_incinerate.jpg',
  },
  // --------------------------------
  MOLTEN_CORE_BUFF: {
    id: 71165,
    name: 'Molten Core',
    icon: 'ability_warlock_moltencore.jpg',
  },
  SUMMON_FELGUARD: {
    id: 30146,
    name: 'Summon Felguard',
    icon: 'spell_shadow_summonfelguard.jpg',
  },

  // Destruction
  BANE_OF_HAVOC: {
    id: 80240,
    name: 'Bane of Havoc',
    icon: 'ability_warlock_baneofhavoc.jpg',
  },
  CHAOS_BOLT: {
    id: 50796,
    name: 'Chaos Bolt',
    icon: 'ability_warlock_chaosbolt.jpg',
  },
  CONFLAGRATE: {
    id: 17962,
    name: 'Conflagrate',
    icon: 'spell_fire_fireball.jpg',
  },
  NETHER_WARD: {
    id: 91711,
    name: 'Nether Ward',
    icon: 'spell_fire_felfireward.jpg',
  },
  SHADOWBURN: {
    id: 17877,
    name: 'Shadowburn',
    icon: 'spell_shadow_scourgebuild.jpg',
  },
  SHADOWFURY: {
    id: 30283,
    name: 'Shadowfury',
    icon: 'ability_warlock_shadowfurytga.jpg',
  },
} satisfies Record<string, Spell>;

export default spells;
