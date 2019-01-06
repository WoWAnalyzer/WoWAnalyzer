import React from 'react';
import PropTypes from 'prop-types';

import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

import './Statistic.scss';
import './StatisticBar.scss';

const StatisticBar = ({ children, large, wide, ultrawide, ...others }) => (
  <div className={ultrawide ? 'col-md-12' : (wide ? 'col-md-6 col-sm-12 col-xs-12' : 'col-lg-3 col-md-4 col-sm-6 col-xs-12')}>
    <div className="panel statistic bar" {...others}>
      <div className="panel-body">
        {children}
      </div>
    </div>
  </div>
);
StatisticBar.propTypes = {
  children: PropTypes.node.isRequired,
  large: PropTypes.bool,
  wide: PropTypes.bool,
  ultrawide: PropTypes.bool,
  // eslint-disable-next-line react/no-unused-prop-types
  category: PropTypes.oneOf(Object.values(STATISTIC_CATEGORY)),
  // eslint-disable-next-line react/no-unused-prop-types
  position: PropTypes.number,
};

export default StatisticBar;
