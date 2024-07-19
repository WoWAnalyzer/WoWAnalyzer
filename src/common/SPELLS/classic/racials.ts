/**
 * All Classic Racials go in here.
 * You need to do this manually, usually an easy way to do this is by searching a racial or race on Wowhead. Here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import Spell from '../Spell';

const spells = {
  // ALLIANCE
  // Draenei
  GIFT_OF_THE_NAARU_DK: {
    id: 59545,
    name: 'Gift of the Naaru',
    icon: 'spell_holy_holyprotection.jpg',
  },
  GIFT_OF_THE_NAARU_HUNTER: {
    id: 59543,
    name: 'Gift of the Naaru',
    icon: 'spell_holy_holyprotection.jpg',
  },
  GIFT_OF_THE_NAARU_MAGE: {
    id: 59548,
    name: 'Gift of the Naaru',
    icon: 'spell_holy_holyprotection.jpg',
  },
  GIFT_OF_THE_NAARU_PALADIN: {
    id: 59542,
    name: 'Gift of the Naaru',
    icon: 'spell_holy_holyprotection.jpg',
  },
  GIFT_OF_THE_NAARU_PRIEST: {
    id: 59544,
    name: 'Gift of the Naaru',
    icon: 'spell_holy_holyprotection.jpg',
  },
  GIFT_OF_THE_NAARU_SHAMAN: {
    id: 59547,
    name: 'Gift of the Naaru',
    icon: 'spell_holy_holyprotection.jpg',
  },
  GIFT_OF_THE_NAARU_WARRIOR: {
    id: 28880,
    name: 'Gift of the Naaru',
    icon: 'spell_holy_holyprotection.jpg',
  },
  // Dwarf
  STONEFORM: {
    id: 20594,
    name: 'Stoneform',
    icon: 'spell_shadow_unholystrength.jpg',
  },
  STONEFORM_BUFF: {
    id: 65116,
    name: 'Stoneform',
    icon: 'spell_shadow_unholystrength.jpg',
  },
  // Gnome
  ESCAPE_ARTIST: {
    id: 20589,
    name: 'Escape Artist',
    icon: 'ability_rogue_trip.jpg',
  },
  // Human
  WILL_TO_SURVIVE: {
    id: 59752,
    name: 'Will to Survive',
    icon: 'spell_shadow_charm.jpg',
  },
  // Night Elf
  SHADOWMELD: {
    id: 58984,
    name: 'Shadowmeld',
    icon: 'ability_ambush.jpg',
  },
  // Worgen
  DARKFLIGHT: {
    id: 68992,
    name: 'Darkflight',
    icon: 'ability_racial_darkflight.jpg',
  },
  TWO_FORMS: {
    id: 68996,
    name: 'Two Forms',
    icon: 'achievement_worganhead.jpg',
  },
  // HORDE
  // Blood Elf
  ARCANE_TORRENT: {
    // Paladin, Hunter, Priest, Mage, Warlock
    id: 28730,
    name: 'Arcane Torrent',
    icon: 'spell_shadow_teleport.jpg',
  },
  ARCANE_TORRENT_DK: {
    id: 50613,
    name: 'Arcane Torrent',
    icon: 'spell_shadow_teleport.jpg',
  },
  ARCANE_TORRENT_ROGUE: {
    id: 25046,
    name: 'Arcane Torrent',
    icon: 'spell_shadow_teleport.jpg',
  },
  // Goblin
  PACK_HOBGOBLIN: {
    id: 69046,
    name: 'Pack Hobgoblin',
    icon: 'ability_racial_packhobgoblin.jpg',
  },
  ROCKET_BARRAGE: {
    id: 69041,
    name: 'Rocket Barrage',
    icon: 'inv_gizmo_rocketlauncher.jpg',
  },
  ROCKET_JUMP: {
    id: 69070,
    name: 'Rocket Jump',
    icon: 'ability_racial_rocketjump.jpg',
  },
  // Orc
  BLOOD_FURY: {
    // Warrior, Hunter, Rogue, DK
    id: 20572,
    name: 'Blood Fury',
    icon: 'racial_orc_berserkerstrength.jpg',
  },
  BLOOD_FURY_CASTER: {
    // Mage, Warlock
    id: 33702,
    name: 'Blood Fury',
    icon: 'racial_orc_berserkerstrength.jpg',
  },
  BLOOD_FURY_SHAMAN: {
    id: 33697,
    name: 'Blood Fury',
    icon: 'racial_orc_berserkerstrength.jpg',
  },
  // Tauren
  WAR_STOMP: {
    id: 20549,
    name: 'War Stomp',
    icon: 'ability_warstomp.jpg',
  },
  // Troll
  BERSERKING: {
    id: 26297,
    name: 'Berserking',
    icon: 'racial_troll_berserk.jpg',
  },
  // Undead
  WILL_OF_THE_FORSAKEN: {
    id: 7744,
    name: 'Will of the Forsaken',
    icon: 'spell_shadow_raisedead.jpg',
  },
  CANNIBALIZE: {
    id: 20577,
    name: 'Cannibalize',
    icon: 'ability_racial_cannibalize.jpg',
  },
} satisfies Record<string, Spell>;

export default spells;
