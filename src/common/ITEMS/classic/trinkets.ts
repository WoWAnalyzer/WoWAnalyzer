import { Trinket } from 'common/ITEMS/Item';

const trinkets = {
  // id = item id
  // --------
  // PHASE 1
  // --------
  DARKMOON_CARD_BERSERKER: {
    id: 42989,
    name: 'Darkmoon Card: Berserker!',
    icon: 'inv_inscription_tarotberserker',
    buffs: [{ id: 60196, name: 'Berserker!' }],
  },
  DARKMOON_CARD_DEATH: {
    id: 42990,
    name: 'Darkmoon Card: Death',
    icon: 'inv_inscription_tarotdeath',
    buffs: [{ id: 60203, name: 'Darkmoon Card: Death' }],
  },
  DARKMOON_CARD_GREATNESS_AGILITY: {
    id: 44253,
    name: 'Darkmoon Card: Greatness',
    icon: 'inv_inscription_tarotgreatness',
    buffs: [{ id: 60233, name: 'Greatness' }],
  },
  DARKMOON_CARD_GREATNESS_INTELLECT: {
    id: 44255,
    name: 'Darkmoon Card: Greatness',
    icon: 'inv_inscription_tarotgreatness',
    buffs: [{ id: 60234, name: 'Greatness' }],
  },
  DARKMOON_CARD_GREATNESS_SPIRIT: {
    id: 44254,
    name: 'Darkmoon Card: Greatness',
    icon: 'inv_inscription_tarotgreatness',
    buffs: [{ id: 60235, name: 'Greatness' }],
  },
  DARKMOON_CARD_GREATNESS_STRENGTH: {
    id: 42987,
    name: 'Darkmoon Card: Greatness',
    icon: 'inv_inscription_tarotgreatness',
    buffs: [{ id: 60229, name: 'Greatness' }],
  },
  DARKMOON_CARD_ILLUSION: {
    id: 42988,
    name: 'Darkmoon Card: Illusion',
    icon: 'inv_inscription_tarotillusion',
    buffs: [{ id: 57350, name: 'Illusionary Barrier', spellId: 57350 }],
  },
  DYING_CURSE: {
    id: 40255,
    name: 'Dying Curse',
    icon: 'inv_trinket_naxxramas03',
    buffs: [{ id: 60494, name: 'Dying Curse' }],
  },
  EMBRACE_OF_THE_SPIDER: {
    id: 39229,
    name: 'Embrace of the Spider',
    icon: 'inv_trinket_naxxramas04',
    buffs: [{ id: 60492, name: 'Embrace of the Spider' }],
  },
  FIGURINE_SAPPHIRE_OWL: {
    id: 42413,
    name: 'Figurine - Sapphire Owl',
    icon: 'inv_jewelcrafting_azureowl',
    buffs: [{ id: 56186, name: 'Sapphire Owl', spellId: 56186 }],
  },
  FORGE_EMBER: {
    id: 37660,
    name: 'Forge Ember',
    icon: 'spell_fire_fire',
    buffs: [{ id: 60479, name: 'Forge Ember' }],
  },
  GRIM_TOLL: {
    id: 40256,
    name: 'Grim Toll',
    icon: 'inv_trinket_naxxramas04',
    buffs: [{ id: 60437, name: 'Grim Toll' }],
  },
  ILLUSTRATION_OF_THE_DRAGON_SOUL: {
    id: 40432,
    name: 'Illustration of the Dragon Soul',
    icon: 'inv_offhand_hyjal_d_01',
    buffs: [{ id: 60486, name: 'Illustration of the Dragon Soul' }],
  },
  JETZES_BELL: {
    id: 37835,
    name: "Je'Tze's Bell",
    icon: 'inv_misc_bell_01',
    buffs: [{ id: 49623, name: 'Effervescence' }],
  },
  LOATHEBS_SHADOW: {
    id: 39257,
    name: "Loatheb's Shadow",
    icon: 'inv_trinket_naxxramas03',
    buffs: [{ id: 60439, name: "Loatheb's Shadow", spellId: 60439 }],
  },
  MARK_OF_NORGANNON: {
    id: 40531,
    name: 'Mark of Norgannon',
    icon: 'ability_hunter_readiness',
    buffs: [{ id: 60319, name: 'Mark of Norgannon' }],
  },
  MARK_OF_THE_WAR_PRISONER: {
    id: 37873,
    name: 'Mark of the War Prisoner',
    icon: 'inv_jewelry_talisman_13',
    buffs: [{ id: 60480, name: 'Mark of the War Prisoner' }],
  },
  METEORITE_WHETSTONE: {
    id: 37390,
    name: 'Meteorite Whetstone',
    icon: 'inv_misc_stonetablet_02',
    buffs: [{ id: 60302, name: 'Meteorite Whetstone' }],
  },
  MIRROR_OF_TRUTH: {
    id: 40684,
    name: 'Mirror of Truth',
    icon: 'inv_jewelry_talisman_08',
    buffs: [{ id: 60065, name: 'Reflection of Torment' }],
  },
  SOUL_PRESERVER: {
    id: 37111,
    name: 'Soul Preserver',
    icon: 'inv_misc_orb_03',
    buffs: [{ id: 60513, name: 'Healing Trance' }],
  },
  SUNDIAL_OF_THE_EXILED: {
    id: 40682,
    name: 'Sundial of the Exiled',
    icon: 'ability_hunter_readiness',
    buffs: [{ id: 60064, name: 'Now is the Time!' }],
  },
  // --------
  // PHASE 2
  // --------
  BLOOD_OF_THE_OLD_GOD: {
    id: 45522,
    name: 'Blood of the Old God',
    icon: 'inv_misc_gem_bloodstone_03',
    buffs: [{ id: 64790, name: 'Blood of the Old God' }],
  },
  COMETS_TRAIL: {
    id: 45609,
    name: "Comet's Trail",
    icon: 'spell_arcane_starfire',
    buffs: [{ id: 64772, name: "Comet's Trail" }],
  },
  DARK_MATTER: {
    id: 46038,
    name: 'Dark Matter',
    icon: 'ability_warrior_bloodnova',
    buffs: [{ id: 65024, name: 'Implosion' }],
  },
  ELEMENTAL_FOCUS_STONE: {
    id: 45866,
    name: 'Elemental Focus Stone',
    icon: 'inv_misc_pocketwatch_03',
    buffs: [{ id: 65004, name: 'Alacrity of the Elements' }],
  },
  ENERGY_SIPHON: {
    id: 45292,
    name: 'Energy Siphon',
    icon: 'ability_druid_typhoon',
    buffs: [{ id: 65008, name: 'Energy Siphon', spellId: 65008 }],
  },
  EYE_OF_THE_BROODMOTHER: {
    id: 45308,
    name: 'Eye of the Broodmother',
    icon: 'inv_misc_eye_02',
    buffs: [{ id: 65006, name: 'Eye of the Broodmother' }],
  },
  FLARE_OF_THE_HEAVENS: {
    id: 45518,
    name: 'Flare of the Heavens',
    icon: 'ability_hunter_readiness',
    buffs: [{ id: 64713, name: 'Flare of the Heavens' }],
  },
  FURNACE_STONE: {
    id: 45313,
    name: 'Furnace Stone',
    icon: 'inv_misc_stonetablet_05',
    buffs: [{ id: 65011, name: 'Furnace Stone', spellId: 65011 }],
  },
  HEART_OF_IRON: {
    id: 45158,
    name: 'Heart of Iron',
    icon: 'ability_rogue_fleetfooted',
    buffs: [{ id: 398478, name: 'Heart of Iron', spellId: 398478 }],
  },
  LIVING_FLAME: {
    id: 45148,
    name: 'Living Flame',
    icon: 'spell_fire_burnout',
    buffs: [{ id: 398475, name: 'Living Flame', spellId: 398475 }],
  },
  METEORITE_CRYSTAL: {
    id: 46051,
    name: 'Meteorite Crystal',
    icon: 'inv_misc_gem_azuredraenite_01',
    buffs: [{ id: 64999, name: 'Meteoric Inspiration', spellId: 64999 }],
  },
  MJOLNIR_RUNESTONE: {
    id: 45931,
    name: 'Mjolnir Runestone',
    icon: 'inv_misc_rune_11',
    buffs: [{ id: 65019, name: 'Mjolnir Runestone' }],
  },
  PANDORAS_PLEA: {
    id: 45490,
    name: "Pandora's Plea",
    icon: 'ability_hunter_readiness',
    buffs: [{ id: 64741, name: "Pandora's Plea" }],
  },
  PYRITE_INFUSER: {
    id: 45286,
    name: 'Pyrite Infuser',
    icon: 'spell_fire_felpyroblast',
    buffs: [{ id: 65014, name: 'Pyrite Infusion' }],
  },
  ROYAL_SEAL_OF_KING_LLANE: {
    id: 46021,
    name: 'Royal Seal of King Llane',
    icon: 'inv_crown_13',
    buffs: [{ id: 65012, name: 'Royal Seal of King Llane', spellId: 65012 }],
  },
  SCALE_OF_FATES: {
    id: 45466,
    name: 'Scale of Fates',
    icon: 'inv_spiritshard_02',
    buffs: [{ id: 64707, name: 'Scale of Fates', spellId: 64707 }],
  },
  SHOW_OF_FAITH: {
    id: 45535,
    name: 'Show of Faith',
    icon: 'spell_holy_divineprovidence',
    buffs: [{ id: 64739, name: 'Show of Faith' }],
  },
  SIFS_REMEMBRANCE: {
    id: 45929,
    name: "Sif's Remembrance",
    icon: 'spell_frost_coldhearted',
    buffs: [{ id: 65003, name: 'Memories of Love' }],
  },
  THE_GENERALS_HEART: {
    id: 45507,
    name: "The General's Heart",
    icon: 'spell_holy_devotionaura',
    buffs: [{ id: 64765, name: "The General's Heart" }],
  },
  WRATHSTONE: {
    id: 45263,
    name: 'Wrathstone',
    icon: 'inv_pet_scorchedstone',
    buffs: [{ id: 398488, name: 'Wrathstone' }],
  },
  // --------
  // PHASE 3
  // --------
  ABYSSAL_RUNE: {
    id: 47213,
    name: 'Abyssal Rune',
    icon: 'inv_misc_rune_09',
    buffs: [{ id: 67669, name: 'Elusive Power' }],
  },
  DEATHS_CHOICE: {
    id: 47303,
    name: "Death's Choice",
    icon: 'inv_misc_bone_skull_02',
    buffs: [
      { id: 67703, name: 'Paragon Agility' },
      { id: 67708, name: 'Paragon Strength' },
    ],
  },
  DEATHS_CHOICE_HEROIC: {
    id: 47464,
    name: "Death's Choice",
    icon: 'inv_misc_bone_skull_02',
    buffs: [
      { id: 67772, name: 'Paragon Agility' },
      { id: 67773, name: 'Paragon Strength' },
    ],
  },
  GLYPH_OF_INDOMITABILITY: {
    id: 47735,
    name: 'Glyph of Indomitability',
    icon: 'inv_spiritshard_01',
    buffs: [{ id: 67694, name: 'Defensive Tactics', spellId: 67694 }],
  },
  MARK_OF_SUPREMACY: {
    id: 47734,
    name: 'Mark of Supremacy',
    icon: 'inv_misc_gem_bloodstone_03',
    buffs: [{ id: 67695, name: 'Rage', spellId: 67695 }],
  },
  SATRINAS_IMEDING_SCARAB: {
    id: 47080,
    name: "Satrina's Impeding Scarab",
    icon: 'inv_scarab_crystal',
    buffs: [{ id: 67699, name: 'Fortitude', spellId: 67699 }],
  },
  SATRINAS_IMEDING_SCARAB_HEROIC: {
    id: 47088,
    name: "Satrina's Impeding Scarab",
    icon: 'inv_scarab_crystal',
    buffs: [{ id: 67753, name: 'Fortitude', spellId: 67753 }],
  },
  SHARD_OF_THE_CRYSTAL_HEART: {
    id: 48722,
    name: 'Shard of the Crystal Heart',
    icon: 'inv_spiritshard_01',
    buffs: [{ id: 67683, name: 'Celerity', spellId: 67683 }],
  },
  TALISMAN_OF_RESURGENCE: {
    id: 48724,
    name: 'Talisman of Resurgence',
    icon: 'inv_misc_gem_bloodstone_03',
    buffs: [{ id: 67684, name: 'Hospitality', spellId: 67684 }],
  },
  // --------
  // PHASE 4
  // --------
  CORPSE_TONGUE_COIN: {
    id: 50352,
    name: 'Corpse Tongue Coin',
    icon: 'inv_misc_coin_18',
    buffs: [{ id: 71633, name: 'Thick Skin' }],
  },
  CORPSE_TONGUE_COIN_HEROIC: {
    id: 50349,
    name: 'Corpse Tongue Coin',
    icon: 'inv_misc_coin_18',
    buffs: [{ id: 71639, name: 'Thick Skin' }],
  },
  CORRODED_SKELETON_KEY: {
    id: 50356,
    name: 'Corroded Skeleton Key',
    icon: 'inv_misc_key_15',
    buffs: [{ id: 71586, name: 'Hardened Skin', spellId: 71586 }],
  },
  DEATHBRINGERS_WILL: {
    id: 50362,
    name: "Deathbringer's Will",
    icon: 'inv_jewelry_trinket_04',
    buffs: [
      { id: 71484, name: 'Strength of the Taunka' },
      { id: 71485, name: 'Agility of the Vrykul' },
      { id: 71486, name: 'Power of the Taunka' },
      { id: 71487, name: 'Precision of the Iron Dwarves' },
      { id: 71491, name: 'Aim of the Iron Dwarves' },
      { id: 71492, name: 'Speed of the Vrykul' },
    ],
  },
  DEATHBRINGERS_WILL_HEROIC: {
    id: 50363,
    name: "Deathbringer's Will",
    icon: 'inv_jewelry_trinket_04',
    buffs: [
      { id: 71556, name: 'Agility of the Vrykul' },
      { id: 71557, name: 'Precision of the Iron Dwarves' },
      { id: 71558, name: 'Power of the Taunka' },
      { id: 71559, name: 'Aim of the Iron Dwarves' },
      { id: 71560, name: 'Speed of the Vrykul' },
      { id: 71561, name: 'Strength of the Taunka' },
    ],
  },
  DISLODGED_FOREIGN_OBJECT: {
    id: 50353,
    name: 'Dislodged Foreign Object',
    icon: 'inv_jewelry_trinket_01',
    buffs: [{ id: 71601, name: 'Surge of Power' }],
  },
  DISLODGED_FOREIGN_OBJECT_HEROIC: {
    id: 50348,
    name: 'Dislodged Foreign Object',
    icon: 'inv_jewelry_trinket_01',
    buffs: [{ id: 71644, name: 'Surge of Power' }],
  },
  EPHEMERAL_SNOWFLAKE: {
    id: 50260,
    name: 'Ephemeral Snowflake',
    icon: 'inv_jewelcrafting_empyreansapphire_01',
    buffs: [{ id: 71568, name: 'Urgency', spellId: 71568 }],
  },
  ICKS_ROTTING_THUMB: {
    id: 50235,
    name: "Ick's Rotting Thumb",
    icon: 'inv_misc_bone_10',
    buffs: [{ id: 71569, name: 'Increased Fortitude', spellId: 71569 }],
  },
  MAGHIAS_MISGUIDED_QUILL: {
    id: 50357,
    name: "Maghia's Misguided Quill",
    icon: 'inv_jewelry_trinket_02',
    buffs: [{ id: 71579, name: 'Elusive Power', spellId: 71579 }],
  },
  NEEDLE_ENCRUSTED_SCORPION: {
    id: 50198,
    name: 'Needle-Encrusted Scorpion',
    icon: 'inv_qirajidol_onyx',
    buffs: [{ id: 71403, name: 'Fatal Flaws' }],
  },
  NEVERMELTING_ICE_CRYSTAL: {
    id: 50259,
    name: 'Nevermelting Ice Crystal',
    icon: 'inv_datacrystal09',
    buffs: [{ id: 71564, name: 'Deadly Precision', spellId: 71564 }],
  },
  PHYLACTERY_OF_THE_NAMELESS_LICH: {
    id: 50360,
    name: 'Phylactery of the Nameless Lich',
    icon: 'inv_jewelry_trinket_03',
    buffs: [{ id: 71605, name: 'Siphoned Power' }],
  },
  PHYLACTERY_OF_THE_NAMELESS_LICH_HEROIC: {
    id: 50365,
    name: 'Phylactery of the Nameless Lich',
    icon: 'inv_jewelry_trinket_03',
    buffs: [{ id: 71636, name: 'Siphoned Power' }],
  },
  PURIFIED_LUNAR_DUST: {
    id: 50358,
    name: 'Purified Lunar Dust',
    icon: 'inv_misc_ammo_gunpowder_05',
    buffs: [{ id: 71584, name: 'Revitalized' }],
  },
  SINDRAGOSAS_FLAWLESS_FANG: {
    id: 50361,
    name: "Sindragosa's Flawless Fang",
    icon: 'inv_jewelry_trinket_06',
    buffs: [{ id: 71635, name: 'Aegis of Dalaran', spellId: 71635 }],
  },
  SINDRAGOSAS_FLAWLESS_FANG_HEROIC: {
    id: 50364,
    name: "Sindragosa's Flawless Fang",
    icon: 'inv_jewelry_trinket_06',
    buffs: [{ id: 71638, name: 'Aegis of Dalaran', spellId: 71638 }],
  },
  WHISPERING_FANGED_SKULL: {
    id: 50342,
    name: 'Whispering Fanged Skull',
    icon: 'inv_misc_bone_skull_02',
    buffs: [{ id: 71401, name: 'Icy Rage' }],
  },
  WHISPERING_FANGED_SKULL_HEROIC: {
    id: 50343,
    name: 'Whispering Fanged Skull',
    icon: 'inv_misc_bone_skull_02',
    buffs: [{ id: 71541, name: 'Icy Rage' }],
  },
} satisfies Record<string, Trinket>;

export default trinkets;
