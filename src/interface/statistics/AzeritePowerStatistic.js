/**
 * Use this for Azerite Powers so they're put in the right category.
 */
import React from 'react';
import PropTypes from 'prop-types';

import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

import Statistic from './Statistic';

const AzeritePowerStatistic = props => <Statistic {...props} />;
AzeritePowerStatistic.propTypes = {
  category: PropTypes.string,
};
AzeritePowerStatistic.defaultProps = {
  category: STATISTIC_CATEGORY.ITEMS,
  position: STATISTIC_ORDER.OPTIONAL(),
};

export default AzeritePowerStatistic;
