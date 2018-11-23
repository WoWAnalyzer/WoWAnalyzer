/**
 * All Warlock azerite powers go in here.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

export default {
  // Affliction Azerite traits and effects
  CASCADING_CALAMITY: {
    id: 275372,
    name: 'Cascading Calamity',
    icon: 'spell_shadow_unstableaffliction_3',
  },
  WRACKING_BRILLIANCE: {
    id: 272891,
    name: 'Wracking Brilliance',
    icon: 'spell_shadow_felmending',
  },
  DREADFUL_CALLING: {
    id: 278727,
    name: 'Dreadful Calling',
    icon: 'inv_beholderwarlock',
  },

  // Demonology Azerite traits and effects
  DEMONIC_METEOR: {
    id: 278737,
    name: 'Demonic Meteor',
    icon: 'ability_warlock_handofguldan',
  },
};
