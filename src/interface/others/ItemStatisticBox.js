import React from 'react';

import STATISTIC_CATEGORY from './STATISTIC_CATEGORY';
import StatisticBox from './StatisticBox';

export { default as STATISTIC_ORDER } from './STATISTIC_ORDER';

const ItemStatisticBox = props => <StatisticBox {...props} />;
ItemStatisticBox.defaultProps = {
  category: STATISTIC_CATEGORY.ITEMS,
};

export default ItemStatisticBox;
