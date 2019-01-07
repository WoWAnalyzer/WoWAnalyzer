import React from 'react';
import PropTypes from 'prop-types';
import { TooltipElement } from 'common/Tooltip';

/**
 * @deprecated Use `interface/statistic/Statistic` instead.
 */
const StatisticListBoxItem = ({ title, value, titleTooltip, valueTooltip}) => {
  return (
    <div className="flex">
      <div className="flex-main">
        {titleTooltip ? <TooltipElement style={{ display: 'inline' }} content={titleTooltip}>{title}</TooltipElement> : title}
      </div>
      <div className="flex-sub text-right">
        {valueTooltip ? <TooltipElement style={{ display: 'inline' }} content={valueTooltip}>{value}</TooltipElement> : value}
      </div>
    </div>
  );
};

StatisticListBoxItem.propTypes = {
  title: PropTypes.node.isRequired,
  value: PropTypes.node.isRequired,
  titleTooltip: PropTypes.node,
  valueTooltip: PropTypes.node,
};

export default StatisticListBoxItem;
