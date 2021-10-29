/**
 * NAME: {
 *   id: number,
 *   name: string,
 *   icon: string,
 *   quality: number,
 * },
 */
import { ItemList } from 'common/ITEMS/Item';

const items: ItemList = {
  //region An Affront of Challengers
  VIAL_OF_SPECTRAL_ESSENCE: {
    id: 178810,
    name: 'Vial of Spectral Essence',
    icon: 'inv_trinket_maldraxxus_02_purple',
  },
  //endregion
  //region Gorechop
  VISCERA_OF_COALESCED_HATRED: {
    id: 178808,
    name: 'Viscera of Coalesced Hatred',
    icon: 'inv_misc_organ_04',
  },
  //endregion
  //region Xav the Unfallen
  //endregion
  //region Kul'tharok
  SOULLETTING_RUBY: {
    id: 178809,
    name: 'Soulletting Ruby',
    icon: 'inv_jewelcrafting_livingruby_01',
  },
  //endregion
  //region Mordretha, the Endless Empress
  GRIM_CODEX: {
    id: 178811,
    name: 'Grim Codex',
    icon: 'inv_misc_book_01',
  },
  //endregion
};
export default items;
