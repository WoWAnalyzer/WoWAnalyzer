/**
 * All Warlock abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

export default {
  // -------------
  // Shared spells
  // -------------
  BANISH: {
    id: 710,
    name: 'Banish',
    icon: 'spell_shadow_cripple',
  },
  CREATE_HEALTHSTONE: {
    id: 6201,
    name: 'Create Healthstone',
    icon: 'warlock_-healthstone',
  },
  CREATE_SOULWELL: {
    id: 29893,
    name: 'Create Soulwell',
    icon: 'spell_shadow_shadesofdarkness',
  },
  DEMONIC_GATEWAY_CAST: {
    id: 111771,
    name: 'Demonic Gateway',
    icon: 'spell_warlock_demonicportal_green',
  },
  DRAIN_LIFE: {
    id: 234153,
    name: 'Drain Life',
    icon: 'spell_shadow_lifedrain02',
  },
  ENSLAVE_DEMON: {
    id: 1098,
    name: 'Enslave Demon',
    icon: 'spell_shadow_enslavedemon',
  },
  EYE_OF_KILROGG: {
    id: 126,
    name: 'Eye of Kilrogg',
    icon: 'spell_shadow_evileye',
  },
  FEAR_CAST: {
    id: 5782,
    name: 'Fear',
    icon: 'spell_shadow_possession',
  },
  FEAR_DEBUFF: {
    id: 118699,
    name: 'Fear',
    icon: 'spell_shadow_possession',
  },
  HEALTH_FUNNEL_CAST: {
    id: 755,
    name: 'Health Funnel',
    icon: 'spell_shadow_lifedrain',
  },
  LIFE_TAP: {
    id: 1454,
    name: 'Life Tap',
    icon: 'spell_shadow_burningspirit',
  },
  SOUL_LEECH_SPELL: {
    id: 108370,
    name: 'Soul Leech',
    icon: 'warlock_siphonlife',
  },
  SOUL_LEECH_BUFF: {
    id: 108366,
    name: 'Soul Leech',
    icon: 'warlock_siphonlife',
  },
  SOULSTONE: {
    id: 20707,
    name: 'Soulstone',
    icon: 'spell_shadow_soulgem',
  },
  SUMMON_DOOMGUARD_UNTALENTED: {
    id: 18540,
    name: 'Summon Doomguard',
    icon: 'warlock_summon_doomguard',
  },
  SUMMON_INFERNAL_UNTALENTED: {
    id: 1122,
    name: 'Summon Infernal',
    icon: 'spell_shadow_summoninfernal',
  },
  SUMMON_IMP: {
    id: 688,
    name: 'Summon Imp',
    icon: 'spell_shadow_summonimp',
  },
  SUMMON_VOIDWALKER: {
    id: 697,
    name: 'Summon Voidwalker',
    icon: 'spell_shadow_summonvoidwalker',
  },
  SUMMON_FELHUNTER: {
    id: 691,
    name: 'Summon Felhunter',
    icon: 'spell_shadow_summonfelhunter',
  },
  SUMMON_SUCCUBUS: {
    id: 712,
    name: 'Summon Succubus',
    icon: 'spell_shadow_summonsuccubus',
  },
  UNENDING_RESOLVE: {
    id: 104773,
    name: 'Unending Resolve',
    icon: 'spell_shadow_demonictactics',
  },
  UNENDING_BREATH: {
    id: 5697,
    name: 'Unending Breath',
    icon: 'spell_shadow_demonbreath',
  },

  // --------------
  // Shared talents
  // --------------

  BURNING_RUSH: {
    id: 111400,
    name: 'Burning Rush',
    icon: 'ability_deathwing_sealarmorbreachtga',
  },
  EMPOWERED_LIFE_TAP_BUFF: {
    id: 235156,
    name: 'Empowered Life Tap',
    icon: 'spell_shadow_manafeed',
  },
  DEMONIC_CIRCLE_SUMMON: {
    id: 48018,
    name: 'Demonic Circle Summon',
    icon: 'spell_shadow_demoniccirclesummon',
  },
  DEMONIC_CIRCLE_TELEPORT: {
    id: 48020,
    name: 'Demonic Circle Teleport',
    icon: 'spell_shadow_demoniccircleteleport',
  },
  MORTAL_COIL: {
    id: 6789,
    name: 'Mortal Coil',
    icon: 'ability_warlock_mortalcoil',
  },
  MORTAL_COIL_HEAL: {
    id: 108396,
    name: 'Mortal Coil',
    icon: 'ability_warlock_mortalcoil',
  },
  SOUL_HARVEST: {
    id: 196098,
    name: 'Soul Harvest',
    icon: 'spell_warlock_demonsoul',
  },
  DARK_PACT: {
    id: 108416,
    name: 'Dark Pact',
    icon: 'warlock_sacrificial_pact',
  },
  SUMMON_DOOMGUARD_TALENTED: {
    id: 157757,
    name: 'Summon Doomguard',
    icon: 'warlock_summon_doomguard',
  },
  SUMMON_INFERNAL_TALENTED: {
    id: 157898,
    name: 'Summon Infernal',
    icon: 'spell_shadow_summoninfernal',
  },
  GRIMOIRE_IMP: {
    id: 111859,
    name: 'Grimoire: Imp',
    icon: 'spell_shadow_summonimp',
  },
  GRIMOIRE_VOIDWALKER: {
    id: 111895,
    name: 'Grimoire: Voidwalker',
    icon: 'spell_shadow_summonvoidwalker',
  },
  GRIMOIRE_FELHUNTER: {
    id: 111897,
    name: 'Grimoire: Felhunter',
    icon: 'spell_shadow_summonfelhunter',
  },
  GRIMOIRE_SUCCUBUS: {
    id: 111896,
    name: 'Grimoire: Succubus',
    icon: 'spell_shadow_summonsuccubus',
  },
  GRIMOIRE_OF_SACRIFICE_BUFF: {
    id: 196099,
    name: 'Demonic Power',
    icon: 'warlock_grimoireofsacrifice',
  },
  GRIMOIRE_OF_SACRIFICE_DAMAGE: {
    id: 196100,
    name: 'Demonic Power',
    icon: 'warlock_grimoireofsacrifice',
  },

  // ----------
  // AFFLICTION
  //-----------
  // Affliction spells
  AGONY: {
    id: 980,
    name: 'Agony',
    icon: 'spell_shadow_curseofsargeras',
  },
  CORRUPTION_CAST: {
    id: 172,
    name: 'Corruption',
    icon: 'spell_shadow_abominationexplosion',
  },
  CORRUPTION_DEBUFF: {
    id: 146739,
    name: 'Corruption',
    icon: 'spell_shadow_abominationexplosion',
  },
  DRAIN_SOUL: {
    id: 198590,
    name: 'Drain Soul',
    icon: 'spell_shadow_haunting',
  },
  REAP_SOULS: {
    id: 216698,
    name: 'Reap Souls',
    icon: 'inv_staff_2h_artifactdeadwind_d_01',
  },
  WARLOCK_TORMENTED_SOULS: {
    id: 216695,
    name: 'Tormented Souls',
    icon: 'inv_staff_2h_artifactdeadwind_d_01',
  },
  DEADWIND_HARVESTER: {
    id: 216708,
    name: 'Deadwind Harvester',
    icon: 'inv_misc_2h_farmscythe_a_01',
  },
  SEED_OF_CORRUPTION_DEBUFF: {
    id: 27243,
    name: 'Seed of Corruption',
    icon: 'spell_shadow_seedofdestruction',
  },
  SEED_OF_CORRUPTION_EXPLOSION: {
    id: 27285,
    name: 'Seed of Corruption',
    icon: 'spell_shadow_seedofdestruction',
  },
  UNSTABLE_AFFLICTION_CAST: {
    id: 30108,
    name: 'Unstable Affliction',
    icon: 'spell_shadow_unstableaffliction_3',
  },
  UNSTABLE_AFFLICTION_DEBUFF_1: {
    id: 233490,
    name: 'Unstable Affliction',
    icon: 'spell_shadow_unstableaffliction_3',
  },
  UNSTABLE_AFFLICTION_DEBUFF_2: {
    id: 233496,
    name: 'Unstable Affliction',
    icon: 'spell_shadow_unstableaffliction_3',
  },
  UNSTABLE_AFFLICTION_DEBUFF_3: {
    id: 233497,
    name: 'Unstable Affliction',
    icon: 'spell_shadow_unstableaffliction_3',
  },
  UNSTABLE_AFFLICTION_DEBUFF_4: {
    id: 233498,
    name: 'Unstable Affliction',
    icon: 'spell_shadow_unstableaffliction_3',
  },
  UNSTABLE_AFFLICTION_DEBUFF_5: {
    id: 233499,
    name: 'Unstable Affliction',
    icon: 'spell_shadow_unstableaffliction_3',
  },

  // Affliction talents
  PHANTOM_SINGULARITY: {
    id: 205179,
    name: 'Phantom Singularity',
    icon: 'inv_enchant_voidsphere',
  },
  PHANTOM_SINGULARITY_HEAL: {
    id: 205246,
    name: 'Phantom Singularity',
    icon: 'inv_enchant_voidsphere',
  },
  HAUNT: {
    id: 48181,
    name: 'Haunt',
    icon: 'ability_warlock_haunt',
  },
  SIPHON_LIFE: {
    id: 63106,
    name: 'Siphon Life',
    icon: 'spell_shadow_requiem',
  },

  //Affliction tier sets
  WARLOCK_AFFLI_T20_2P_BONUS: {
    id: 242290,
    name: 'Affliction Warlock T20 2P bonus',
    icon: 'inv_helm_cloth_raidwarlock_r_01',
  },
  WARLOCK_AFFLI_T20_4P_BONUS: {
    id: 242291,
    name: 'Affliction Warlock T20 4P bonus',
    icon: 'inv_chest_cloth_raidwarlock_r_01',
  },
  WARLOCK_AFFLI_T20_4P_BUFF: {
  id: 242292,
    name: 'Demonic Speed',
    icon: 'spell_shadow_soulleech_3',
  },

  //Affliction artifact traits
  FATAL_ECHOES: {
    id: 199257,
    name: 'Fatal Echoes',
    icon: 'inv_misc_bell_01',
  },

  //Affliction shard generating effects
  AGONY_SHARD_GEN: {
    id: 17941,
    name: 'Agony',
    icon: 'spell_shadow_curseofsargeras',
  },
  UNSTABLE_AFFLICTION_KILL_SHARD_GEN: {
    id: 31117,
    name: 'Unstable Affliction',
    icon: 'spell_shadow_unstableaffliction_3',
  },
  DRAIN_SOUL_KILL_SHARD_GEN: {
    id: 205292,
    name: 'Drain Soul',
    icon: 'spell_shadow_haunting',
  },
  SOUL_CONDUIT_SHARD_GEN: {
    id: 215942,
    name: 'Soul Conduit',
    icon: 'spell_shadow_soulleech_2',
  },
  WARLOCK_AFFLI_T20_2P_SHARD_GEN: {
    id: 247054,
    name: 'Affliction Warlock T20 2P bonus',
    icon: 'inv_helm_cloth_raidwarlock_r_01',
  },
  POWER_CORD_OF_LETHTENDRIS_SHARD_GEN: {
    id: 205756,
    name: 'Power Cord of Lethtendris',
    icon: 'inv_belt_30',
  },

  // -----------
  // DESTRUCTION
  // -----------

  // Destruction spells
  //TODO: check if all is correct (copypasta from Development tab)
  INCINERATE: {
    id: 29722,
    name: 'Incinerate',
    icon: 'spell_fire_burnout',
    baseMana: 0.05,
  },
  CONFLAGRATE: {
    id: 17962,
    name: 'Conflagrate',
    icon: 'spell_fire_fireball',
  },
  CHAOS_BOLT: {
    id: 116858,
    name: 'Chaos Bolt',
    icon: 'ability_warlock_chaosbolt',
  },
  IMMOLATE_CAST: {
    id: 348,
    name: 'Immolate',
    icon: 'spell_fire_immolation',
    baseMana: 0.06,
  },
  IMMOLATE_DEBUFF: {
    id: 157736,
    name: 'Immolate',
    icon: 'spell_fire_immolation',
  },
  HAVOC: {
    id: 80240,
    name: 'Havoc',
    icon: 'ability_warlock_baneofhavoc',
    baseMana: 0.08,
  },
  DIMENSIONAL_RIFT_CAST: {
    id: 196586,
    name: 'Dimensional Rift',
    icon: 'spell_warlock_demonicportal_purple',
  },
  RAIN_OF_FIRE_CAST: {
    id: 5740,
    name: 'Rain of Fire',
    icon: 'spell_shadow_rainoffire',
  },
  RAIN_OF_FIRE_DAMAGE: {
    id: 42223,
    name: 'Rain of Fire',
    icon: 'spell_shadow_rainoffire',
  },
  // Destruction talents
  BACKDRAFT: {
    id: 117828,
    name: 'Backdraft',
    icon: 'ability_warlock_backdraft',
  },
  SHADOWBURN: {
    id: 17877,
    name: 'Shadowburn',
    icon: 'spell_shadow_scourgebuild',
  },
  ERADICATION_DEBUFF: {
    id: 196414,
    name: 'Eradication',
    icon: 'ability_warlock_eradication',
  },
  CATACLYSM: {
    id: 152108,
    name: 'Cataclysm',
    icon: 'achievement_zone_cataclysm',
  },
  CHANNEL_DEMONFIRE_CAST: {
    id: 196447,
    name: 'Channel Demonfire',
    icon: 'spell_fire_ragnaros_lavaboltgreen',
    baseMana: 0.048,
  },
  CHANNEL_DEMONFIRE_DAMAGE: {
    id: 196448,
    name: 'Channel Demonfire',
    icon: 'spell_fire_ragnaros_lavaboltgreen',
  },
  SHADOWFURY: {
    id: 30283,
    name: 'Shadowfury',
    icon: 'ability_warlock_shadowfurytga',
  },
  // Destruction set bonuses
  WARLOCK_DESTRO_T20_2P_BONUS: {
    id: 242295,
    name: 'Destruction Warlock T20 2P bonus',
    icon: 'inv_helm_cloth_raidwarlock_r_01',
  },
  WARLOCK_DESTRO_T20_4P_BONUS: {
    id: 242296,
    name: 'Destruction Warlock T20 4P bonus',
    icon: 'inv_chest_cloth_raidwarlock_r_01',
  },
};
