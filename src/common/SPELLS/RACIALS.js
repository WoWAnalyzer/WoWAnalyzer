/**
 * All Racials go in here.
 * You need to do this manually, usually an easy way to do this is by searching a racial or race on Wowhead. Here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

export default {
  // Blood Elf
  ARCANE_TORRENT_MANA: {
    id: 155145,
    name: 'Arcane Torrent',
    icon: 'spell_shadow_teleport',
  },
  ARCANE_TORRENT_RUNIC_POWER: {
    id: 50613,
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
};
