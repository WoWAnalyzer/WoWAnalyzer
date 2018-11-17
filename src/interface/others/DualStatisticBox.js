import React from 'react';
import PropTypes from 'prop-types';

import STATISTIC_CATEGORY from './STATISTIC_CATEGORY';

export { default as STATISTIC_ORDER } from './STATISTIC_ORDER';
export { default as STATISTIC_CATEGORY } from './STATISTIC_CATEGORY';

const DualStatisticBox = ({
  icon,
  values,
  tooltip,
  footer,
  containerProps,
  alignIcon,
}) => (
  <div className="col-md-4 col-sm-6 col-xs-12" {...containerProps}>
    <div className="panel statistic-box">
      <div className="panel-body flex">
        <div
          className="flex-sub"
          style={{ display: 'flex', alignItems: alignIcon }}
        >
          {icon}
        </div>
        <div className="flex-main flex-column">
          {values.map((val, i) => (
            <div key={`${i}${val}`} className="panel-cell value">
              {val}
            </div>
          ))}
        </div>
      </div>
      {footer && <div className="panel-footer">{footer}</div>}
    </div>
  </div>
);
DualStatisticBox.propTypes = {
  icon: PropTypes.node.isRequired,
  values: PropTypes.node.isRequired,
  tooltip: PropTypes.string,
  containerProps: PropTypes.object,
  alignIcon: PropTypes.string,
  footer: PropTypes.node,
  category: PropTypes.string,
  position: PropTypes.number,
};
DualStatisticBox.defaultProps = {
  alignIcon: 'center',
  category: STATISTIC_CATEGORY.GENERAL,
};

export default DualStatisticBox;
