/**
 * All Warlock abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */
import Spell from 'common/SPELLS/Spell';

const spells = {
  // -------------
  // Shared spells
  // -------------
  SOUL_SHARDS: {
    id: 246985,
    name: 'Soul Shards',
    icon: 'inv_misc_gem_amethyst_02',
  },
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
  SUBJUGATE_DEMON: {
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
  CURSE_OF_TONGUES: {
    id: 1714,
    name: 'Curse of Tongues',
    icon: 'spell_shadow_curseoftounges',
  },
  CURSE_OF_WEAKNESS: {
    id: 702,
    name: 'Curse of Weakness',
    icon: 'spell_shadow_curseofmannoroth',
  },
  CURSE_OF_EXHAUSTION: {
    id: 334275,
    name: 'Curse of Exhaustion',
    icon: 'spell_shadow_grimward',
  },
  FEL_DOMINATION: {
    id: 333889,
    name: 'Fel Domination',
    icon: 'spell_shadow_felmending',
  },
  DEMONIC_CIRCLE: {
    id: 268358,
    name: 'Demonic Circle',
    icon: 'spell_shadow_demoniccirclesummon',
    manaCost: 2000,
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

  // Permanent pet damage abilities
  IMP_FIREBOLT: {
    id: 3110,
    name: 'Firebolt',
    icon: 'spell_fire_firebolt',
  },
  VOIDWALKER_CONSUMING_SHADOWS: {
    id: 3716,
    name: 'Consuming Shadows',
    icon: 'spell_shadow_gathershadows',
  },
  FELHUNTER_SHADOW_BITE: {
    id: 54049,
    name: 'Shadow Bite',
    icon: 'spell_shadow_soulleech_3',
  },
  SUCCUBUS_LASH_OF_PAIN: {
    id: 7814,
    name: 'Lash of Pain',
    icon: 'spell_shadow_curse',
  },
  FELGUARD_LEGION_STRIKE: {
    id: 30213,
    name: 'Legion Strike',
    icon: 'inv_axe_09',
  },
  FELGUARD_PURSUIT: {
    id: 30153,
    name: 'Pursuit',
    icon: 'ability_rogue_sprint',
  },

  // --------------
  // Shared talents
  // --------------

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
  // this shows up on logs as a player cast but is fully automatic
  INQUISITORS_GAZE_CAST: {
    id: 400185,
    name: 'Fel Barrage',
    icon: 'ability_felarakkoa_feldetonation_green',
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
  SHADOW_BOLT_AFFLI: {
    id: 232670,
    name: 'Shadow Bolt',
    icon: 'spell_shadow_shadowbolt',
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
  UNSTABLE_AFFLICTION: {
    id: 316099,
    name: 'Unstable Affliction',
    icon: 'spell_shadow_unstableaffliction_3',
  },
  MALEFIC_RAPTURE: {
    id: 324536,
    name: 'Malefic Rapture',
    icon: 'ability_warlock_everlastingaffliction',
  },

  // Affliction talents
  DREAD_TOUCH_DEBUFF: {
    id: 389868,
    name: 'Dread Touch',
    icon: 'ability_priest_touchofdecay',
  },
  INEVITABLE_DEMISE_BUFF: {
    id: 334320,
    name: 'Inevitable Demise',
    icon: 'spell_warlock_harvestoflife',
  },
  MALEFIC_AFFLICTION_BUFF: {
    id: 389845,
    name: 'Malefic Affliction',
    icon: 'spell_shadow_unstableaffliction_3_purple',
  },
  NIGHTFALL_BUFF: {
    id: 264571,
    name: 'Nightfall',
    icon: 'spell_shadow_twilight',
  },
  PANDEMIC_INVOCATION_HIT: {
    id: 386760,
    name: 'Pandemic Invocation',
    icon: 'spell_shadow_unsummonbuilding',
  },
  PHANTOM_SINGULARITY_DAMAGE_HEAL: {
    id: 205246,
    name: 'Phantom Singularity',
    icon: 'inv_enchant_voidsphere',
  },
  SHADOW_EMBRACE_SOULDRAIN_DEBUFF: {
    id: 32390,
    name: 'Shadow Embrace',
    icon: 'spell_shadow_shadowembrace',
  },
  SHADOW_EMBRACE_SHADOWBOLT_DEBUFF: {
    id: 453206,
    name: 'Shadow Embrace',
    icon: 'spell_shadow_shadowembrace',
  },
  TORMENTED_CRESCENDO_BUFF: {
    id: 387079,
    name: 'Tormented Crescendo',
    icon: 'warlock_curse_shadow',
  },
  VILE_TAINT_DEBUFF: {
    id: 386931,
    name: 'Vile Taint',
    icon: 'sha_spell_shadow_shadesofdarkness_nightborne',
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
  DRAIN_SOUL_DEBUFF: {
    id: 198590,
    name: 'Drain Soul',
    icon: 'spell_shadow_haunting',
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
  PANDEMIC_INVOCATION_SHARD_GEN: {
    id: 386762,
    name: 'Pandemic Invocation',
    icon: 'spell_shadow_unsummonbuilding',
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
    name: "Hand of Gul'dan",
    icon: 'ability_warlock_handofguldan',
  },
  HAND_OF_GULDAN_DAMAGE: {
    id: 86040,
    name: "Hand of Gul'dan",
    icon: 'ability_warlock_handofguldan',
  },
  IMPLOSION_CAST: {
    id: 196277,
    name: 'Implosion',
    icon: 'inv_implosion',
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
  },
  // Demonic Tyrant buff on player
  DEMONIC_POWER: {
    id: 265273,
    name: 'Demonic Power',
    icon: 'achievement_boss_argus_maleeredar',
  },
  FEL_COVENANT_BUFF: {
    id: 387437,
    name: 'Fel Covenant',
    icon: 'spell_shadow_detectinvisibility',
  },
  POWER_SIPHON_BUFF: {
    id: 334581,
    name: 'Power Siphon',
    icon: 'ability_warlock_backdraft',
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
  // also important for Dreadlash talent
  DREADBITE: {
    id: 271971,
    name: 'Dreadbite',
    icon: 'spell_warlock_calldreadstalkers',
  },
  SHARPENED_DREADFANGS: {
    id: 215111,
    name: 'Sharpened Dreadfangs',
    icon: 'inv_feldreadravenmount',
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
  CHARHOUND_SUMMON: {
    id: 455476,
    name: 'Summon Charhound',
    icon: 'inv_felhound3_shadow_fire',
  },
  GLOOMHOUND_SUMMON: {
    id: 455465,
    name: 'Summon Gloomhound',
    icon: 'inv_felhound3_shadow_mount',
  },
  IMP_SINGE_MAGIC: {
    id: 119905,
    name: 'Singe Magic',
    icon: 'spell_fire_elementaldevastation.jpg',
  },
  // Inner Demons pet abilities
  INNER_DEMONS_EYE_OF_GULDAN: {
    id: 272131,
    name: "Eye of Gul'dan",
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
  NETHER_PORTAL_BUFF: {
    id: 267218,
    name: 'Nether Portal',
    icon: 'inv_netherportal',
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
  DEMONIC_CONSUMPTION_CAST: {
    id: 267971,
    name: 'Demonic Consumption(cast)',
    icon: 'spell_warlock_soulburn',
  },
  SHADOWS_BITE_BUFF: {
    id: 387327,
    name: "Shadow's Bite",
    icon: 'spell_shadow_painspike',
  },
  DREAD_CALLING_BUFF: {
    id: 387393,
    name: 'Dread Calling',
    icon: 'inv-felhound3-shadow-mount',
  },

  // Hellcaller hero talent
  WITHER_CAST: {
    id: 445468,
    name: 'Wither',
    icon: 'inv_ability_hellcallerwarlock_wither',
  },
  WITHER_DEBUFF: {
    id: 445474,
    name: 'Wither',
    icon: 'inv_ability_hellcallerwarlock_wither',
  },
  MALEVOLENCE: {
    id: 442726,
    name: 'Malevolence',
    icon: 'inv_ability_hellcallerwarlock_malevolence',
  },
  MALEVOLENCE_DAMAGE: {
    id: 446285,
    name: 'Malevolence',
    icon: 'spell_shadow_demonform',
  },
  CURSE_OF_THE_SATYR: {
    id: 440057,
    name: 'Curse of the Satyr',
    icon: 'inv_fabric_felrag',
  },

  // Diabolist hero talent
  INFERNAL_BOLT: {
    id: 434506,
    name: 'Infernal Bolt',
    icon: 'spell_fel_firebolt',
  },
  RUINATION_CAST: {
    id: 434635,
    name: 'Ruination',
    icon: 'spell_fire_felflamestrike',
  },
  RUINATION_DAMAGE: {
    id: 434636,
    name: 'Ruination',
    icon: 'spell_fire_felflamestrike',
  },
  FELSEEKER_DAMAGE: {
    id: 434404,
    name: 'Felseeker',
    icon: 'spell_fel_elementaldevastation',
  },
  WICKED_CLEAVE_DAMAGE: {
    id: 432120,
    name: 'Wicked Cleave',
    icon: 'inv_axe_2h_felfireraid_d_01',
  },
  CHAOS_SALVO_DAMAGE: {
    id: 432596,
    name: 'Chaos Salvo',
    icon: 'spell_fire_felpyroblast',
  },

  // Demonology shard generating effects
  SHADOW_BOLT_SHARD_GEN: {
    id: 194192,
    name: 'Shadow Bolt',
    icon: 'spell_shadow_shadowbolt',
  },
  DEMONBOLT_SHARD_GEN: {
    id: 280127,
    name: 'Demonbolt',
    icon: 'inv__demonbolt',
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
  DEMONIC_METEOR_SHARD_GEN: {
    id: 281592,
    name: 'Demonic Meteor', // Wowhead shows a spell Soul Shard with SS icon, that doesn't explain anything
    icon: 'ability_warlock_handofguldan', // this at least fixes the SpellLink, if not the tooltip
  },

  // Demonology pet summons (ability IDs from 'summon' events)
  WILD_IMP_HOG_SUMMON: {
    id: 104317,
    name: 'Wild Imp',
    icon: 'ability_warlock_impoweredimp',
  },
  DREADSTALKER_SUMMON_1: {
    id: 193331,
    name: 'Call Dreadstalkers',
    icon: 'spell_warlock_calldreadstalkers',
  },
  DREADSTALKER_SUMMON_2: {
    id: 193332,
    name: 'Call Dreadstalkers',
    icon: 'spell_warlock_calldreadstalkers',
  },
  WILD_IMP_ID_SUMMON: {
    id: 279910,
    name: 'Wild Imp',
    icon: 'ability_warlock_impoweredimp',
  },
  BILESCOURGE_SUMMON: {
    id: 267992,
    name: 'Summon Bilescourge',
    icon: 'ability_hunter_pet_bat',
  },
  VICIOUS_HELLHOUND_SUMMON: {
    id: 267988,
    name: 'Summon Vicious Hellhound',
    icon: 'inv_felhound3_shadow_fire',
  },
  SHIVARRA_SUMMON: {
    id: 267994,
    name: 'Summon Shivarra',
    icon: 'achievement_shivan',
  },
  DARKHOUND_SUMMON: {
    id: 267996,
    name: 'Summon Darkhound',
    icon: 'inv_felhound3_shadow_mount',
  },
  ILLIDARI_SATYR_SUMMON: {
    id: 267987,
    name: 'Summon Illidari Satyr',
    icon: 'classicon_warlock',
  },
  VOID_TERROR_SUMMON: {
    id: 267991,
    name: 'Summon Void Terror',
    icon: 'inv_pet_voidhound',
  },
  URZUL_SUMMON: {
    id: 268001,
    name: "Summon Ur'zul",
    icon: 'inv_soulhoundmount_blue',
  },
  WRATHGUARD_SUMMON: {
    id: 267995,
    name: 'Summon Wrathguard',
    icon: 'spell_warlock_summonwrathguard',
  },
  EYE_OF_GULDAN_SUMMON: {
    id: 267989,
    name: "Summon Eyes of Gul'dan",
    icon: 'inv_pet_inquisitoreye',
  },
  PRINCE_MALCHEZAAR_SUMMON: {
    id: 267986,
    name: 'Summon Prince Malchezaar',
    icon: 'achievement_boss_princemalchezaar_02',
  },
  MOTHER_OF_CHAOS_SUMMON: {
    id: 428565,
    name: 'Summon Mother of Chaos',
    icon: 'achievement-boss-argus-shivan',
  },
  PIT_LORD_SUMMON: {
    id: 434400,
    name: 'Summon Pit Lord',
    icon: 'Ability_bossmannoroth_empoweredmannorothsgaze',
  },
  OVERLORD_SUMMON: {
    id: 428571,
    name: 'Summon Overlord',
    icon: 'ability_creature_felfrenzy',
  },
  // Glyphed permanent pet summons
  FEL_IMP_SUMMON: {
    id: 112866,
    name: 'Summon Fel Imp',
    icon: 'spell_warlock_summonimpoutland',
  },
  VOIDLORD_SUMMON: {
    id: 112867,
    name: 'Summon Voidlord',
    icon: 'warlock_summon_-voidlord',
  },
  OBSERVER_SUMMON: {
    id: 112869,
    name: 'Summon Observer',
    icon: 'warlock_summon_-beholder',
  },
  SHADOW_SUCCUBUS_SUMMON: {
    id: 240266,
    name: 'Summon Shadow Succubus',
    icon: 'spell_shadow_summonsuccubus',
  },
  SHIVARRA_PERMANENT_SUMMON: {
    id: 112868,
    name: 'Summon Shivarra',
    icon: 'warlock_summon_-shivan',
  },
  WRATHGUARD_PERMANENT_SUMMON: {
    id: 112870,
    name: 'Summon Wrathguard',
    icon: 'spell_warlock_summonwrathguard',
  },

  // Tier set bonuses
  BLAZING_METEOR: {
    id: 394776,
    name: 'Blazing Meteor',
    icon: 'ability_warlock_handofguldan',
  },
  // T31 Amirdrassil
  DOOM_BRAND_DAMAGE: {
    id: 423584,
    name: 'Doom Brand',
    icon: 'spell_warlock_demonwrath',
  },
  DOOM_BRAND_DEBUFF: {
    id: 423583,
    name: 'Doom Brand',
    icon: 'spell_warlock_demonwrath',
  },
  DOOMFIEND_SUMMON: {
    id: 423585,
    name: 'Doomfiend',
    icon: 'warlock_summon_doomguard',
  },
  DOOMFIEND_DOOM_BOLT_VOLLEY: {
    id: 423734,
    name: 'Doom Bolt Volley',
    icon: 'spell_shadow_shadowbolt',
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
  },
  HAVOC: {
    id: 80240,
    name: 'Havoc',
    icon: 'ability_warlock_baneofhavoc',
  },
  IMMOLATE: {
    id: 348,
    name: 'Immolate',
    icon: 'spell_fire_immolation',
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
  ROLLING_HAVOC_BUFF: {
    id: 387570,
    name: 'Rolling Havoc',
    icon: 'warlock_pvp_banehavoc',
  },
  MADNESS_OF_AZJAQIR_CHAOS_BOLT_BUFF: {
    id: 387409,
    name: "Madness of the Azj'Aqir",
    icon: 'ability_warlock_chaosbolt',
  },
  MADNESS_OF_AZJAQIR_RAIN_OF_FIRE_BUFF: {
    id: 387413,
    name: "Madness of the Azj'Aqir",
    icon: 'spell_shadow_rainoffire',
  },
  MADNESS_OF_AZJAQIR_SHADOWBURN_BUFF: {
    id: 387414,
    name: "Madness of the Azj'Aqir",
    icon: 'spell_shadow_scourgebuild',
  },
  FLASHPOINT_BUFF: {
    id: 387263,
    name: 'Flashpoint',
    icon: 'spell_fire_moltenblood',
  },
  BURN_TO_ASHES_BUFF: {
    id: 387154,
    name: 'Burn to Ashes',
    icon: 'ability_racial_forgedinflames',
  },
} satisfies Record<string, Spell>;

export default spells;
