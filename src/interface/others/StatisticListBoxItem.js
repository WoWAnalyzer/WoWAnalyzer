import React from 'react';
import PropTypes from 'prop-types';
import Tooltip from 'common/Tooltip';

const StatisticListBoxItem = ({ title, value, titleTooltip, valueTooltip}) => {
  return (
    <div className="flex">
      <div className="flex-main">
        {titleTooltip ? <Tooltip wrapperStyles={{ display: 'inline' }} content={titleTooltip}>{title}</Tooltip> : title}
      </div>
      <div className="flex-sub text-right">
        {valueTooltip ? <Tooltip wrapperStyles={{ display: 'inline' }} content={valueTooltip}>{value}</Tooltip> : value}
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
