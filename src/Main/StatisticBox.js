import React from 'react';

const StatisticBox = ({ color, icon, value, label, inverse }) => (
  <div className="col-xs-3">
    <div className="statistic-box">
      <div className="row">
        <div className="col-xs-3">
          {icon}
        </div>
        <div className="col-xs-9 text-right">
          <div className="statistic-value">
            {value}
          </div>
          <div className="statistic-label">
            {label}
          </div>
        </div>
      </div>
    </div>
  </div>

);
StatisticBox.propTypes = {
  color: React.PropTypes.string.isRequired,
  icon: React.PropTypes.node.isRequired,
  value: React.PropTypes.node.isRequired,
  label: React.PropTypes.node.isRequired,
  inverse: React.PropTypes.bool,
};

export default StatisticBox;