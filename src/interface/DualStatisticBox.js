import React from 'react';
import PropTypes from 'prop-types';

import Statistic from 'interface/statistics/Statistic';

import STATISTIC_CATEGORY from './STATISTIC_CATEGORY';

export { default as STATISTIC_ORDER } from './STATISTIC_ORDER';

/**
 * @deprecated Use `interface/statistics/*` instead (add a component to display dual spell values and use that instead).
 */
const DualStatisticBox = ({
  icon,
  values,
  footer,
  alignIcon,
  ...others
}) => (
  <Statistic {...others}>
    <div className="pad">
      <small>{footer}</small>

      <div className="flex" style={{ marginTop: 15 }}>
        <div
          className="flex-sub"
          style={{ display: 'flex', alignItems: alignIcon, minWidth: 30 }}
        >
          {icon}
        </div>
        <div className="flex-main flex horizontal">
          {values.map((val, i) => (
            <div key={`${i}${val}`} className="panel-cell value">
              {val}
            </div>
          ))}
        </div>
        </div>
    </div>
  </Statistic>
);
DualStatisticBox.propTypes = {
  icon: PropTypes.node.isRequired,
  values: PropTypes.node.isRequired,
  alignIcon: PropTypes.string,
  footer: PropTypes.node,
};
DualStatisticBox.defaultProps = {
  alignIcon: 'center',
  category: STATISTIC_CATEGORY.GENERAL,
};

export default DualStatisticBox;
