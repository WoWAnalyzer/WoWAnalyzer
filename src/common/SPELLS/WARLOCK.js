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
  SHADOWFURY: {
    id: 30283,
    name: 'Shadowfury',
    icon: 'ability_warlock_shadowfurytga',
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
  UNENDING_BREATH: {
    id: 5697,
    name: 'Unending Breath',
    icon: 'spell_shadow_demonbreath',
  },
  UNENDING_RESOLVE: {
    id: 104773,
    name: 'Unending Resolve',
    icon: 'spell_shadow_demonictactics',
  },

  // --------------
  // Shared talents
  // --------------

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
  MORTAL_COIL_HEAL: {
    id: 108396,
    name: 'Mortal Coil',
    icon: 'ability_warlock_mortalcoil',
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
  SHADOW_BOLT_AFFLI: {
    id: 232670,
    name: 'Shadow Bolt',
    icon: 'spell_shadow_shadowbolt',
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
  PHANTOM_SINGULARITY_HEAL: {
    id: 205246,
    name: 'Phantom Singularity',
    icon: 'inv_enchant_voidsphere',
  },

  // Affliction tier sets
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
  WARLOCK_AFFLI_T21_2P_BONUS: {
    id: 251847,
    name: 'Affliction Warlock T21 2P bonus',
    icon: 'inv_shoulder_cloth_raidwarlock_s_01',
  },
  WARLOCK_AFFLI_T21_4P_BONUS: {
    id: 251849,
    name: 'Affliction Warlock T21 4P bonus',
    icon: 'inv_helm_cloth_raidwarlock_s_01',
  },
  WARLOCK_AFFLI_T21_4P_DEBUFF: {
    id: 252938,
    name: 'Tormented Agony',
    icon: 'ability_warlock_improvedsoulleech',
  },

  // Affliction artifact traits
  FATAL_ECHOES: {
    id: 199257,
    name: 'Fatal Echoes',
    icon: 'inv_misc_bell_01',
  },
  REND_SOUL: {
    id: 242834,
    name: 'Rend Soul',
    icon: 'spell_deathknight_strangulate',
  },

  // Affliction shard generating effects
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
  // TODO: check if all is correct (copypasta from Development tab)
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
  ERADICATION_DEBUFF: {
    id: 196414,
    name: 'Eradication',
    icon: 'ability_warlock_eradication',
  },
  CHANNEL_DEMONFIRE_DAMAGE: {
    id: 196448,
    name: 'Channel Demonfire',
    icon: 'spell_fire_ragnaros_lavaboltgreen',
  },
  // Destruction traits
  SOULSNATCHER_FRAGMENT_GEN: {
    id: 196234,
    name: 'Soulsnatcher',
    icon: 'spell_shadow_soulleech_3',
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
  WARLOCK_DESTRO_T21_2P_BONUS: {
    id: 251854,
    name: 'Destruction Warlock T21 2P bonus',
    icon: 'inv_shoulder_cloth_raidwarlock_s_01',
  },
  WARLOCK_DESTRO_T21_4P_BONUS: {
    id: 251855,
    name: 'Destruction Warlock T21 4P bonus',
    icon: 'inv_helm_cloth_raidwarlock_s_01',
  },
  WARLOCK_DESTRO_T21_2P_DEBUFF: {
    id: 253092,
    name: 'Chaotic Flames',
    icon: 'ability_mage_worldinflamesgreen',
  },
  WARLOCK_DESTRO_T21_4P_DEBUFF: {
    id: 253097,
    name: 'Flames of Argus',
    icon: 'spell_volatilefiregreen',
  },
  // Destruction legendary effects
  FERETORY_OF_SOULS_FRAGMENT_GEN: {
    id: 205704,
    name: 'Fiery Soul',
    icon: 'inv_belt_cloth_raidwarlock_n_01',
  },
  ALYTHESSS_PYROGENICS_DEBUFF: {
    id: 205675,
    name: 'Alythess\'s Pyrogenics',
    icon: 'inv_jewelry_ring_65',
  },
  SINDOREI_SPITE_BUFF: {
    id: 208871,
    name: 'Sin\'dorei Spite',
    icon: 'creatureportrait_infernal_ball_02',
  },
  LESSONS_OF_SPACETIME_BUFF: {
    id: 236176,
    name: 'Lessons Of Space-Time',
    icon: 'spell_warlock_demonicportal_purple',
  },
  ODR_SHAWL_OF_THE_YMIRJAR_DEBUFF: {
    id: 212173,
    name: 'Odr, Shawl of the Ymirjar',
    icon: 'inv_misc_cape_cataclysm_tank_b_01',
  },
  MAGISTRIKE_RESTRAINTS_CHAOS_BOLT: {
    id: 213229,
    name: 'Chaos Bolt',
    icon: 'ability_warlock_chaosbolt',
  },
  // Destruction Dimensional Rift spells
  SEARING_BOLT_RIFT: {
    id: 243050,
    name: 'Searing Bolt',
    icon: 'inv_misc_volatilefire',
  },
  CHAOS_BARRAGE_RIFT: {
    id: 187394,
    name: 'Chaos Barrage',
    icon: 'spell_warlock_demonicportal_green',
  },
  CHAOS_BOLT_RIFT: {
    id: 215279,
    name: 'Chaos Bolt',
    icon: 'ability_warlock_chaosbolt',
  },
  SHADOW_BOLT_RIFT: {
    id: 196657,
    name: 'Shadow Bolt',
    icon: 'spell_shadow_shadowbolt',
  },

  // -----------
  // DEMONOLOGY
  // -----------

  // Demonology spells
  DEMONIC_EMPOWERMENT: {
    id: 193396,
    name: 'Demonic Empowerment',
    icon: 'spell_warlock_demonicempowerment',
  },
  SHADOW_BOLT_DEMO: {
    id: 686,
    name: 'Shadow Bolt',
    icon: 'spell_shadow_shadowbolt',
  },
  DOOM: {
    id: 603,
    name: 'Doom',
    icon: 'spell_shadow_auraofdarkness',
  },
  CALL_DREADSTALKERS: {
    id: 104316,
    name: 'Call Dreadstalkers',
    icon: 'spell_warlock_calldreadstalkers',
  },
  GRIMOIRE_FELGUARD: {
    id: 111898,
    name: 'Grimoire: Felguard',
    icon: 'spell_shadow_summonfelguard',
  },
  HAND_OF_GULDAN_CAST: {
    id: 105174,
    name: 'Hand of Gul\'dan',
    icon: 'ability_warlock_handofguldan',
  },
  HAND_OF_GULDAN_DAMAGE: {
    id: 86040,
    name: 'Hand of Gul\'dan',
    icon: 'ability_warlock_handofguldan',
  },
  DEMONWRATH_CAST: {
    id: 193440,
    name: 'Demonwrath',
    icon: 'spell_warlock_demonwrath',
  },
  DEMONWRATH_DAMAGE: {
    id: 193439,
    name: 'Demonwrath',
    icon: 'spell_warlock_demonwrath',
  },
  THALKIELS_CONSUMPTION_CAST: { // also friendly fire damage to pets
    id: 211714,
    name: 'Thal\'kiel\'s Consumption',
    icon: 'inv_offhand_1h_artifactskulloferedar_d_01',
  },
  THALKIELS_CONSUMPTION_DAMAGE: {
    id: 211715,
    name: 'Thal\'kiel\'s Consumption',
    icon: 'inv_offhand_1h_artifactskulloferedar_d_01',
  },
  // Felguard's ability, triggered by our Command Demon ability
  FELSTORM: {
    id: 119914,
    name: 'Felstorm',
    icon: 'ability_warrior_bladestorm',
  },
  // Felguard gets a buff when he uses Felstorm, then follows up always with cast <another Felstorm ID - 89753>, cast this ID, damage <another Felstorm ID 89753> and then always pairs up cast 89753 + damage 89753 (x targets hit)
  FELSTORM_BUFF: {
    id: 89751,
    name: 'Felstorm',
    icon: 'ability_warrior_bladestorm',
  },
  WRATHSTORM_BUFF: {
    id: 115831,
    name: 'Wrathstorm',
    icon: 'ability_warrior_bladestorm',
  },
  SUMMON_FELGUARD: {
    id: 30146,
    name: 'Summon Felguard',
    icon: 'spell_shadow_summonfelguard',
  },

  // Demonology talents
  DEMONIC_CALLING_BUFF: {
    id: 205146,
    name: 'Demonic Calling',
    icon: 'ability_warlock_impoweredimp',
  },
  SHADOWY_INSPIRATION_BUFF: {
    id: 196606,
    name: 'Shadowy Inspiration',
    icon: 'warlock_curse_shadow',
  },
  IMPLOSION_DAMAGE: {
    id: 196278,
    name: 'Implosion',
    icon: 'spell_shadow_shadowandflame',
  },
  GRIMOIRE_OF_SYNERGY_BUFF: {
    id: 171982,
    name: 'Grimoire of Synergy',
    icon: 'warlock_grimoireofsacrifice',
  },

  // Demonology traits
  THALKIELS_DISCORD: {
    id: 211727,
    name: 'Thal\'kiel\'s Discord',
    icon: 'inv_offhand_1h_artifactskulloferedar_d_01',
  },

  // Demonology shard generating effects
  RECURRENT_RITUAL_SHARD_GEN: {
    id: 214811,
    name: 'Recurrent Ritual',
    icon: 'inv_feldreadravenmount',
  },
  POWER_TRIP_SHARD_GEN: {
    id: 216125,
    name: 'Power Trip',
    icon: 'spell_shadow_demonictactics',
  },
  SHADOW_BOLT_SHARD_GEN: {
    id: 194192,
    name: 'Shadow Bolt',
    icon: 'spell_shadow_shadowbolt',
  },
  DEMONBOLT_SHARD_GEN: {
    id: 196300,
    name: 'Demonbolt',
    icon: 'spell_warlock_demonbolt',
  },
  DOOM_SHARD_GEN: {
    id: 193318,
    name: 'Doom',
    icon: 'spell_shadow_auraofdarkness',
  },
  DEMONWRATH_SHARD_GEN: {
    id: 194379,
    name: 'Demonwrath',
    icon: 'spell_warlock_demonwrath',
  },

  // Demonology Tier sets
  WARLOCK_DEMO_T19_2P_BONUS: {
    id: 212005,
    name: 'Demonology Warlock T19 2P Bonus',
    icon: 'inv_helm_cloth_raidwarlock_q_01',
  },
  WARLOCK_DEMO_T19_4P_BONUS: {
    id: 212007,
    name: 'Demonology Warlock T19 4P Bonus',
    icon: 'inv_helm_cloth_raidwarlock_q_01',
  },
  WARLOCK_DEMO_T20_2P_BONUS: {
    id: 242293,
    name: 'Demonology Warlock T20 2P bonus',
    icon: 'inv_helm_cloth_raidwarlock_r_01',
  },
  WARLOCK_DEMO_T20_4P_BONUS: {
    id: 242294,
    name: 'Demonology Warlock T20 4P bonus',
    icon: 'inv_chest_cloth_raidwarlock_r_01',
  },
  WARLOCK_DEMO_T20_4P_BUFF: {
    id: 246962,
    name: 'Dreaded Haste',
    icon: 'spell_shadow_metamorphosis',
  },

  // Demonology legendary effects
  WAKENERS_LOYALTY: {
    id: 236200,
    name: 'Wakener\'s Loyalty',
    icon: 'inv_offhand_1h_artifactskulloferedar_d_01',
  },
};
