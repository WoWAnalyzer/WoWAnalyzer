/**
 * NAME: {
 *   id: number,
 *   name: string,
 *   icon: string,
 * },
 */
import { ItemList } from 'common/ITEMS/Item';

const gems: ItemList = {
  LEVIATHANS_EYE_OF_INTELLECT: {
    // BFA gem but people still use it
    id: 168638,
    name: "Leviathan's Eye of Intellect",
    icon: 'inv_misc_metagem_b',
  },
  DEADLY_JEWEL_CLUSTER: {
    id: 173127,
    name: 'Deadly Jewel Cluster',
    icon: 'inv_jewelcrafting_90_rarecut_orange',
  },
  MASTERFUL_JEWEL_CLUSTER: {
    id: 173130,
    name: 'Masterful Jewel Cluster',
    icon: 'inv_jewelcrafting_90_rarecut_purple',
  },
  QUICK_JEWEL_CLUSTER: {
    id: 173128,
    name: 'Quick Jewel Cluster',
    icon: 'inv_jewelcrafting_90_rarecut_yellow',
  },
  VERSATILE_JEWEL_CLUSTER: {
    id: 173129,
    name: 'Versatile Jewel Cluster',
    icon: 'inv_jewelcrafting_90_rarecut_blue',
  },
};
export default gems;
