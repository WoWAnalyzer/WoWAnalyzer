import Item from 'common/ITEMS/Item';

const items = {
  //fallback icon for encounter stats
  UNKNOWN_TRINKET: {
    id: 0,
    name: 'Unknown Trinket',
    icon: 'inv_misc_trinket6oih_orb1',
  },
  // two items used in Anniversary post from 2018, just so it doesn't break TS
  DRAPE_OF_SHAME: {
    id: 142170,
    name: 'Drape of Shame',
    icon: 'inv_cape_legionendgame_c_03',
  },
  THE_DECEIVERS_BLOOD_PACT: {
    id: 137035,
    name: "The Deceiver's Blood Pact",
    icon: 'inv_boots_chain_07',
  },
} satisfies Record<string, Item>;

export default items;
