import { Trinket } from 'common/ITEMS/Item';

const trinkets = {
  // id = item id
  // -------------
  // CATA PHASE 1
  // -------------
  BELL_OF_ENRAGING_RESONANCE: {
    id: 65053,
    name: 'Bell of Enraging Resonance',
    icon: 'inv_misc_bell_01.jpg',
    buffs: [{ id: 92318, name: 'Dire Magic' }],
  },
  CRUSHING_WEIGHT: {
    id: 65118,
    name: 'Crushing Weight',
    icon: 'inv_misc_cat_trinket05.jpg',
    buffs: [{ id: 92342, name: 'Race Against Death' }],
  },
  DARKMOON_CARD_VOLCANO: {
    id: 62047,
    name: 'Darkmoon Card: Volcano',
    icon: 'inv_inscription_tarot_volcanocard.jpg',
    buffs: [{ id: 89091, name: 'Volcanic Destruction' }],
  },
  ESSENCE_OF_THE_CYCLONE: {
    id: 65140,
    name: 'Essence of the Cyclone',
    icon: 'inv_misc_cat_trinket01.jpg',
    buffs: [{ id: 92351, name: 'Twisted' }],
  },
  FALL_OF_MORTALITY: {
    id: 65124,
    name: 'Fall of Mortality',
    icon: 'inv_misc_cat_trinket12.jpg',
    buffs: [{ id: 92332, name: 'Grounded Soul' }],
  },
  FLUID_DEATH: {
    id: 58181,
    name: 'Fluid Death',
    icon: 'ability_vehicle_liquidpyrite_blue.jpg',
    buffs: [{ id: 92104, name: 'River of Death' }],
  },
  FURY_OF_ANGERFORGE: {
    id: 59461,
    name: 'Fury of Angerforge',
    icon: 'inv_misc_cat_trinket08.jpg',
    buffs: [{ id: 91836, name: 'Forged Fury' }],
  },
  HEART_OF_RAGE: {
    id: 65072,
    name: 'Heart of Rage',
    icon: 'inv_misc_ahnqirajtrinket_03.jpg',
    buffs: [{ id: 92345, name: 'Rageheart' }],
  },
  HEART_OF_SOLACE: {
    id: 56393,
    name: 'Heart of Solace',
    icon: 'spell_holy_persecution.jpg',
    buffs: [{ id: 91364, name: 'Heartened' }],
  },
  IMPATIENCE_OF_YOUTH: {
    id: 62464, // Alliance = 62469
    name: 'Impatience of Youth',
    icon: 'inv_misc_idol_05.jpg',
    buffs: [{ id: 91828, name: 'Thrill of Victory' }], // Alliance has same buffId
  },
  KEY_TO_THE_ENDLESS_CHAMBER: {
    id: 56328,
    name: 'Key to the Endless Chamber',
    icon: 'inv_misc_key_10.jpg',
    buffs: [{ id: 92091, name: 'Final Key' }],
  },
  PRESTORS_TALISMAN_OF_MACHINATION: {
    id: 65026,
    name: "Prestor's Talisman of Machination",
    icon: 'inv_jewelry_necklace_17.jpg',
    buffs: [{ id: 92349, name: 'Nefarious Plot' }],
  },
  SHARD_OF_WOE: {
    id: 60233,
    name: 'Shard of Woe',
    icon: 'spell_frost_iceshard.jpg',
    buffs: [{ id: 91173, name: 'Celerity' }],
  },
  SOUL_CASKET: {
    id: 58183,
    name: 'Soul Casket',
    icon: 'inv_misc_enggizmos_12.jpg',
    buffs: [{ id: 91019, name: 'Soul Power', spellId: 91019 }],
  },
  STUMP_OF_TIME: {
    id: 62465, // Alliance = 62470
    name: 'Stump of Time',
    icon: 'inv_misc_branch_01.jpg',
    buffs: [{ id: 91047, name: 'Battle Magic' }], // Alliance has same buffId
  },
  THERALIONS_MIRROR: {
    id: 65105,
    name: "Theralion's Mirror",
    icon: 'spell_arcane_teleportironforge.jpg',
    buffs: [{ id: 92320, name: 'Revelation' }],
  },
  // Player is building mana while the buff is active
  // When the buff is removed, the player used the trinket
  TYRANDES_FAVORITE_DOLL: {
    id: 64645,
    name: "Tyrande's Favorite Doll",
    icon: 'trade_archaeology_tyrandesfavoritedoll.jpg',
    buffs: [{ id: 92596, name: 'Recaptured Mana', spellId: 92601 }],
  },
  UNHEEDED_WARNING: {
    id: 59520,
    name: 'Unheeded Warning',
    icon: 'inv_misc_cat_trinket11.jpg',
    buffs: [{ id: 92108, name: 'Heedless Carnage' }],
  },
  UNSOLVABLE_RIDDLE: {
    id: 62463, // Alliance = 62468
    name: 'Unsolvable Riddle',
    icon: 'inv_misc_stonetablet_11.jpg',
    buffs: [{ id: 92123, name: 'Enigma' }], // Alliance has same buffId
  },
  // -------------
  // WRATH PHASE 4
  // -------------
  CORPSE_TONGUE_COIN: {
    id: 50352,
    name: 'Corpse Tongue Coin',
    icon: 'inv_misc_coin_18.jpg',
    buffs: [{ id: 71633, name: 'Thick Skin' }],
  },
  CORPSE_TONGUE_COIN_HEROIC: {
    id: 50349,
    name: 'Corpse Tongue Coin',
    icon: 'inv_misc_coin_18.jpg',
    buffs: [{ id: 71639, name: 'Thick Skin' }],
  },
  CORRODED_SKELETON_KEY: {
    id: 50356,
    name: 'Corroded Skeleton Key',
    icon: 'inv_misc_key_15.jpg',
    buffs: [{ id: 71586, name: 'Hardened Skin', spellId: 71586 }],
  },
  DEATHBRINGERS_WILL: {
    id: 50362,
    name: "Deathbringer's Will",
    icon: 'inv_jewelry_trinket_04.jpg',
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
    icon: 'inv_jewelry_trinket_04.jpg',
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
    icon: 'inv_jewelry_trinket_01.jpg',
    buffs: [{ id: 71601, name: 'Surge of Power' }],
  },
  DISLODGED_FOREIGN_OBJECT_HEROIC: {
    id: 50348,
    name: 'Dislodged Foreign Object',
    icon: 'inv_jewelry_trinket_01.jpg',
    buffs: [{ id: 71644, name: 'Surge of Power' }],
  },
  EPHEMERAL_SNOWFLAKE: {
    id: 50260,
    name: 'Ephemeral Snowflake',
    icon: 'inv_jewelcrafting_empyreansapphire_01.jpg',
    buffs: [{ id: 71568, name: 'Urgency', spellId: 71568 }],
  },
  ICKS_ROTTING_THUMB: {
    id: 50235,
    name: "Ick's Rotting Thumb",
    icon: 'inv_misc_bone_10.jpg',
    buffs: [{ id: 71569, name: 'Increased Fortitude', spellId: 71569 }],
  },
  MAGHIAS_MISGUIDED_QUILL: {
    id: 50357,
    name: "Maghia's Misguided Quill",
    icon: 'inv_jewelry_trinket_02.jpg',
    buffs: [{ id: 71579, name: 'Elusive Power', spellId: 71579 }],
  },
  NEEDLE_ENCRUSTED_SCORPION: {
    id: 50198,
    name: 'Needle-Encrusted Scorpion',
    icon: 'inv_qirajidol_onyx.jpg',
    buffs: [{ id: 71403, name: 'Fatal Flaws' }],
  },
  NEVERMELTING_ICE_CRYSTAL: {
    id: 50259,
    name: 'Nevermelting Ice Crystal',
    icon: 'inv_datacrystal09.jpg',
    buffs: [{ id: 71564, name: 'Deadly Precision', spellId: 71564 }],
  },
  PHYLACTERY_OF_THE_NAMELESS_LICH: {
    id: 50360,
    name: 'Phylactery of the Nameless Lich',
    icon: 'inv_jewelry_trinket_03.jpg',
    buffs: [{ id: 71605, name: 'Siphoned Power' }],
  },
  PHYLACTERY_OF_THE_NAMELESS_LICH_HEROIC: {
    id: 50365,
    name: 'Phylactery of the Nameless Lich',
    icon: 'inv_jewelry_trinket_03.jpg',
    buffs: [{ id: 71636, name: 'Siphoned Power' }],
  },
  PURIFIED_LUNAR_DUST: {
    id: 50358,
    name: 'Purified Lunar Dust',
    icon: 'inv_misc_ammo_gunpowder_05.jpg',
    buffs: [{ id: 71584, name: 'Revitalized' }],
  },
  SINDRAGOSAS_FLAWLESS_FANG: {
    id: 50361,
    name: "Sindragosa's Flawless Fang",
    icon: 'inv_jewelry_trinket_06.jpg',
    buffs: [{ id: 71635, name: 'Aegis of Dalaran', spellId: 71635 }],
  },
  SINDRAGOSAS_FLAWLESS_FANG_HEROIC: {
    id: 50364,
    name: "Sindragosa's Flawless Fang",
    icon: 'inv_jewelry_trinket_06.jpg',
    buffs: [{ id: 71638, name: 'Aegis of Dalaran', spellId: 71638 }],
  },
  WHISPERING_FANGED_SKULL: {
    id: 50342,
    name: 'Whispering Fanged Skull',
    icon: 'inv_misc_bone_skull_02.jpg',
    buffs: [{ id: 71401, name: 'Icy Rage' }],
  },
  WHISPERING_FANGED_SKULL_HEROIC: {
    id: 50343,
    name: 'Whispering Fanged Skull',
    icon: 'inv_misc_bone_skull_02.jpg',
    buffs: [{ id: 71541, name: 'Icy Rage' }],
  },
  // -------------
  // WRATH PHASE 1
  // -------------
  SOUL_PRESERVER: {
    //To Be Removed
    id: 37111,
    name: 'Soul Preserver',
    icon: 'inv_misc_orb_03',
    buffs: [{ id: 60513, name: 'Healing Trance' }],
  },
} satisfies Record<string, Trinket>;

export default trinkets;
