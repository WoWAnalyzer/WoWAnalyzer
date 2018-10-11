/**
 * All Death Knight azerite powers go in here.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

export default {
  //Blood
  BONES_OF_THE_DAMNED: {
    id: 278484,
    name: 'Bones of the Damned',
    icon: 'ability_deathknight_marrowrend',
  },
  BONES_OF_THE_DAMNED_BUFF: {
    id: 279503,
    name: 'Bones of the Damned',
    icon: 'ability_deathknight_marrowrend',
  },
  ETERNAL_RUNE_WEAPON: {
    id: 278479,
    name: 'Eternal Rune Weapon',
    icon: 'inv_sword_07',
  },
  ETERNAL_RUNE_WEAPON_BUFF: {
    id: 278543,
    name: 'Eternal Rune Weapon',
    icon: 'inv_sword_07',
  },

  //Shared
  BONE_SPIKE_GRAVEYARD: {
    id: 273088,
    name: 'Bone Spike Graveyard',
    icon: 'spell_shadow_deathanddecay',
  },
  BONE_SPIKE_GRAVEYARD_DAMAGE: {
    id: 273089,
    name: 'Bone Spike Graveyard',
    icon: 'spell_shadow_deathanddecay',
  },
  BONE_SPIKE_GRAVEYARD_HEAL: {
    id: 273090,
    name: 'Bone Spike Graveyard',
    icon: 'spell_shadow_deathanddecay',
  },
};
