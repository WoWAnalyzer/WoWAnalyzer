/**
 * All Shaman azerite powers go in here.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

export default {
  // Restoration
  OVERFLOWING_SHORES: {
    id: 278095,
    name: 'Overflowing Shores',
    icon: 'spell_nature_giftofthewaterspirit',
  },
  SWELLING_STREAM: {
    id: 275488,
    name: 'Swelling Stream',
    icon: 'inv_spear_04',
  },
  SWELLING_STREAM_HEAL: {
    id: 275499,
    name: 'Swelling Stream',
    icon: 'inv_spear_04',
  },
  SURGING_TIDES: {
    id: 279181,
    name: 'Surging Tides',
    icon: 'spell_nature_riptide',
  },
  SURGING_TIDES_ABSORB: {
    id: 279187,
    name: 'Surging Tides',
    icon: 'spell_nature_riptide',
  },
  SPOUTING_SPIRITS: {
    id: 278715,
    name: 'Spouting Spirits',
    icon: 'spell_shaman_spiritlink',
  },
  SPOUTING_SPIRITS_HEAL: { // double check this
    id: 279504,
    name: 'Spouting Spirits',
    icon: 'spell_shaman_spiritlink',
  },
  EBB_AND_FLOW: {
    id: 273597,
    name: 'Ebb and Flow',
    icon: 'ability_shaman_healingtide',
  },
};
  