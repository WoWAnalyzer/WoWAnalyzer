/**
 * All Demon Hunter abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import Spell from './Spell';

const spells = {
  //region Shared
  GLIDE_DH: {
    id: 131347,
    name: 'Glide',
    icon: 'ability_demonhunter_glide',
  },
  CONSUME_SOUL: {
    id: 228532,
    name: 'Consume Soul',
    icon: 'ability_warlock_improvedsoulleech',
  },
  FELBLADE_DAMAGE: {
    id: 213243,
    name: 'Felblade',
    icon: 'ability_demonhunter_felblade',
  },
  FELBLADE_CHARGE: {
    id: 213241,
    name: 'Felblade',
    icon: 'ability_demonhunter_felblade',
  },
  CHAOS_BRAND: {
    id: 281242,
    name: 'Chaos Brand',
    icon: 'ability_demonhunter_empowerwards',
  },
  // Sigil of Flame, Misery, and Silence have different spell ids depending on
  // if you take the [Concentrated Sigils], [Quickened Sigils], or [Precise Sigils] talents
  SIGIL_OF_FLAME: {
    id: 204596,
    name: 'Sigil of Flame',
    icon: 'ability_demonhunter_sigilofinquisition',
  },
  SIGIL_OF_FLAME_PRECISE: {
    id: 389810,
    name: 'Sigil of Flame',
    icon: 'ability_demonhunter_sigilofinquisition',
  },
  SIGIL_OF_MISERY_PRECISE: {
    id: 389813,
    name: 'Sigil of Misery',
    icon: 'ability_demonhunter_sigilofmisery',
  },
  SIGIL_OF_FLAME_DEBUFF: {
    id: 204598,
    name: 'Sigil of Flame',
    icon: 'ability_demonhunter_sigilofinquisition',
  },
  SIGIL_OF_MISERY_DEBUFF: {
    id: 207685,
    name: 'Sigil of Misery',
    icon: 'ability_demonhunter_sigilofmisery',
  },
  CHARRED_WARBLADES: {
    id: 213011,
    name: 'Charred Warblades',
    icon: 'ability_demonhunter_fierybrand',
  },
  THE_HUNT_CHARGE: {
    id: 370966,
    name: 'The Hunt',
    icon: 'ability_ardenweald_demonhunter',
  },
  THE_HUNT_DOT: {
    id: 370969,
    name: 'The Hunt',
    icon: 'ability_ardenweald_demonhunter',
  },
  THE_HUNT_HEAL: {
    id: 370971,
    name: 'The Hunt',
    icon: 'ability_ardenweald_demonhunter',
  },
  FLAMES_OF_FURY_FURY_GEN: {
    id: 395001,
    name: 'Flames of Fury',
    icon: 'ability_demonhunter_sigilofinquisition',
  },
  DISRUPTING_FURY_FURY_GEN: {
    id: 218903,
    name: 'Disrupt',
    icon: 'ability_demonhunter_consumemagic',
  },
  IMMOLATION_AURA: {
    id: 258920,
    name: 'Immolation Aura',
    icon: 'ability_demonhunter_immolation',
  },
  IMMOLATION_AURA_AFI_CAST: {
    id: 427917,
    name: 'Immolation Aura',
    icon: 'ability_demonhunter_immolation',
  },
  IMMOLATION_AURA_INITIAL_HIT_DAMAGE: {
    id: 258921,
    name: 'Immolation Aura',
    icon: 'ability_demonhunter_immolation',
  },
  IMMOLATION_AURA_BUFF_DAMAGE: {
    id: 258922,
    name: 'Immolation Aura',
    icon: 'ability_demonhunter_immolation',
  },
  IMMOLATION_AURA_AFI_INITIAL_HIT_DAMAGE_1: {
    id: 427904,
    name: 'Immolation Aura',
    icon: 'ability_demonhunter_immolation',
  },
  IMMOLATION_AURA_AFI_INITIAL_HIT_DAMAGE_2: {
    id: 427905,
    name: 'Immolation Aura',
    icon: 'ability_demonhunter_immolation',
  },
  IMMOLATION_AURA_AFI_BUFF_DAMAGE_1: {
    id: 427908,
    name: 'Immolation Aura',
    icon: 'ability_demonhunter_immolation',
  },
  IMMOLATION_AURA_AFI_BUFF_DAMAGE_2: {
    id: 427910,
    name: 'Immolation Aura',
    icon: 'ability_demonhunter_immolation',
  },
  INFERNAL_ARMOR: {
    id: 320344,
    name: 'Infernal Armor',
    icon: 'ability_demonhunter_immolation',
  },
  TORMENT: {
    id: 185245,
    name: 'Torment',
    icon: 'ability_demonhunter_torment',
  },
  SPECTRAL_SIGHT: {
    id: 188501,
    name: 'Spectral Sight',
    icon: 'ability_demonhunter_spectralsight',
  },
  CONSUME_MAGIC: {
    id: 278326,
    name: 'Consume Magic',
    icon: 'spell_misc_zandalari_council_soulswap',
  },
  DISRUPT: {
    id: 183752,
    name: 'Disrupt',
    icon: 'ability_demonhunter_consumemagic',
  },
  SIGIL_OF_SPITE_PRECISE: {
    id: 389815,
    name: 'Sigil of Spite',
    icon: 'ability_bastion_demonhunter',
  },
  SIGIL_OF_SPITE_DAMAGE: {
    id: 389860,
    name: 'Sigil of Spite',
    icon: 'ability_bastion_demonhunter',
  },
  FODDER_TO_THE_FLAME: {
    id: 350570,
    name: 'Fodder to the Flame',
    icon: 'ability_maldraxxus_demonhunter',
  },
  FODDER_TO_THE_FLAME_DAMAGE: {
    id: 350631,
    name: 'Fodder to the Flame',
    icon: 'ability_maldraxxus_demonhunter',
  },
  MASTER_OF_THE_GLAIVE_DEBUFF: {
    id: 213405,
    name: 'Master of the Glaive Debuff',
    icon: 'inv_glaive_1h_demonhunter_a_01',
  },
  DEMON_SOUL_BUFF_NON_FODDER: {
    id: 163073,
    name: 'Demon Soul',
    icon: 'ability_warlock_improvedsoulleech',
  },
  DEMON_SOUL_BUFF_FODDER: {
    id: 347765,
    name: 'Demon Soul',
    icon: 'spell_shadow_soulleech_3',
  },
  //endregion

  //region Vengeance
  // Passive:
  DEMONIC_WARDS: {
    id: 207014,
    name: 'Demonic Wards',
    icon: 'inv_belt_leather_demonhunter_a_01',
  },

  // Abilities:
  FRACTURE_MAIN_HAND: {
    id: 225919,
    name: 'Fracture(Main Hand)',
    icon: 'ability_creature_felsunder',
  },
  FRACTURE_OFF_HAND: {
    id: 225921,
    name: 'Fracture(Off Hand)',
    icon: 'ability_creature_felsunder',
  },
  SHEAR: {
    id: 203782,
    name: 'Shear',
    icon: 'ability_demonhunter_hatefulstrike',
  },
  SOUL_FRAGMENT: {
    id: 204255,
    name: 'Soul Fragment',
    icon: 'spell_shadow_soulgem',
  },
  SOUL_FRAGMENT_KILLING_BLOW: {
    id: 204062,
    name: 'Soul Fragment (from killing blow)',
    icon: 'spell_shadow_soulgem',
  },
  SOUL_FRAGMENT_KILLING_BLOW_2: {
    id: 203795,
    name: 'Soul Fragment (from killing blow)',
    icon: 'spell_shadow_soulgem',
  },
  SOUL_FRAGMENT_FODDER: {
    id: 328957,
    name: 'Soul Fragment',
    icon: 'spell_shadow_soulgem',
  },
  SOUL_FRAGMENT_STACK: {
    id: 203981,
    name: 'Soul Fragment',
    icon: 'spell_shadow_soulgem',
  },
  VOID_REAVER_DEBUFF: {
    id: 268178,
    name: 'Void Reaver Debuff',
    icon: 'spell_shadow_demonicempathy',
  },
  DEMON_SPIKES: {
    id: 203720,
    name: 'Demon Spikes',
    icon: 'ability_demonhunter_demonspikes',
  },
  DEMON_SPIKES_BUFF: {
    id: 203819,
    name: 'Demon Spikes',
    icon: 'ability_demonhunter_demonspikes',
  },
  DEMON_SPIKES_DAMAGE: {
    id: 391159,
    name: 'Demon Spikes',
    icon: 'ability_demonhunter_demonspikes2',
  },
  FIERY_BRAND_DEBUFF: {
    id: 207744,
    name: 'Fiery Brand',
    icon: 'ability_demonhunter_fierybrand',
  },
  METAMORPHOSIS_TANK: {
    id: 187827,
    name: 'Metamorphosis',
    icon: 'ability_demonhunter_metamorphasistank',
  },
  SOUL_CLEAVE: {
    id: 228477,
    name: 'Soul Cleave',
    icon: 'ability_demonhunter_soulcleave',
  },
  SOUL_CLEAVE_DAMAGE: {
    id: 228478,
    name: 'Soul Cleave',
    icon: 'ability_demonhunter_soulcleave',
  },
  INFERNAL_STRIKE: {
    id: 189110,
    name: 'Infernal Strike',
    icon: 'ability_demonhunter_infernalstrike1',
  },
  THROW_GLAIVE_VENGEANCE: {
    id: 204157,
    name: 'Throw Glaive',
    icon: 'ability_demonhunter_throwglaive',
  },
  THROW_GLAIVE_VENGEANCE_DAMAGE: {
    id: 346665,
    name: 'Throw Glaive',
    icon: 'ability_demonhunter_throwglaive',
  },
  // Ticks that Fiery Brand does due to the Burning Alive talent
  FIERY_BRAND_DOT: {
    id: 207771,
    name: 'FIERY_BRAND_DOT',
    icon: 'ability_demonhunter_fierybrand',
  },
  FEAST_OF_SOULS_HEAL: {
    id: 207693,
    name: 'Feast of Souls Heal',
    icon: 'spell_shadow_soulleech',
  },
  CONSUME_SOUL_VDH: {
    id: 203794,
    name: 'Consume Soul',
    icon: 'ability_warlock_improvedsoulleech',
  },
  FRAILTY: {
    id: 247456,
    name: 'Frailty',
    icon: 'inv_icon_shadowcouncilorb_purple',
  },
  SPIRIT_BOMB_DAMAGE: {
    id: 247455,
    name: 'Spirit Bomb',
    icon: 'inv_icon_shadowcouncilorb_purple',
  },
  COLLECTIVE_ANGUISH_EYE_BEAM: {
    id: 391058,
    name: 'Collective Anguish',
    icon: 'artifactability_havocdemonhunter_anguishofthedeceiver',
  },
  COLLECTIVE_ANGUISH_FEL_DEVASTATION: {
    id: 393834,
    name: 'Fel Devastation',
    icon: 'ability_demonhunter_feldevastation',
  },
  PAINBRINGER_BUFF: {
    id: 212988,
    name: 'Painbringer',
    icon: 'artifactability_vengeancedemonhunter_painbringer',
  },
  SIGIL_OF_SILENCE_PRECISE: {
    id: 389809,
    name: 'Sigil of Silence',
    icon: 'ability_demonhunter_sigilofsilence',
  },
  SIGIL_OF_CHAINS_PRECISE: {
    id: 389807,
    name: 'Sigil of Chains',
    icon: 'ability_demonhunter_sigilofchains',
  },
  SIGIL_OF_SILENCE_DEBUFF: {
    id: 204490,
    name: 'Sigil of Silence',
    icon: 'ability_demonhunter_sigilofsilence',
  },
  SIGIL_OF_CHAINS_DEBUFF: {
    id: 204843,
    name: 'Sigil of Chains',
    icon: 'ability_demonhunter_sigilofchains',
  },
  SOUL_CARVER_OFF_HAND: {
    id: 214743,
    name: 'Soul Carver',
    icon: 'inv_glaive_1h_artifactaldrochi_d_01',
  },
  SIGIL_OF_FLAME_T31_PROC: {
    id: 425672,
    name: 'Sigil of Flame',
    icon: 'ability_demonhunter_concentratedsigils',
  },
  //endregion

  //region Havoc
  //spells
  DEMONS_BITE: {
    id: 162243,
    name: "Demon's Bite",
    icon: 'inv_weapon_glave_01',
  },
  CHAOS_STRIKE: {
    id: 162794,
    name: 'Chaos Strike',
    icon: 'ability_demonhunter_chaosstrike',
  },
  CHAOS_STRIKE_ENERGIZE: {
    //This occures due the cycle of hatred talent
    id: 193840,
    name: 'Chaos Strike',
    icon: 'ability_demonhunter_chaosstrike',
  },
  CHAOS_STRIKE_MH_DAMAGE: {
    id: 222031,
    name: 'Chaos Strike',
    icon: 'ability_demonhunter_chaosstrike',
  },
  CHAOS_STRIKE_OH_DAMAGE: {
    id: 199547,
    name: 'Chaos Strike',
    icon: 'ability_demonhunter_chaosstrike',
  },
  ANNIHILATION: {
    id: 201427,
    name: 'Annihilation',
    icon: 'inv_glaive_1h_npc_d_02',
  },
  ANNIHILATION_MH_DAMAGE: {
    id: 227518,
    name: 'Annihilation',
    icon: 'inv_glaive_1h_npc_d_02',
  },
  ANNIHILATION_OH_DAMAGE: {
    id: 201428,
    name: 'Annihilation',
    icon: 'inv_glaive_1h_npc_d_02',
  },
  BLADE_DANCE: {
    id: 188499,
    name: 'Blade Dance',
    icon: 'ability_demonhunter_bladedance',
  },
  BLADE_DANCE_DAMAGE: {
    id: 199552,
    name: 'Blade Dance',
    icon: 'ability_demonhunter_bladedance',
  },
  BLADE_DANCE_DAMAGE_LAST_HIT: {
    id: 200685,
    name: 'Blade Dance',
    icon: 'ability_demonhunter_bladedance',
  },
  DEATH_SWEEP: {
    id: 210152,
    name: 'Death Sweep',
    icon: 'inv_glaive_1h_artifactaldrochi_d_02dual',
  },
  DEATH_SWEEP_DAMAGE: {
    id: 210153,
    name: 'Death Sweep',
    icon: 'inv_glaive_1h_artifactaldrochi_d_02dual',
  },
  DEATH_SWEEP_DAMAGE_LAST_HIT: {
    id: 210155,
    name: 'Death Sweep',
    icon: 'inv_glaive_1h_artifactaldrochi_d_02dual',
  },
  FEL_RUSH_CAST: {
    id: 195072,
    name: 'Fel Rush',
    icon: 'ability_demonhunter_felrush',
  },
  FEL_RUSH_DAMAGE: {
    id: 192611,
    name: 'Fel Rush',
    icon: 'ability_demonhunter_felrush',
  },
  THROW_GLAIVE_HAVOC: {
    id: 185123,
    name: 'Throw Glaive',
    icon: 'ability_demonhunter_throwglaive',
  },
  THROW_GLAIVE_PROC_BLADE_DANCE: {
    id: 337819,
    name: 'Throw Glaive',
    icon: 'ability_demonhunter_throwglaive',
  },
  THROW_GLAIVE_PROC_FURIOUS_THROWS: {
    id: 393035,
    name: 'Throw Glaive',
    icon: 'ability_demonhunter_throwglaive',
  },
  FURIOUS_GAZE: {
    id: 343312,
    name: 'Furious Gaze',
    icon: 'spell_warlock_soulburn',
  },
  METAMORPHOSIS_HAVOC_BUFF: {
    id: 162264,
    name: 'Metamorphosis',
    icon: 'ability_demonhunter_metamorphasisdps',
  },
  METAMORPHOSIS_HAVOC: {
    id: 200166,
    name: 'Metamorphosis',
    icon: 'ability_demonhunter_metamorphasisdps',
  },
  DEMON_BLADES_FURY: {
    id: 203796,
    name: 'Demon Blades',
    icon: 'inv_weapon_shortblade_92',
  },
  BLADE_DANCE_FURY: {
    id: 245862,
    name: 'Blade Dance',
    icon: 'ability_demonhunter_bladedance',
  },
  FEL_ERUPTION: {
    id: 211881,
    name: 'Fel Eruption',
    icon: 'ability_bossfellord_felspike',
  },

  // Havoc Talents
  DEMONIC_APPETITE_FURY: {
    //Generates Fury for the Demonic Appetite talent
    id: 210041,
    name: 'Demonic Appetite',
    icon: 'spell_misc_zandalari_council_soulswap',
  },
  MOMENTUM_BUFF: {
    id: 208628,
    name: 'Momentum',
    icon: 'ability_foundryraid_demolition',
  },
  TRAIL_OF_RUIN_DAMAGE: {
    id: 258883,
    name: 'Trail of Ruin',
    icon: 'ability_demonhunter_bladedance',
  },
  FEL_BARRAGE_DAMAGE: {
    id: 258926,
    name: 'Fel Barrage',
    icon: 'inv_felbarrage',
  },
  ESSENCE_BREAK_DAMAGE: {
    id: 320338,
    name: 'Essence Break',
    icon: 'spell_shadow_ritualofsacrifice',
  },
  GLAIVE_TEMPEST_DAMAGE: {
    id: 342857,
    name: 'Glaive Tempest',
    icon: 'inv_glaive_1h_artifactazgalor_d_06dual',
  },
  UNBOUND_CHAOS_BUFF: {
    id: 347462,
    name: 'Unbound Chaos',
    icon: 'artifactability_vengeancedemonhunter_painbringer',
  },
  CHAOS_THEORY: {
    id: 337551,
    name: 'Chaos Theory',
    icon: 'inv_glaive_1h_artifactaldrochi_d_03dual',
  },
  CHAOS_THEORY_BUFF: {
    id: 390195,
    name: 'Chaotic Blades',
    icon: 'inv_glaive_1h_artifactaldrochi_d_03dual',
  },
  BURNING_WOUND: {
    id: 346279,
    name: 'Burning Wound',
    icon: 'spell_fire_felhellfire',
  },
  FEL_BOMBARDMENT: {
    id: 337775,
    name: 'Fel Bombardment',
    icon: 'inv_misc_head_dragon_blue_nightmare',
  },
  TACTICAL_RETREAT_BUFF: {
    id: 389890,
    name: 'Tactical Retreat',
    icon: 'ability_demonhunter_vengefulretreat2',
  },
  INITIATIVE_BUFF: {
    id: 391215,
    name: 'Initiative',
    icon: 'ability_rogue_surpriseattack',
  },
  SOULSCAR: {
    id: 390181,
    name: 'Soulrend',
    icon: 'ability_demonhunter_bloodlet',
  },
  BLUR: {
    id: 198589,
    name: 'Blur',
    icon: 'ability_demonhunter_blur',
  },
  BLUR_BUFF: {
    id: 212800,
    name: 'Blur',
    icon: 'ability_demonhunter_blur',
  },
  FEL_DEVASTATION_DAMAGE: {
    id: 212105,
    name: 'Fel Devastation',
    icon: 'ability_demonhunter_feldevastation',
  },
  RAGEFIRE: {
    id: 390197,
    name: 'Ragefire',
    icon: 'spell_fire_fireballgreen',
  },
  INNER_DEMON: {
    id: 390137,
    name: 'Inner Demon',
    icon: 'spell_deathknight_plaguestrike',
  },
  INNER_DEMON_BUFF: {
    id: 390145,
    name: 'Inner Demon',
    icon: 'ability_demonhunter_glide',
  },
  EYE_BEAM_DAMAGE: {
    id: 198030,
    name: 'Eye Beam',
    icon: 'ability_demonhunter_eyebeam',
  },
  //endregion

  //region Aldrachi Reaver
  REAVERS_GLAIVE: {
    id: 442294,
    name: "Reaver's Glaive",
    icon: 'inv_ability_aldrachireaverdemonhunter_reaversglaive',
  },
  THRILL_OF_THE_FIGHT_ATTACK_SPEED_BUFF: {
    id: 442695,
    name: 'Thrill of the Fight',
    icon: 'spell_arcane_arcanetactics',
  },
  THRILL_OF_THE_FIGHT_DAMAGE_BUFF: {
    id: 442688,
    name: 'Thrill of the Fight',
    icon: 'spell_mage_overpowered',
  },
  GLAIVE_FLURRY: {
    id: 442435,
    name: 'Glaive Flurry',
    icon: 'spell_holy_blessingofstrength',
  },
  RENDING_STRIKE: {
    id: 442442,
    name: 'Rending Strike',
    icon: 'ability_bossmannoroth_glaivethrust',
  },
  ART_OF_THE_GLAIVE: {
    id: 444806,
    name: 'Art of the Glaive',
    icon: 'ability_glaivetoss',
  },
  WOUNDED_QUARRY: {
    id: 442808,
    name: 'Wounded Quarry',
    icon: 'ability_rogue_venomouswounds',
  },
  WARBLADES_HUNGER: {
    id: 442507,
    name: "Warblade's Hunger",
    icon: 'spell_holy_blessingofstrength',
  },
  //endregion

  //region Fel-scarred
  CONSUMING_FIRE_1: {
    id: 456640,
    name: 'Consuming Fire',
    icon: 'spell_fire_felfire',
  },
  CONSUMING_FIRE_2: {
    id: 452487,
    name: 'Consuming Fire',
    icon: 'spell_fire_felfire',
  },
  SPIRIT_BURST: {
    id: 452437,
    name: 'Spirit Burst',
    icon: 'sha_spell_shaman_lavaburst_nightborne',
  },
  SOUL_SUNDER: {
    id: 452436,
    name: 'Soul Sunder',
    icon: 'ability_demonhunter_soulcleave4',
  },
  SIGIL_OF_DOOM_CAST: {
    id: 452490,
    name: 'Sigil of Doom',
    icon: 'ability_bossfelorcs_necromancer_red',
  },
  SIGIL_OF_DOOM_DAMAGE: {
    id: 462030,
    name: 'Sigil of Doom',
    icon: 'ability_bossfelorcs_necromancer_red',
  },
  FEL_DESOLATION: {
    id: 452486,
    name: 'Fel Desolation',
    icon: 'spell_fire_felflamebreath',
  },
  ABYSSAL_GAZE: {
    id: 452497,
    name: 'Abyssal Gaze',
    icon: 'spell_shadow_demonicfortitude',
  },
  DEMONSURGE: {
    id: 452416,
    name: 'Demonsurge',
    icon: 'inv_ability_felscarreddemonhunter_demonsurge',
  },
  STUDENT_OF_SUFFERING: {
    id: 453239,
    name: 'Student of Suffering',
    icon: 'achievement_dungeon_theatreofpain_kultharok',
  },
  //endregion
} satisfies Record<string, Spell>;

export default spells;
