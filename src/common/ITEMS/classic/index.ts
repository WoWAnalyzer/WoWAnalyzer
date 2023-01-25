import { itemIndexableList } from 'common/ITEMS/Item';
import safeMerge from '../../safeMerge';
import Cooking from './cooking';
import OTHERS from './others';
import Trinkets from './trinkets';

const items = itemIndexableList({
  ...safeMerge(Cooking),
  ...safeMerge(OTHERS),
  ...safeMerge(Trinkets),
});

export default items;
