import React from 'react';
import PropTypes from 'prop-types';

const BACKGROUND_COLOR = '#fff';
const FILL_COLOR = '#fb6d35';
const FULL_FILL_COLOR = '#1d9c07';

const ProgressBar = props => {
  const { width, height, percentage } = props;
  // We use round stroke so there is additional width created by the border radius.
  // Add the height(radius of the bar) to the wrapper's width to make sure the bars presented correctly.
  const wrapperWidth = width + 2 * height;
  const fillColor = percentage === 100 ? FULL_FILL_COLOR : FILL_COLOR;
  return (
    <svg
      className="ProgressBar"
      width={wrapperWidth}
    >
      <path
        strokeWidth={height}
        stroke={BACKGROUND_COLOR}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
        d={`M${height} ${height / 2} h 0 ${width}`}
      />
      {!!percentage && 
        <path
          strokeWidth={height}
          stroke={fillColor}
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
          d={`M${height} ${height / 2} h 0 ${width * percentage / 100}`}
        />
      }
    </svg>
  );
};

ProgressBar.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  percentage: PropTypes.number,
};

ProgressBar.defaultProps = {
  width: 150,
  height: 3,
  percentage: 0,
};

export default ProgressBar;
