import '../Styling.scss';
import { DataSeries } from 'analysis/retail/evoker/shared/modules/components/types';
import ExplanationGraphData from 'analysis/retail/evoker/shared/modules/components/ExplanationGraphData';
import { DamageWindow } from './BreathOfEonsHelper';

type Props = {
  topWindow: DamageWindow;
  topWindowOptimal: DamageWindow;
  breathStart: number;
  breathEnd: number;
  damageInRange: number;
  buffer: number;
};

const GraphDataForWindow = ({
  breathEnd,
  breathStart,
  damageInRange,
  topWindow,
  topWindowOptimal,
  buffer,
}: Props) => {
  const dataSeries: DataSeries[] = !topWindow
    ? []
    : [
        {
          spellTracker: [
            {
              timestamp: breathStart,
              count: 1,
            },
            {
              timestamp: breathEnd,
              count: 0,
            },
          ],
          type: 'area',
          color: '#736F4E',
          label: 'Current timing',
          strokeWidth: 5,
        },
        {
          spellTracker: [
            {
              timestamp: topWindow.start,
              count: 1 * (topWindow.sum / damageInRange),
            },
            {
              timestamp: topWindow.end,
              count: 0,
            },
          ],
          type: 'area',
          color: '#4C78A8',
          label: 'Optimal timing',
          strokeWidth: 5,
        },
      ];

  if (topWindow && topWindowOptimal) {
    const optimalSources = topWindowOptimal.sumSources
      .map((player) => player.sourceID)
      .sort((a, b) => a - b)
      .toString();
    const currentSources = topWindow.sumSources
      .map((player) => player.sourceID)
      .sort((a, b) => a - b)
      .toString();

    if (optimalSources !== currentSources && topWindow) {
      dataSeries.push({
        spellTracker: [
          {
            timestamp: topWindowOptimal.start,
            count: 1 * (topWindowOptimal.sum / damageInRange),
          },
          {
            timestamp: topWindowOptimal.end,
            count: 0,
          },
        ],
        type: 'area',
        color: '#88D498',
        label: 'Optimal targets timing',
        strokeWidth: 5,
      });
    }
  }

  const newGraphData = ExplanationGraphData({
    data: dataSeries,
    startTime: breathStart - buffer,
    endTime: breathEnd + buffer,
    title: 'Breath Window',
    error: !topWindow ? <>You didn't hit anything.</> : undefined,
  });

  return newGraphData;
};

export default GraphDataForWindow;
