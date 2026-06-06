import Item from 'common/ITEMS/Item';
import safeMerge from '../../safeMerge';
import Cooking from './cooking';
import Enchants from './enchants';
import OTHERS from './others';
import Potions from './potions';
import Trinkets from './trinkets';

const items = {
  ...safeMerge(Cooking),
  ...safeMerge(Enchants),
  ...safeMerge(OTHERS),
  ...safeMerge(Potions),
  ...safeMerge(Trinkets),
} satisfies Record<string, Item>;

export default items;
