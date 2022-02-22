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
  //region Globgrog
  SLIMY_CONSUMPTIVE_ORGAN: {
    id: 178770,
    name: 'Slimy Consumptive Organ',
    icon: 'inv_misc_organ_01',
  },
  //endregion
  //region Doctor Ickus
  PHIAL_OF_PUTREFACTION: {
    id: 178771,
    name: 'Phial of Putrefaction',
    icon: 'inv_trinket_maldraxxus_02_green',
  },
  //endregion
  //region Domina Venomblade
  //endregion
  //region Margrave Stradama
  INFINITELY_DIVISIBLE_OOZE: {
    id: 178769,
    name: 'Infinitely Divisible Ooze',
    icon: 'inv_alchemy_elixir_03',
  },
  //endregion
};
export default items;
