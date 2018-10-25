import React from 'react';
import PropTypes from 'prop-types';
import colorForPerformance from 'parser/shared/modules/features/Checklist2/helpers/colorForPerformance';

class PerformanceBar extends React.Component {
  static propTypes = {
    percent: PropTypes.number.isRequired,
  };

  render() {
    return (
      <div className="performance-bar-container">
        <div
          className="performance-bar"
          style={{
            width: `${this.props.percent * 100}%`,
            transition: 'background-color 800ms',
            backgroundColor: colorForPerformance(this.props.percent),
          }}
        />
      </div>
    );
  }
}

export default PerformanceBar;
