import React, { useState } from 'react';
import './Styling.scss';
import { GraphDataType } from './types';
import ExplanationGraphHeader from './ExplanationGraphHeader';
import ExplanationGraphContainer from './ExplanationGraphContainer';
import ExplanationGraphChart from './ExplanationGraphChart';

type Props = {
  fightStartTime: number;
  fightEndTime: number;
  graphData: GraphDataType[];
  yAxisName: string;
  explanations?: JSX.Element[];
};

const ExplanationGraph: React.FC<Props> = ({
  fightStartTime,
  fightEndTime,
  graphData,
  yAxisName,
  explanations,
}) => {
  /** Logic for handling display of windows */
  const [currentWindowIndex, setCurrentWindowIndex] = useState(0);

  const onChangeCurrentWindowIndex = (index: number) => {
    setCurrentWindowIndex(index);
  };

  if (graphData.length === 0) {
    return (
      <div>
        <big>No data to display.</big>
      </div>
    );
  }

  return (
    <div className={explanations ? 'graph-explanation-container' : ''}>
      {explanations && explanations[currentWindowIndex]}
      <div className="graph-window-container">
        {graphData.length > 1 && (
          <ExplanationGraphHeader
            graphData={graphData}
            currentWindowIndex={currentWindowIndex}
            onChangeCurrentWindowIndex={onChangeCurrentWindowIndex}
          />
        )}
        <ExplanationGraphContainer graphData={graphData} currentWindowIndex={currentWindowIndex}>
          <ExplanationGraphChart
            graphData={graphData}
            currentWindowIndex={currentWindowIndex}
            yAxisName={yAxisName}
            fightStartTime={fightStartTime}
          />
        </ExplanationGraphContainer>
      </div>
    </div>
  );
};

export default ExplanationGraph;
