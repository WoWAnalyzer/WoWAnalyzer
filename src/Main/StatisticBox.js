import React from 'react';

const StatisticBox = ({ color, icon, value, label, inverse }) => (
  <div className="col-xs-4">
    <div style={{ width: '100%', backgroundColor: color, borderRadius: 5, padding: '10px 15px', color: inverse ? '#000' : '#fff', marginBottom: 15 }}>
      <div className="row">
        <div className="col-xs-3">
          {icon}
        </div>
        <div className="col-xs-9 text-right">
          <div style={{ fontSize: '2.5em' }}>
            {value}
          </div>
          <div style={{ marginTop: '-0.3em' }}>
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