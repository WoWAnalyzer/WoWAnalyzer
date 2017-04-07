import React from 'react';

const StatisticBox = ({ icon, value, label }) => (
  <div className="panel statistic-box">
    <div className="panel-body">
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
  icon: React.PropTypes.node.isRequired,
  value: React.PropTypes.node.isRequired,
  label: React.PropTypes.node.isRequired,
};

export default StatisticBox;