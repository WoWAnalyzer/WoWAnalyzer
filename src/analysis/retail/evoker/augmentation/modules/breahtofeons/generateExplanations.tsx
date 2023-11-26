import { BreathOfEonsWindows } from './BreathOfEonsRotational';
import '../Styling.scss';
import {
  DataSeries,
  GraphDataType,
  SpellTracker,
} from 'analysis/retail/evoker/shared/modules/components/types';
import ExplanationGraphData from 'analysis/retail/evoker/shared/modules/components/ExplanationGraphData';
import GraphExplanationsTable from './GraphExplanationsTable';

type Params = {
  windows: BreathOfEonsWindows[];
  graphData: GraphDataType[];
  ebonMightCount: SpellTracker[];
  shiftingSandsCount: SpellTracker[];
};

const generateExplanations = ({
  windows,
  graphData,
  ebonMightCount,
  shiftingSandsCount,
}: Params) => {
  if (graphData.length > 0 || windows.length === 0) {
    return [];
  }

  const explanations: JSX.Element[] = [];

  /** Generate graph data for Breath Windows */
  for (const window of windows) {
    const dataSeries: DataSeries[] = [
      {
        spellTracker: window.breathPerformance.temporalWoundsCounter,
        type: 'area',
        color: '#736F4E',
        label: 'Temporal Wounds',
        strokeWidth: 3,
      },
      {
        spellTracker: window.flightData,
        type: 'area',
        color: '#FF6B6B',
        label: 'Flight Time',
        strokeWidth: 3,
      },
      {
        spellTracker: ebonMightCount,
        type: 'line',
        color: '#F3A738',
        label: 'Ebon Might',
        size: 4,
      },
      {
        spellTracker: shiftingSandsCount,
        type: 'line',
        color: '#F7EC59',
        label: 'Shifting Sands',
        size: 4,
      },
      {
        spellTracker: window.breathPerformance.damageProblemPoints,
        type: 'point',
        color: 'red',
        label: 'Problem Points',
        size: 120,
      },
      {
        spellTracker: window.breathPerformance.ebonMightProblems,
        type: 'point',
        color: 'red',
        label: 'Problem Points',
        size: 120,
      },
    ];
    const error =
      window.breathPerformance.temporalWoundsCounter.length > 0 ? undefined : (
        <div>You didn't hit anything</div>
      );
    const newGraphData = ExplanationGraphData({
      data: dataSeries,
      startTime: window.start - 3000,
      endTime: window.end + 3000,
      title: 'Breath Window',
      error: error,
    });
    graphData.push(newGraphData);

    /** Generate our explanations */
    const content =
      window.breathPerformance.temporalWoundsCounter.length === 0 ? (
        <div></div>
      ) : (
        <GraphExplanationsTable window={window} />
      );
    explanations.push(content);
  }

  return explanations;
};

export default generateExplanations;
