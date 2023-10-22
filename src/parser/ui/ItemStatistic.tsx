/**
 * Use this for Items so they're put in the right category.
 */

import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import Statistic from './Statistic';

const ItemStatistic = (props: React.ComponentProps<typeof Statistic>) => (
  <Statistic
    category={STATISTIC_CATEGORY.ITEMS}
    position={STATISTIC_ORDER.OPTIONAL(0)}
    {...props}
  />
);

// this is needed for the Masonry wrapper
ItemStatistic.defaultProps = {
  category: STATISTIC_CATEGORY.ITEMS,
  position: STATISTIC_ORDER.OPTIONAL(0),
};

export default ItemStatistic;
