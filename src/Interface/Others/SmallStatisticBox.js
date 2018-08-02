import React from 'react';
import PropTypes from 'prop-types';

import './StatisticBox.css';
import STATISTIC_CATEGORY from './STATISTIC_CATEGORY';

export { default as STATISTIC_ORDER } from './STATISTIC_ORDER';
export { default as STATISTIC_CATEGORY } from './STATISTIC_CATEGORY';

const SmallStatisticBox = ({ icon, value, tooltip, label, containerProps, ...others }) => {
  delete others.category;
  delete others.position;
  return (
    <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12" {...containerProps}>
      <div className="panel statistic-box small" {...others}>
        <div className="panel-body flex wrapable">
          <div className="flex-main">
            {icon} {label}
          </div>
          <div className="flex-sub text-right">
            {tooltip ? <dfn data-tip={tooltip}>{value}</dfn> : value}
          </div>
        </div>
      </div>
    </div>
  );
};
SmallStatisticBox.propTypes = {
  icon: PropTypes.node.isRequired,
  value: PropTypes.node.isRequired,
  tooltip: PropTypes.string,
  label: PropTypes.node.isRequired,
  containerProps: PropTypes.object,
  category: PropTypes.string,
  position: PropTypes.number,
};
SmallStatisticBox.defaultProps = {
  category: STATISTIC_CATEGORY.ITEMS,
};

export default SmallStatisticBox;
