import React from 'react';
import PropTypes from 'prop-types';

import './StatisticBox.css';

export { default as STATISTIC_ORDER } from './STATISTIC_ORDER';

const StatisticBox = ({ icon, value, tooltip, label, ...others }) => (
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
            {tooltip ? <dfn data-tip={tooltip}>{label}</dfn> : label}
          </div>
        </div>
      </div>
    </div>
  </div>
);
StatisticBox.propTypes = {
  icon: PropTypes.node.isRequired,
  value: PropTypes.node.isRequired,
  tooltip: PropTypes.string,
  label: PropTypes.node.isRequired,
};

export default StatisticBox;
