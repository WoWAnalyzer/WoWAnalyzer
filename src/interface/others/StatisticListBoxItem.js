import React from 'react';
import PropTypes from 'prop-types';

const StatisticListBoxItem = ({ title, value, titleTooltip, valueTooltip}) => {
  return (
    <div className="flex">
      <div className="flex-main">
        {titleTooltip ? <dfn data-tip={titleTooltip}>{title}</dfn> : title}
      </div>
      <div className="flex-sub text-right">
        {valueTooltip ? <dfn data-tip={valueTooltip}>{value}</dfn> : value}
      </div>
    </div>
  );
};

StatisticListBoxItem.propTypes = {
  title: PropTypes.node.isRequired,
  value: PropTypes.node.isRequired,
  titleTooltip: PropTypes.string,
  valueTooltip: PropTypes.string,
};

export default StatisticListBoxItem;
