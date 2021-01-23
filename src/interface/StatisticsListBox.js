import React from 'react';
import PropTypes from 'prop-types';

import { TooltipElement } from 'common/Tooltip';

import './StatisticBox.css';
import STATISTIC_CATEGORY from './STATISTIC_CATEGORY';

export { default as STATISTIC_ORDER } from './STATISTIC_ORDER';

/**
 * @deprecated Use `interface/statistic/Statistic` instead.
 */
const StatisticsListBox = ({ title, tooltip, children, bodyStyle, ...others }) => {
  delete others.category;
  delete others.position;
  return (
    <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
      <div className="panel statistic statistic-box statistic-box-list" {...others}>
        {title && (
          <div className="panel-heading">
            <h2>{tooltip ? <TooltipElement content={tooltip}>{title}</TooltipElement> : title}</h2>
          </div>
        )}
        <div className="panel-body items" style={bodyStyle}>
          {children}
        </div>
      </div>
    </div>
  );
};
StatisticsListBox.propTypes = {
  title: PropTypes.node,
  children: PropTypes.node.isRequired,
  tooltip: PropTypes.node,
  bodyStyle: PropTypes.object,
  category: PropTypes.string,
  position: PropTypes.number,
};
StatisticsListBox.defaultProps = {
  category: STATISTIC_CATEGORY.GENERAL,
};

export default StatisticsListBox;
