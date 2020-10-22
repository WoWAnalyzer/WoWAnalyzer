import React from 'react';

interface Props {
  width: number;
  height: number;
  percentage: number;
}

const ProgressBar = ({ width, height, percentage }: Props) => {
  const backgroundColor = 'rgba(0,0,0,.6)';
  const wipeFillColor = '#fb6d35';
  const killFillColor = '#1d9c07';
  // We use round stroke so there is additional width created by the border radius.
  // Remove the height(radius of the bar) from the width to make sure the bars presented at the correct width.
  const adjustedWidth = width - 2 * height;
  const fillColor = percentage === 100 ? killFillColor : wipeFillColor;
  return (
    <svg
      className="ProgressBar icon"
      style={{ width, height }}
    >
      <path
        strokeWidth={height}
        stroke={backgroundColor}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
        d={`M${height} ${height / 2} h 0 ${adjustedWidth}`}
      />
      {Boolean(percentage) && (
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

export default ProgressBar;
