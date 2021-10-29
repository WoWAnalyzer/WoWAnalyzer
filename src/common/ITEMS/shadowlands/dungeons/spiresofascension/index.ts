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
  //region Kin-tara

  //endregion

  //region Ventunax
  OVERCHARGED_ANIMA_BATTERY: {
    id: 180116,
    name: 'Overcharged Anima Battery',
    icon: 'inv_battery_01',
  },
  //endregion

  //region Oryphrion
  ANIMA_FIELD_EMITTER: {
    id: 180118,
    name: 'Anima Field Emitter',
    icon: 'inv_trinket_oribos_01_silver',
  },
  EMPYREAL_ORDNANCE: {
    id: 180117,
    name: 'Empyreal Ordnance',
    icon: 'spell_animabastion_orb',
  },
  //endregion

  //region Devos, Paragon of Doubt
  BOON_OF_THE_ARCHON: {
    id: 180119,
    name: 'Boon of the Archon',
    icon: 'inv_polearm_2h_bastionarchon_d_01',
  },
  //endregion
};
export default items;
