/**
 * All Priest azerite powers go in here.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

export default {
  // Disc
  GIFT_OF_FORGIVENESS: {
    id: 277680,
    name: 'Gift of the Forgiveness',
    icon: 'spell_holy_holysmite',
  },
};
