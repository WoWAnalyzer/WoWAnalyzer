import React from 'react';
import PropTypes from 'prop-types';

const BACKGROUND_COLOR = 'rgba(0,0,0,.6)';
const FILL_COLOR = '#fb6d35';
const FULL_FILL_COLOR = '#1d9c07';

const ProgressBar = ({ width, height, percentage, style, ...others }) => {
  // We use round stroke so there is additional width created by the border radius.
  // Remove the height(radius of the bar) from the width to make sure the bars presented at the correct width.
  const adjustedWidth = width - 2 * height;
  const fillColor = percentage === 100 ? FULL_FILL_COLOR : FILL_COLOR;
  return (
    <svg
      className="ProgressBar"
      style={{ width, height, ...style }}
      {...others}
    >
      <path
        strokeWidth={height}
        stroke={BACKGROUND_COLOR}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
        d={`M${height} ${height / 2} h 0 ${adjustedWidth}`}
      />
      {!!percentage && (
        <path
          strokeWidth={height}
          stroke={fillColor}
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
          d={`M${height} ${height / 2} h 0 ${adjustedWidth * percentage / 100}`}
        />
      )}
    </svg>
  );
};
ProgressBar.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  percentage: PropTypes.number,
  style: PropTypes.object,
};
ProgressBar.defaultProps = {
  width: 150,
  height: 3,
  percentage: 0,
  style: {},
};

export default ProgressBar;
