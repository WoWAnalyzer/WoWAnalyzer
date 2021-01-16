/**
 * All Demon Hunter abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

const spells = {
  // Common Spells
  GLIDE: {
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

  // Vengeance
  // Passive:
  DEMONIC_WARDS: {
    id: 207014,
    name: 'Demonic Wards',
    icon: 'inv_belt_leather_demonhunter_a_01',
  },
  SEVER: {
    id: 235964,
    name: 'Sever',
    icon: 'ability_demonhunter_manabreak',
  },
  CHAOS_BRAND: {
    id: 281242,
    name: 'Chaos Brand',
    icon: 'ability_demonhunter_empowerwards',
  },

  // Abilities:
  FEL_DEVASTATION: {
	  id: 212084,
	  name: "Fel Devastation",
	  icon: "ability_demonhunter_feldevastation",
  },
  FRACTURE_MAIN_HAND: {
    id: 225919,
    name: "Fracture(Main Hand)",
    icon: "ability_creature_felsunder",
  },
  FRACTURE_OFF_HAND: {
    id: 225921,
    name: "Fracture(Off Hand)",
    icon: "ability_creature_felsunder",
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
    name: 'Soul Fragment(from killing blow)',
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
  //Sigil of Flame, Misery, and Silence have different spell ids depending on
  //if you take the [Concentrated Sigils] or [Quickened Sigils] talents
  SIGIL_OF_FLAME_CONCENTRATED: {
    id: 204513,
    name: 'Sigil of Flame',
    icon: 'ability_demonhunter_sigilofinquisition',
  },
  SIGIL_OF_MISERY_CONCENTRATED: {
    id: 202140,
    name: 'Sigil of Misery',
    icon: 'ability_demonhunter_sigilofmisery',
  },
  SIGIL_OF_SILENCE_CONCENTRATED: {
    id: 207682,
    name: 'Sigil of Silence',
    icon: 'ability_demonhunter_sigilofsilence',
  },
  SIGIL_OF_FLAME_QUICKENED: {
    id: 204596,
    name: 'Sigil of Flame',
    icon: 'ability_demonhunter_sigilofinquisition',
  },
  SIGIL_OF_MISERY_QUICKENED: {
    id: 207684,
    name: 'Sigil of Misery',
    icon: 'ability_demonhunter_sigilofmisery',
  },
  SIGIL_OF_SILENCE_QUICKENED: {
    id: 202137,
    name: 'Sigil of Silence',
    icon: 'ability_demonhunter_sigilofsilence',
  },
  SIGIL_OF_FLAME_DEBUFF: {
    id: 204598,
    name: 'Sigil of Flame',
    icon: 'ability_demonhunter_sigilofinquisition',
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
  FIERY_BRAND: {
    id: 204021,
    name: 'Fiery Brand',
    icon: 'ability_demonhunter_fierybrand',
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
  IMMOLATION_AURA: {
    id: 258920,
    name: 'Immolation Aura',
    icon: 'ability_demonhunter_immolation',
  },
  IMMOLATION_AURA_INITIAL_HIT_DAMAGE: {
    id: 258921,
    name: 'Immolation Aura First Strike',
    icon: 'ability_demonhunter_immolation',
  },
  IMMOLATION_AURA_BUFF_DAMAGE: {
    id: 258922,
    name: 'Immolation Aura Second Strike',
    icon: 'ability_demonhunter_immolation',
  },
  INFERNAL_STRIKE: {
    id: 189110,
    name: 'Infernal Strike',
    icon: 'ability_demonhunter_infernalstrike1',
  },
  THROW_GLAIVE: {
    id: 204157,
    name: 'Throw Glaive',
    icon: 'ability_demonhunter_throwglaive',
  },
  TORMENT: {
    id: 185245,
    name: 'Torment',
    icon: 'ability_demonhunter_torment',
  },
  IMPRISON: {
    id: 217832,
    name: 'Imprison',
    icon: 'ability_demonhunter_imprison',
  },
  SPECTRAL_SIGHT: {
    id: 188501,
    name: 'Spectral Sight',
    icon: 'ability_demonhunter_spectralsight',
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
  FRAILTY_SPIRIT_BOMB_DEBUFF: {
    id: 247456,
    name: 'Frailty',
    icon: 'inv_icon_shadowcouncilorb_purple',
  },
  SPIRIT_BOMB_DAMAGE: {
    id: 247455,
    name: 'Spirit Bomb',
    icon: 'inv_icon_shadowcouncilorb_purple',
  },

  // Havoc
  //spells
  DEMONS_BITE: {
    id: 162243,
    name: 'Demon\'s Bite',
    icon: 'inv_weapon_glave_01',
  },
  CHAOS_STRIKE: {
    id: 162794,
    name: 'Chaos Strike',
    icon: 'ability_demonhunter_chaosstrike',
  },
  CHAOS_STRIKE_ENERGIZE: { //This occures due the cycle of hatred talent
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
  DEATH_SWEEP: {
    id: 210152,
    name: 'Death Sweep',
    icon: 'inv_glaive_1h_artifactaldrochi_d_02dual',
  },
  DEATH_SWEEP_DAMAGE: {
    id: 210153,
    name : 'Death Sweep',
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
  EYE_BEAM: {
    id: 198013,
    name: 'Eye Beam',
    icon: 'ability_demonhunter_eyebeam',
  },
  EYE_BEAM_DAMAGE: {
    id: 198030,
    name: 'Eye Beam',
    icon: 'ability_demonhunter_eyebeam',
  },
  FURY_OF_THE_ILLIDARI: {
    id: 201467,
    name: 'Fury of the Illidari',
    icon: 'inv_glaive_1h_artifactazgalor_d_01',
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
  CONSUME_MAGIC_FURY_GEN: {
    id: 218903,
    name: 'Consume Magic',
    icon: 'ability_demonhunter_consumemagic',
  },
  VENGEFUL_RETREAT: {
    id: 198793,
    name: 'Vengeful Retreat',
    icon: 'ability_demonhunter_vengefulretreat2',
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
  BLUR: {
    id: 198589,
    name: 'Blur',
    icon: 'ability_demonhunter_blur',
  },
  DARKNESS: {
    id: 196718,
    name: 'Darkness',
    icon: 'ability_demonhunter_darkness',
  },
  CHAOS_NOVA: {
    id: 179057,
    name: 'Chaos Nova',
    icon: 'spell_fire_felfirenova',
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
  PREPARED_FURY: {
    id: 203650,
    name: 'Prepared',
    icon: 'ability_demonhunter_vengefulretreat',
  },
  DECEIVERS_FURY_FURY: {
    id: 202120,
    name: 'Deceiver\'s Fury',
    icon: 'ability_demonhunter_blur',
  },

  // Havoc Talents
  DEMONIC_APPETITE_FURY: { //Generates Fury for the Demonic Appetite talent
    id: 210041,
    name: 'Demonic Appetite',
    icon: 'spell_misc_zandalari_council_soulswap',
  },
  CHAOS_CLEAVE_DAMAGE: {
    id: 236237,
    name: 'Chaos Cleave',
    icon: 'inv_weapon_shortblade_62',
  },
  NEMESIS_DEMON: {
    id: 208579,
    name: 'Nemesis',
    icon: 'spell_shadow_demonicfortitude',
  },
  NEMESIS_HUMANOID: {
    id: 208605,
    name: 'Nemesis',
    icon: 'inv_misc_head_human_01',
  },
  NEMESIS_ABERRATION: {
    id: 208607,
    name: 'Nemesis',
    icon: 'ability_shawaterelemental_swirl',
  },
  NEMESIS_BEAST: {
    id: 208608,
    name: 'Nemesis',
    icon: 'inv_misc_head_tiger_01',
  },
  NEMESIS_CRITTER: {
    id: 208609,
    name: 'Nemesis',
    icon: 'inv_pet_mouse',
  },
  NEMESIS_DRAGONKIN: {
    id: 208610,
    name: 'Nemesis',
    icon: 'inv_misc_head_dragon_green',
  },
  NEMESIS_ELEMENTAL: {
    id: 208611,
    name: 'Nemesis',
    icon: 'spell_fire_elemental_totem',
  },
  NEMESIS_GIANT: {
    id: 208612,
    name: 'Nemesis',
    icon: 'achievement_dungeon_ulduarraid_icegiant_01',
  },
  NEMESIS_MECHANICAL: {
    id: 208613,
    name: 'Nemesis',
    icon: 'inv_pet_mechanicalbearcub',
  },
  NEMESIS_UNDEAD: {
    id: 208614,
    name: 'Nemesis',
    icon: 'spell_holy_senseundead',
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
  MASTER_OF_THE_GLAIVE_DEBUFF: {
    id: 213405,
    name: 'Master of the Glaive Debuff',
    icon: 'inv_glaive_1h_demonhunter_a_01',
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
} as const;

export default spells;
