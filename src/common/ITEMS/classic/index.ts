import safeMerge from '../../safeMerge';
import Cooking from './cooking';
import OTHERS from './others';
import Trinkets from './trinkets';

const items = {
  ...safeMerge(Cooking),
  ...safeMerge(OTHERS),
  ...safeMerge(Trinkets),
};
export default items;
