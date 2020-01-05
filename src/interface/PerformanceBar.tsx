import React from 'react';

import colorForPerformance from 'common/colorForPerformance';

interface Props {
  percent: number;
}

const PerformanceBar = ({ percent }: Props) => (
  <div className="performance-bar-container">
    <div
      className="performance-bar"
      style={{
        width: `${percent * 100}%`,
        transition: 'background-color 800ms',
        backgroundColor: colorForPerformance(percent),
      }}
    />
  </div>
);

export default PerformanceBar;
