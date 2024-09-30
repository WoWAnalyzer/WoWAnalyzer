/**
 * All Racials go in here.
 * You need to do this manually, usually an easy way to do this is by searching a racial or race on Wowhead. Here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */
import Spell from 'common/SPELLS/Spell';

const spells = {
  // Blood Elf
  ARCANE_TORRENT_MANA1: {
    id: 155145,
    name: 'Arcane Torrent',
    icon: 'spell_shadow_teleport',
  },
  ARCANE_TORRENT_MANA2: {
    id: 28730,
    name: 'Arcane Torrent',
    icon: 'spell_shadow_teleport',
  },
  ARCANE_TORRENT_MANA3: {
    id: 232633,
    name: 'Arcane Torrent',
    icon: 'spell_shadow_teleport',
  },
  ARCANE_TORRENT_RAGE: {
    id: 69179,
    name: 'Arcane Torrent',
    icon: 'spell_shadow_teleport',
  },
  ARCANE_TORRENT_ENERGY: {
    id: 25046,
    name: 'Arcane Torrent',
    icon: 'spell_shadow_teleport',
  },
  ARCANE_TORRENT_RUNIC_POWER: {
    id: 50613,
    name: 'Arcane Torrent',
    icon: 'spell_shadow_teleport',
  },
  ARCANE_TORRENT_MONK: {
    id: 129597,
    name: 'Arcane Torrent',
    icon: 'spell_shadow_teleport',
  },
  ARCANE_TORRENT_FOCUS: {
    id: 80483,
    name: 'Arcane Torrent',
    icon: 'spell_shadow_teleport',
  },
  ARCANE_TORRENT_FURY: {
    id: 202719,
    name: 'Arcane Torrent',
    icon: 'spell_shadow_teleport',
  },
  // Troll
  BERSERKING: {
    id: 26297,
    name: 'Berserking',
    icon: 'racial_troll_berserk',
  },
  // Undead
  TOUCH_OF_THE_GRAVE: {
    id: 127802,
    name: 'Touch of the Grave',
    icon: 'spell_shadow_fingerofdeath',
  },
  WILL_OF_THE_FORSAKEN: {
    id: 7744,
    name: 'Will of the Forsaken',
    icon: 'spell_shadow_raisedead',
  },
  CANNIBALIZE: {
    id: 20577,
    name: 'Cannibalize',
    icon: 'ability_racial_cannibalize',
  },
  // Draenei
  GIFT_OF_THE_NAARU_DK: {
    id: 59545,
    name: 'Gift of the Naaru',
    icon: 'spell_holy_holyprotection',
  },
  GIFT_OF_THE_NAARU_HUNTER: {
    id: 59543,
    name: 'Gift of the Naaru',
    icon: 'spell_holy_holyprotection',
  },
  GIFT_OF_THE_NAARU_MAGE: {
    id: 59548,
    name: 'Gift of the Naaru',
    icon: 'spell_holy_holyprotection',
  },
  GIFT_OF_THE_NAARU_MONK: {
    id: 121093,
    name: 'Gift of the Naaru',
    icon: 'spell_holy_holyprotection',
  },
  GIFT_OF_THE_NAARU_PALADIN: {
    id: 59542,
    name: 'Gift of the Naaru',
    icon: 'spell_holy_holyprotection',
  },
  GIFT_OF_THE_NAARU_PRIEST: {
    id: 59544,
    name: 'Gift of the Naaru',
    icon: 'spell_holy_holyprotection',
  },
  GIFT_OF_THE_NAARU_SHAMAN: {
    id: 59547,
    name: 'Gift of the Naaru',
    icon: 'spell_holy_holyprotection',
  },
  GIFT_OF_THE_NAARU_WARRIOR: {
    id: 28880,
    name: 'Gift of the Naaru',
    icon: 'spell_holy_holyprotection',
  },
  // Dwarf
  STONEFORM: {
    id: 20594,
    name: 'Stoneform',
    icon: 'spell_shadow_unholystrength',
  },
  STONEFORM_BUFF: {
    id: 65116,
    name: 'Stoneform',
    icon: 'spell_shadow_unholystrength',
  },
  MIGHT_OF_THE_MOUNTAIN: {
    id: 59224,
    name: 'Might of the Mountain',
    icon: 'inv_hammer_05',
  },
  // Gnome
  ESCAPE_ARTIST: {
    id: 20589,
    name: 'Escape Artist',
    icon: 'ability_rogue_trip',
  },
  // Human
  WILL_TO_SURVIVE: {
    id: 59752,
    name: 'Will to Survive',
    icon: 'spell_shadow_charm',
  },
  SHADOWMELD: {
    id: 58984,
    name: 'Shadowmeld',
    icon: 'ability_ambush',
  },
  // Pandaren
  QUAKING_PALM: {
    id: 107079,
    name: 'Quaking Palm',
    icon: 'pandarenracial_quiveringpain',
  },
  // Worgen
  DARKFLIGHT: {
    id: 68992,
    name: 'Darkflight',
    icon: 'ability_racial_darkflight',
  },
  TWO_FORMS: {
    id: 68996,
    name: 'Two Forms',
    icon: 'achievement_worganhead',
  },
  // Goblin
  ROCKET_JUMP: {
    id: 69070,
    name: 'Rocket Jump',
    icon: 'ability_racial_rocketjump',
  },
  ROCKET_BARRAGE: {
    id: 69041,
    name: 'Rocket Barrage',
    icon: 'inv_gizmo_rocketlauncher',
  },
  PACK_HOBGOBLIN: {
    id: 69046,
    name: 'Pack Hobgoblin',
    icon: 'ability_racial_packhobgoblin',
  },
  // Orc
  BLOOD_FURY_SPELL: {
    id: 33702,
    name: 'Blood Fury',
    icon: 'racial_orc_berserkerstrength',
  },
  BLOOD_FURY_SPELL_AND_PHYSICAL: {
    id: 33697,
    name: 'Blood Fury',
    icon: 'racial_orc_berserkerstrength',
  },
  BLOOD_FURY_PHYSICAL: {
    id: 20572,
    name: 'Blood Fury',
    icon: 'racial_orc_berserkerstrength',
  },
  // Tauren
  BRAWN: {
    id: 154743,
    name: 'Brawn',
    icon: 'inv_misc_head_tauren_01',
  },
  WAR_STOMP: {
    id: 20549,
    name: 'War Stomp',
    icon: 'ability_warstomp',
  },
  // High Mountain Tauren
  BULL_RUSH: {
    id: 255654,
    name: 'Bull Rush',
    icon: 'ability_racial_bullrush',
  },
  MOUNTAINEER: {
    id: 255658,
    name: 'Mountaineer',
    icon: 'ability_racial_mountaineer',
  },
  // Nightborne
  CANTRIPS: {
    id: 255661,
    name: 'Cantrips',
    icon: 'ability_racial_cantrips',
  },
  ARCANE_PULSE: {
    id: 260364,
    name: 'Arcane Pulse',
    icon: 'ability_racial_forceshield',
  },
  // Void Elf
  SPATIAL_RIFT_INITIAL: {
    id: 256948,
    name: 'Spatial Rift',
    icon: 'ability_racial_spatialrift',
  },
  SPATIAL_RIFT_TELEPORT: {
    id: 257040,
    name: 'Spatial Rift',
    icon: 'ability_racial_spatialrift',
  },
  ENTROPIC_EMBRACE_BUFF: {
    id: 256374,
    name: 'Entropic Embrace',
    icon: 'ability_racial_entropicembrace',
  },
  ENTROPIC_EMBRACE_DAMAGE: {
    id: 259756,
    name: 'Entropic Embrace',
    icon: 'ability_racial_entropicembrace',
  },
  // Lightforged Draenei
  LIGHTS_RECKONING: {
    id: 255652,
    name: "Light's Reckoning",
    icon: 'ability_racial_finalverdict',
  },
  LIGHTS_JUDGMENT: {
    id: 255647,
    name: "Light's Judgment",
    icon: 'ability_racial_orbitalstrike',
  },
  FORGE_OF_LIGHT: {
    id: 259930,
    name: 'Forge of Light',
    icon: 'ability_racial_forgeoflight',
  },
  // Mag'har Orc
  ANCESTRAL_CALL: {
    id: 274738,
    name: 'Ancestral Call',
    icon: 'ability_racial_ancestralcall',
  },
  RICTUS_OF_THE_LAUGHING_SKULL: {
    // Crit Buff
    id: 274739,
    name: 'Rictus of the Laughing Skull',
    icon: 'ability_racial_ancestralcall',
  },
  ZEAL_OF_THE_BURNING_BLADE: {
    // Haste Buff
    id: 274740,
    name: 'Zeal of the Burning Blade',
    icon: 'ability_racial_ancestralcall',
  },
  FEROCITY_OF_THE_FROSTWOLF: {
    // Mastery Buff
    id: 274741,
    name: 'Ferocity of the Frostwolf',
    icon: 'ability_racial_ancestralcall',
  },
  MIGHT_OF_THE_BLACKROCK: {
    // Versatility Buff
    id: 274742,
    name: 'Might of the Blackrock',
    icon: 'ability_racial_ancestralcall',
  },
  // Zandalari Troll
  PTERRORDAX_SWOOP: {
    id: 281954,
    name: 'Pterrordax Swoop',
    icon: 'ability_racial_pterrordaxswoop',
  },
  REGENERATIN: {
    id: 291944,
    name: "Regeneratin'",
    icon: 'ability_racial_regeneratin',
  },
  // Vulpera
  RUMMAGE_YOUR_BAG: {
    id: 312425,
    name: 'Rummage Your Bag',
    icon: 'ability_racial_rummageyourbag',
  },
  // Kul-Tiran
  HAYMAKER: {
    id: 287712,
    name: 'Haymaker',
    icon: 'ability_racial_haymaker',
  },
  //Dracthyr
  AWAKENED: {
    id: 365575,
    name: 'Awakened',
    icon: 'ability_racial_awakened',
  },
  // Earthen
  AZERITE_SURGE: {
    id: 436344,
    name: 'Azerite Surge',
    icon: 'ability_earthen_azeritesurge',
  },
} satisfies Record<string, Spell>;

export default spells;
