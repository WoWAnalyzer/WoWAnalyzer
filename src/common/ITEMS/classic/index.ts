import { itemIndexableList } from 'common/ITEMS/Item';
import safeMerge from '../../safeMerge';
import Cooking from './cooking';
import OTHERS from './others';
import Potions from './potions';
import Trinkets from './trinkets';

const items = itemIndexableList({
  ...safeMerge(Cooking),
  ...safeMerge(OTHERS),
  ...safeMerge(Potions),
  ...safeMerge(Trinkets),
});

export default items;
