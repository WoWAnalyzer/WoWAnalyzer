import React from 'react';
import PropTypes from 'prop-types';

import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

import './Statistic.css';

const Statistic = ({ children, large, wide }) => (
  <div className={wide ? 'col-md-6 col-sm-12 col-xs-12' : 'col-lg-3 col-md-4 col-sm-6 col-xs-12'}>
    <div className={`panel statistic ${large ? 'large' : null}`}>
      <div className="panel-body">
        {children}
      </div>
    </div>
  </div>
);
Statistic.propTypes = {
  children: PropTypes.node.isRequired,
  large: PropTypes.bool,
  wide: PropTypes.bool,
  // eslint-disable-next-line react/no-unused-prop-types
  category: PropTypes.oneOf(STATISTIC_CATEGORY),
  // eslint-disable-next-line react/no-unused-prop-types
  position: PropTypes.number,
};

export default Statistic;
