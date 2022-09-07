/**
 * NAME: {
 *   id: number,
 *   name: string,
 *   icon: string,
 *   quality: number,
 * },
 */
import { itemIndexableList } from 'common/ITEMS/Item';

const items = itemIndexableList({
  //region Ingra Maloch
  UNBOUND_CHANGELING: {
    id: 178708,
    name: 'Unbound Changeling',
    icon: 'inv_pet_spectralporcupinered',
  },
  //endregion
  MISTCALLER_OCARINA: {
    id: 178715,
    name: 'Mistcaller Ocarina',
    icon: 'inv_misc_primitive_toy03',
  },
  //region Mistcaller
  //endregion
  //region Tred'ova
  //endregion
});
export default items;
