import safeMerge from '../../safeMerge';
import OTHERS from './others';
import Cooking from 'common/ITEMS/classic/cooking';

const items = {
  ...safeMerge(Cooking),
  ...safeMerge(OTHERS),
};
export default items;
