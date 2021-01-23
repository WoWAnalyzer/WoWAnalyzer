import React from 'react';
import PropTypes from 'prop-types';

import { TooltipElement } from 'common/Tooltip';

import './StatisticBox.css';
import STATISTIC_CATEGORY from './STATISTIC_CATEGORY';

export { default as STATISTIC_ORDER } from './STATISTIC_ORDER';

/**
 * @deprecated Use `interface/statistic/Statistic` instead.
 */
const SmallStatisticBox = ({ icon, value, tooltip, label, ...others }) => {
  delete others.category;
  delete others.position;
  return (
    <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
      <div className="panel statistic statistic-box small" {...others}>
        <div className="panel-body flex wrapable">
          <div className="flex-main">
            {icon} {label}
          </div>
          <div className="flex-sub text-right">
            {tooltip ? <TooltipElement content={tooltip}>{value}</TooltipElement> : value}
          </div>
        </div>
      </div>
    </div>
  );
};
SmallStatisticBox.propTypes = {
  icon: PropTypes.node.isRequired,
  value: PropTypes.node.isRequired,
  tooltip: PropTypes.node,
  label: PropTypes.node.isRequired,
  category: PropTypes.string,
  position: PropTypes.number,
};
SmallStatisticBox.defaultProps = {
  category: STATISTIC_CATEGORY.GENERAL,
};

export default SmallStatisticBox;
