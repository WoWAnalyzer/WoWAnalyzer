import React from 'react';
import PropTypes from 'prop-types';

import './StatisticBox.css';

const StatisticBox = ({ icon, value, label, ...others }) => (
  <div className="panel statistic-box" {...others}>
    <div className="panel-body">
      <div className="row">
        <div className="col-xs-3">
          {icon}
        </div>
        <div className="col-xs-9 text-right">
          <div className="statistic-value">
            {value}
          </div>
          <div className="statistic-label">
            {label}
          </div>
        </div>
      </div>
    </div>
  </div>
);
StatisticBox.propTypes = {
  icon: PropTypes.node.isRequired,
  value: PropTypes.node.isRequired,
  label: PropTypes.node.isRequired,
};

export default StatisticBox;