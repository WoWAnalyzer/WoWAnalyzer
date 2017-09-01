import React from 'react';
import PropTypes from 'prop-types';

import './StatisticBox.css';

export { default as STATISTIC_ORDER } from './STATISTIC_ORDER';

const StatisticsListBox = ({ title, tooltip, children, ...others }) => (
  <div className="col-lg-4 col-sm-6 col-xs-12">
    <div className="panel statistic-box statistic-list" {...others}>
      <div className="panel-heading">
        <h2>{tooltip ? <dfn data-tip={tooltip}>{title}</dfn> : title}</h2>
      </div>
      <div className="panel-body items">
        {children}
      </div>
    </div>
  </div>
);
StatisticsListBox.propTypes = {
  title: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  tooltip: PropTypes.string,
};

export default StatisticsListBox;
