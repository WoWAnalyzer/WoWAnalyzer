import React from 'react';
import PropTypes from 'prop-types';

import './StatisticBox.css';
import STATISTIC_CATEGORY from './STATISTIC_CATEGORY';

export { default as STATISTIC_ORDER } from './STATISTIC_ORDER';

const ItemStatisticBox = ({ icon, value, tooltip, label, containerProps, alignIcon, ...others }) => {
  delete others.category;
  delete others.position;
  return (
    <div className="col-md-4 col-sm-6 col-xs-12" {...containerProps}>
      <div className="panel statistic-box item" {...others}>
        <div className="panel-body flex">
          <div className="flex-sub statistic-icon" style={{ display: 'flex', alignItems: alignIcon }}>
            {icon}
          </div>
          <div className="flex-main">
            <div className="slabel">
              {label}
            </div>
            <div className="value">
              {value}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
ItemStatisticBox.propTypes = {
  icon: PropTypes.node.isRequired,
  value: PropTypes.node.isRequired,
  tooltip: PropTypes.string,
  label: PropTypes.node.isRequired,
  containerProps: PropTypes.object,
  alignIcon: PropTypes.string,
  category: PropTypes.string,
  position: PropTypes.number,
};
ItemStatisticBox.defaultProps = {
  alignIcon: 'center',
  category: STATISTIC_CATEGORY.ITEMS,
};

export default ItemStatisticBox;
