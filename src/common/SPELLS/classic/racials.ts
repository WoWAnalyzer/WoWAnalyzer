/**
 * All Racials go in here.
 * You need to do this manually, usually an easy way to do this is by searching a racial or race on Wowhead. Here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import { spellIndexableList } from '../Spell';

const spells = spellIndexableList({
  // ALLIANCE
  // Human
  WILL_TO_SURVIVE: {
    id: 59752,
    name: 'Will to Survive',
    icon: 'spell_shadow_charm',
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
  // Night Elf
  SHADOWMELD: {
    id: 58984,
    name: 'Shadowmeld',
    icon: 'ability_ambush',
  },
  // Gnome
  ESCAPE_ARTIST: {
    id: 20589,
    name: 'Escape Artist',
    icon: 'ability_rogue_trip',
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
  // HORDE
  // Orc
  BLOOD_FURY: {
    // Warrior, Hunter, Rogue, DK
    id: 20572,
    name: 'Blood Fury',
    icon: 'racial_orc_berserkerstrength',
  },
  BLOOD_FURY_SHAMAN: {
    id: 33697,
    name: 'Blood Fury',
    icon: 'racial_orc_berserkerstrength',
  },
  BLOOD_FURY_WARLOCK: {
    id: 33702,
    name: 'Blood Fury',
    icon: 'racial_orc_berserkerstrength',
  },
  // Undead
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
  // Tauren
  WAR_STOMP: {
    id: 20549,
    name: 'War Stomp',
    icon: 'ability_warstomp',
  },
  // Troll
  BERSERKING: {
    id: 26297,
    name: 'Berserking',
    icon: 'racial_troll_berserk',
  },
  // Blood Elf
  ARCANE_TORRENT: {
    // Paladin, Hunter, Priest, Mage, Warlock
    id: 28730,
    name: 'Arcane Torrent',
    icon: 'spell_shadow_teleport',
  },
  ARCANE_TORRENT_ROGUE: {
    id: 25046,
    name: 'Arcane Torrent',
    icon: 'spell_shadow_teleport',
  },
  ARCANE_TORRENT_DK: {
    id: 50613,
    name: 'Arcane Torrent',
    icon: 'spell_shadow_teleport',
  },
});

export default spells;
