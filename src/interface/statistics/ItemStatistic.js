/**
 * Use this for Items so they're put in the right category.
 */
import React from 'react';
import PropTypes from 'prop-types';

import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

import Statistic from './Statistic';

const ItemStatistic = props => <Statistic {...props} />;
ItemStatistic.propTypes = {
  category: PropTypes.string,
};
ItemStatistic.defaultProps = {
  category: STATISTIC_CATEGORY.ITEMS,
  position: STATISTIC_ORDER.OPTIONAL(0),
};

export default ItemStatistic;
