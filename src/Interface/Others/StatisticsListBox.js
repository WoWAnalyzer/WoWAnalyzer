import React from 'react';
import PropTypes from 'prop-types';

import './StatisticBox.css';

export { default as STATISTIC_ORDER } from './STATISTIC_ORDER';

const StatisticsListBox = ({ title, tooltip, children, bodyStyle, containerProps, ...others }) => (
  <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12" {...containerProps}>
    <div className="panel statistic-box statistic-list" {...others}>
      {title && (
        <div className="panel-heading">
          <h2>{tooltip ? <dfn data-tip={tooltip}>{title}</dfn> : title}</h2>
        </div>
      )}
      <div className="panel-body items" style={bodyStyle}>
        {children}
      </div>
    </div>
  </div>
);
StatisticsListBox.propTypes = {
  title: PropTypes.node,
  children: PropTypes.node.isRequired,
  tooltip: PropTypes.string,
  bodyStyle: PropTypes.object,
  containerProps: PropTypes.object,
};

export default StatisticsListBox;
