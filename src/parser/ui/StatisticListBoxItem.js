import React from 'react';
import PropTypes from 'prop-types';
import { TooltipElement } from 'interface';

/**
 * @deprecated Use `parser/ui/Statistic` instead.
 */
const StatisticListBoxItem = ({ title, value, titleTooltip, valueTooltip}) => (
    <div className="flex">
      <div className="flex-main">
        {titleTooltip ? <TooltipElement content={titleTooltip}>{title}</TooltipElement> : title}
      </div>
      <div className="flex-sub text-right">
        {valueTooltip ? <TooltipElement content={valueTooltip}>{value}</TooltipElement> : value}
      </div>
    </div>
  );
StatisticListBoxItem.propTypes = {
  title: PropTypes.node.isRequired,
  value: PropTypes.node.isRequired,
  titleTooltip: PropTypes.node,
  valueTooltip: PropTypes.node,
};

export default StatisticListBoxItem;
