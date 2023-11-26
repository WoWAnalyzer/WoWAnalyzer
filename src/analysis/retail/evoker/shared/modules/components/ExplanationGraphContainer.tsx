import React from 'react';
import './Styling.scss';
import { GraphDataType } from './types';

type Props = {
  graphData: GraphDataType[];
  currentWindowIndex: number;
};

const ExplanationGraphContainer: React.FC<Props> = ({
  children,
  graphData,
  currentWindowIndex,
}) => {
  // If the x-axis is too long, we enable horizontal scrolling, for better readability
  const graphLength =
    graphData[currentWindowIndex].endTime - graphData[currentWindowIndex].startTime;
  const threshold = 0.6 * 60 * 1000;

  // Calculate the width percentage so the graph has consistent size
  const widthPercentage = graphLength > threshold ? (graphLength / threshold) * 100 : 100;

  return (
    <div
      className="graph-container"
      style={{
        width: '100%',
        overflowX: graphLength > threshold ? 'auto' : 'hidden', // Enable horizontal scrolling if the data length exceeds the threshold
      }}
    >
      {!graphData[currentWindowIndex].error ? (
        <div
          style={{
            padding: graphLength > threshold ? '0 0 30px' : '0 0 0px', // Add padding so scrollbar doesn't overlap x-axis
            width: `${widthPercentage}%`,
            overflowY: 'hidden',
            minHeight: 250,
          }}
        >
          {children}
        </div>
      ) : (
        graphData[currentWindowIndex].error
      )}
    </div>
  );
};

export default ExplanationGraphContainer;
