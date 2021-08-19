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
  //region Blightbone
  //endregion
  //region Amarth, The Reanimator
  BOTTLED_FLAYEDWING_TOXIN: {
    id: 178742,
    name: 'Bottled Flayedwing Toxin',
    icon: 'inv_alchemy_70_potion2',
  },
  //endregion
  //region Surgeon Stichflesh
  SPARE_MEAT_HOOK: {
    id: 178751,
    name: 'Spare Meat Hook',
    icon: 'inv_archaeology_70_tauren_moosebonefishhook',
  },
  SATCHEL_OF_MISBEGOTTEN_MINIONS: {
    id: 178772,
    name: 'Satchel of Misbegotten Minions',
    icon: 'inv_misc_coinbag07',
  },
  //endregion
  //region Nalthor the Rimebinder
  SIPHONING_PHYLACTERY_SHARD: {
    id: 178783,
    name: 'Siphoning Phylactery Shard',
    icon: 'inv_enchanting_70_chaosshard',
  },
  //endregion
};
export default items;
