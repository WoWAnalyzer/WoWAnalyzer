import React from 'react';
import PropTypes from 'prop-types';

import './StatisticBox.css';

export { default as STATISTIC_ORDER } from './STATISTIC_ORDER';

const StatisticBox = ({ icon, value, tooltip, label, footer, footerStyle, containerProps, alignIcon, ...others }) => (
  <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12" {...containerProps}>
    <div className="panel statistic-box" {...others}>
      <div className="panel-body flex">
        <div className="flex-sub" style={{ display: 'flex', alignItems: alignIcon }}>
          {icon}
        </div>
        <div className="flex-main">
          <div className="value">
            {value}
          </div>
          <div className="slabel">
            {tooltip ? <dfn data-tip={tooltip}>{label}</dfn> : label}
          </div>
        </div>
      </div>
      {footer && (
        <div className="panel-footer" style={{ padding: 0, borderTop: 0, ...footerStyle }}>
          {footer}
        </div>
      )}
    </div>
  </div>
);
StatisticBox.propTypes = {
  icon: PropTypes.node.isRequired,
  value: PropTypes.node.isRequired,
  tooltip: PropTypes.string,
  label: PropTypes.node.isRequired,
  footer: PropTypes.node,
  footerStyle: PropTypes.object,
  containerProps: PropTypes.object,
  alignIcon: PropTypes.string,
};

StatisticBox.defaultProps = {
  alignIcon: 'center',
};

export default StatisticBox;
