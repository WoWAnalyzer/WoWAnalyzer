import React from 'react';
import PropTypes from 'prop-types';

import STATISTIC_CATEGORY from './STATISTIC_CATEGORY';
import StatisticBox from './StatisticBox';

export { default as STATISTIC_ORDER } from './STATISTIC_ORDER';

const ItemStatisticBox = ({ className, ...others }) => (
  <StatisticBox
    {...others}
    className={`panel statistic-box item ${className || ''}`}
  />
);
ItemStatisticBox.propTypes = {
  className: PropTypes.string,
};
ItemStatisticBox.defaultProps = {
  category: STATISTIC_CATEGORY.ITEMS,
};

export default ItemStatisticBox;
