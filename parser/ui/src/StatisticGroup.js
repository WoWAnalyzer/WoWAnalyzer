import React from 'react';
import PropTypes from 'prop-types';

import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const StatisticGroup = ({ children, large, wide, style, ...others }) => (
  <div
    className={wide ? 'col-md-6 col-sm-12 col-xs-12' : 'col-lg-3 col-md-4 col-sm-6 col-xs-12'}
    style={{ padding: 0, ...style }}
    {...others}
  >
    {children}
  </div>
);
StatisticGroup.propTypes = {
  children: PropTypes.node.isRequired,
  large: PropTypes.bool,
  wide: PropTypes.bool,
  style: PropTypes.object,
  // eslint-disable-next-line react/no-unused-prop-types
  category: PropTypes.oneOf(Object.values(STATISTIC_CATEGORY)),
  // eslint-disable-next-line react/no-unused-prop-types
  position: PropTypes.number,
};

export default StatisticGroup;
