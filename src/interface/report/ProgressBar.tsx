import Tooltip from 'interface/Tooltip';

interface Props {
  width: number;
  height: number;
  percentage: number;
  tooltip?: string;
}

const ProgressBar = ({ width, height, percentage, tooltip }: Props) => {
  const backgroundColor = 'rgba(0,0,0,.6)';
  const wipeFillColor = '#fb6d35';
  const killFillColor = '#1d9c07';
  // We use round stroke so there is additional width created by the border radius.
  // Remove the height(radius of the bar) from the width to make sure the bars presented at the correct width.
  const adjustedWidth = width - 2 * height;
  const fillColor = percentage === 100 ? killFillColor : wipeFillColor;
  const svg = (
    <svg className="ProgressBar icon" style={{ width, height }}>
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
          d={`M${height} ${height / 2} h 0 ${(adjustedWidth * percentage) / 100}`}
        />
      )}
    </svg>
  );
  if (tooltip) {
    return (
      <Tooltip content={tooltip}>
        <span style={{ display: 'inline-block', lineHeight: 0 }}>{svg}</span>
      </Tooltip>
    );
  }
  return svg;
};

export default ProgressBar;
