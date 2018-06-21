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
    manaCost: 300,
  },
  CREATE_HEALTHSTONE: {
    id: 6201,
    name: 'Create Healthstone',
    icon: 'warlock_-healthstone',
    manaCost: 400,
  },
  CREATE_SOULWELL: {
    id: 29893,
    name: 'Create Soulwell',
    icon: 'spell_shadow_shadesofdarkness',
    manaCost: 1000,
  },
  DEMONIC_GATEWAY_CAST: {
    id: 111771,
    name: 'Demonic Gateway',
    icon: 'spell_warlock_demonicportal_green',
    manaCost: 600,
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
    manaCost: 400,
  },
  EYE_OF_KILROGG: {
    id: 126,
    name: 'Eye of Kilrogg',
    icon: 'spell_shadow_evileye',
    manaCost: 600,
  },
  FEAR_CAST: {
    id: 5782,
    name: 'Fear',
    icon: 'spell_shadow_possession',
    manaCost: 1000,
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
    manaCost: 400,
  },
  UNENDING_RESOLVE: {
    id: 104773,
    name: 'Unending Resolve',
    icon: 'spell_shadow_demonictactics',
    manaCost: 400,
  },
  // TODO: remove later once legendaries no longer work
  // Soul Harvest (despite being removed as a talent) can still proc from The Master Harvester
  SOUL_HARVEST: {
    id: 196098,
    name: 'Soul Harvest',
    icon: 'spell_warlock_demonsoul',
  },

  // --------------
  // Shared talents
  // --------------

  DEMONIC_CIRCLE_SUMMON: {
    id: 48018,
    name: 'Demonic Circle Summon',
    icon: 'spell_shadow_demoniccirclesummon',
    manaCost: 400,
  },
  DEMONIC_CIRCLE_TELEPORT: {
    id: 48020,
    name: 'Demonic Circle Teleport',
    icon: 'spell_shadow_demoniccircleteleport',
    manaCost: 600,
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
    manaCost: 200,
  },
  CORRUPTION_CAST: {
    id: 172,
    name: 'Corruption',
    icon: 'spell_shadow_abominationexplosion',
    manaCost: 200,
  },
  CORRUPTION_DEBUFF: {
    id: 146739,
    name: 'Corruption',
    icon: 'spell_shadow_abominationexplosion',
  },
  SHADOW_BOLT_AFFLI: {
    id: 232670,
    name: 'Shadow Bolt',
    icon: 'spell_shadow_shadowbolt',
    manaCost: 400,
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
  SUMMON_DARKGLARE: {
    id: 205180,
    name: 'Summon Darkglare',
    icon: 'inv_beholderwarlock',
  },
  SUMMON_DARKGLARE_DAMAGE: {
    id: 205231,
    name: 'Eye Beam',
    icon: 'inv_beholderwarlock',
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
  NIGHTFALL_BUFF: {
    id: 264571,
    name: 'Nightfall',
    icon: 'spell_shadow_twilight',
  },
  PHANTOM_SINGULARITY_DAMAGE_HEAL: {
    id: 205246,
    name: 'Phantom Singularity',
    icon: 'inv_enchant_voidsphere',
  },
  SHADOW_EMBRACE_DEBUFF: {
    id: 32390,
    name: 'Shadow Embrace',
    icon: 'spell_shadow_shadowembrace',
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
  // DEMONOLOGY
  // -----------

  // Demonology spells
  CALL_DREADSTALKERS: {
    id: 104316,
    name: 'Call Dreadstalkers',
    icon: 'spell_warlock_calldreadstalkers',
  },
  DEMONBOLT: {
    id: 264178,
    name: 'Demonbolt',
    icon: 'inv__demonbolt',
  },
  DEMONIC_CORE_BUFF: {
    id: 264173,
    name: 'Demonic Core',
    icon: 'warlock_spelldrain',
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
  IMPLOSION_CAST: {
    id: 196277,
    name: 'Implosion',
    icon: 'inv_implosion',
    manaCost: 400,
  },
  IMPLOSION_DAMAGE: {
    id: 196278,
    name: 'Implosion',
    icon: 'inv_implosion',
  },
  SHADOW_BOLT_DEMO: {
    id: 686,
    name: 'Shadow Bolt',
    icon: 'spell_shadow_shadowbolt',
    manaCost: 400,
  },
  SUMMON_FELGUARD: {
    id: 30146,
    name: 'Summon Felguard',
    icon: 'spell_shadow_summonfelguard',
  },
  SUMMON_DEMONIC_TYRANT: {
    id: 265187,
    name: 'Summon Demonic Tyrant',
    icon: 'inv_summondemonictyrant',
    manaCost: 400,
  },
  // Demonic Tyrant buff on player
  DEMONIC_POWER: {
    id: 265273,
    name: 'Demonic Power',
    icon: 'achievement_boss_argus_maleeredar',
  },

  // Pet abilities
  // Following 2 abilities are the same for Grimoire: Felguard
  FELSTORM_BUFF: {
    id: 89751,
    name: 'Felstorm',
    icon: 'ability_warrior_bladestorm',
  },
  FELSTORM_DAMAGE: {
    id: 89753,
    name: 'Felstorm',
    icon: 'ability_warrior_bladestorm',
  },
  // TODO: check Wrathguard and Terrorguard glyphs
  WRATHSTORM_BUFF: {
    id: 115831,
    name: 'Wrathstorm',
    icon: 'ability_warrior_bladestorm',
  },
  // also important for Dreadlash talent
  DREADBITE: {
    id: 271971,
    name: 'Dreadbite',
    icon: 'spell_warlock_calldreadstalkers',
  },
  FEL_FIREBOLT: {
    id: 104318,
    name: 'Fel Firebolt',
    icon: 'spell_fel_firebolt',
  },
  DEMONIC_TYRANT_DAMAGE: {
    id: 270481,
    name: 'Demonfire',
    icon: 'ability_vehicle_demolisherflamecatapult',
  },
  VILEFIEND_BILE_SPIT: {
    id: 267997,
    name: 'Bile Spit',
    icon: 'spell_fel_firebolt',
  },
  VILEFIEND_HEADBUTT: {
    id: 267999,
    name: 'Headbutt',
    icon: 'inv_argusfelstalkermountgrey',
  },
  // Inner Demons pet abilities
  INNER_DEMONS_EYE_OF_GULDAN: {
    id: 272131,
    name: 'Eye of Gul\'dan',
    icon: 'inv_misc_eye_01',
  },
  INNER_DEMONS_TOXIC_BILE: {
    id: 272167,
    name: 'Toxic Bile',
    icon: 'ability_creature_poison_02',
  },
  INNER_DEMONS_SHADOW_SLASH: {
    id: 272012,
    name: 'Shadow Slash',
    icon: 'spell_deathknight_scourgestrike',
  },
  INNER_DEMONS_MULTI_SLASH: {
    id: 272172,
    name: 'Multi-Slash',
    icon: 'ability_rogue_murderspree',
  },
  // TODO: possibly even more
  // Nether Portal pet abilities
  // also can be summoned via Inner Demons
  NETHER_PORTAL_FEL_BITE: {
    id: 272435,
    name: 'Fel Bite',
    icon: 'artifactability_feraldruid_openwounds',
  },
  NETHER_PORTAL_DOUBLE_BREATH: {
    id: 272156,
    name: 'Double Breath',
    icon: 'ability_warlock_shadowflame',
  },
  // also can be summoned via Inner Demons
  NETHER_PORTAL_MANY_FACED_BITE: {
    id: 272439,
    name: 'Many Faced Bite',
    icon: 'inv_soulhoundmount_green',
  },
  // also can be summoned via Inner Demons
  NETHER_PORTAL_OVERHEAD_ASSAULT: {
    id: 272432,
    name: 'Overhead Assault',
    icon: 'warrior_talent_icon_mastercleaver',
  },

  // Demonology talents
  BILESCOURGE_BOMBERS_DAMAGE: {
    id: 267213,
    name: 'Bilescourge Bombers',
    icon: 'ability_hunter_pet_bat',
  },
  DEMONIC_CALLING_BUFF: {
    id: 205146,
    name: 'Demonic Calling',
    icon: 'ability_warlock_impoweredimp',
  },
  DOOM_DAMAGE: {
    id: 265469,
    name: 'Doom',
    icon: 'spell_shadow_auraofdarkness',
  },
  FROM_THE_SHADOWS_DEBUFF: {
    id: 270569,
    name: 'From the Shadows',
    icon: 'spell_warlock_calldreadstalkers',
  },
  SOUL_STRIKE_DAMAGE: {
    id: 267964,
    name: 'Soul Strike',
    icon: 'inv_polearm_2h_fellord_04',
  },
  DEMONIC_CONSUMPTION_BUFF: {
    id: 267972,
    name: 'Demonic Consumption',
    icon: 'spell_warlock_soulburn',
  },

  // Demonology shard generating effects
  RECURRENT_RITUAL_SHARD_GEN: {
    id: 214811,
    name: 'Recurrent Ritual',
    icon: 'inv_feldreadravenmount',
  },
  SHADOW_BOLT_SHARD_GEN: {
    id: 194192,
    name: 'Shadow Bolt',
    icon: 'spell_shadow_shadowbolt',
  },
  DEMONBOLT_SHARD_GEN: {
    id: 280127,
    name: 'Demonbolt',
    icon: 'spell_warlock_demonbolt',
  },
  DOOM_SHARD_GEN: {
    id: 272728,
    name: 'Doom',
    icon: 'spell_shadow_auraofdarkness',
  },
  SOUL_STRIKE_SHARD_GEN: {
    id: 270557,
    name: 'Soul Strike',
    icon: 'inv_polearm_2h_fellord_04',
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

  // -----------
  // DESTRUCTION
  // -----------

  // Destruction spells
  BACKDRAFT: {
    id: 117828,
    name: 'Backdraft',
    icon: 'ability_warlock_backdraft',
  },
  CHAOS_BOLT: {
    id: 116858,
    name: 'Chaos Bolt',
    icon: 'ability_warlock_chaosbolt',
  },
  CONFLAGRATE: {
    id: 17962,
    name: 'Conflagrate',
    icon: 'spell_fire_fireball',
    manaCost: 200,
  },
  HAVOC: {
    id: 80240,
    name: 'Havoc',
    icon: 'ability_warlock_baneofhavoc',
    manaCost: 400,
  },
  IMMOLATE: {
    id: 348,
    name: 'Immolate',
    icon: 'spell_fire_immolation',
    manaCost: 300,
  },
  IMMOLATE_DEBUFF: {
    id: 157736,
    name: 'Immolate',
    icon: 'spell_fire_immolation',
  },
  INCINERATE: {
    id: 29722,
    name: 'Incinerate',
    icon: 'spell_fire_burnout',
    manaCost: 400,
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
  SUMMON_INFERNAL: {
    id: 1122,
    name: 'Summon Infernal',
    icon: 'spell_shadow_summoninfernal',
  },
  // Infernal summon effect (dmg + stun)
  INFERNAL_AWAKENING: {
    id: 22703,
    name: 'Infernal Awakening',
    icon: 'spell_frost_stun',
  },
  // Infernal aura
  INFERNAL_AURA_DAMAGE: {
    id: 20153,
    name: 'Immolation',
    icon: 'spell_shadow_summoninfernal',
  },

  // Destruction talents
  ERADICATION_DEBUFF: {
    id: 196414,
    name: 'Eradication',
    icon: 'ability_warlock_eradication',
  },
  REVERSE_ENTROPY_BUFF: {
    id: 266030,
    name: 'Reverse Entropy',
    icon: 'ability_warlock_backdraftgreen',
  },
  INTERNAL_COMBUSTION_DAMAGE: {
    id: 266136,
    name: 'Internal Combustion',
    icon: 'ability_mage_livingbomb',
  },
  ROARING_BLAZE_DAMAGE: {
    id: 265931,
    name: 'Roaring Blaze',
    icon: 'ability_warlock_inferno',
  },
  GRIMOIRE_OF_SUPREMACY_BUFF: {
    id: 266091,
    name: 'Grimoire of Supremacy',
    icon: 'warlock_grimoireofcommand',
  },
  CHANNEL_DEMONFIRE_DAMAGE: {
    id: 196448,
    name: 'Channel Demonfire',
    icon: 'spell_fire_ragnaros_lavaboltgreen',
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
};
