import Item from 'common/ITEMS/Item';

/**
 * @description This file contains items that are not class specific, do not fall into the specific categories, but information is needed outside of what the log provides.
 */
const items = {
  CYRCES_CIRCLET: {
    id: 228411,
    name: "Cyrce's Circlet",
    icon: 'inv_siren_isle_ring',
  },
  MAGNIFICENT_JEWELERS_SETTING: {
    id: 213777,
    name: "Magnificent Jeweler's Setting",
    icon: 'inv_jewelcrafting_90_elethiumsetting',
  },
  SAD_SOCKET_ADDING_DEVICE: {
    id: 232386,
    name: 'S.A.D.',
    icon: 'inv_eng_electroshockmountmotivator',
  },
  ALGARI_TOKEN_OF_MERIT: {
    id: 230793,
    name: 'Algari Token of Merit',
    icon: 'inv_misc_azsharacoin2',
  },
} satisfies Record<string, Item>;

export default items;
