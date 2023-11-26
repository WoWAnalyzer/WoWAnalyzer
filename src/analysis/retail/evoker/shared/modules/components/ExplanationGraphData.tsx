import './Styling.scss';
import { GraphDataType, DataSeries, SpellTracker } from './types';

type Props = {
  data: DataSeries[];
  startTime: number;
  endTime: number;
  title?: string;
  error?: JSX.Element;
};

/**
 * Function to generate GraphData from a list of DataSeries.
 * This function will look through the dataSeries and produce
 * a formatted set that falls within the given time range.
 * then it will return the graphData.
 * @param data The dataseries you want to include in the graph
 * @param startTime Startime for graph
 * @param endTime Endtime for graph
 * @param title Optional title for multigraphs
 * @returns GraphData object.
 */
const ExplanationGraphData = ({ data, endTime, startTime, error, title }: Props): GraphDataType => {
  /** Try to catch problem cases */
  if (data.length === 0 || error) {
    const graphData: GraphDataType = {
      graphData: data,
      title: title,
      startTime: startTime,
      endTime: endTime,
      error: error,
    };
    return graphData;
  }
  const filteredData: DataSeries[] = [];
  data.forEach((series) => {
    if (series.spellTracker.length === 0) {
      return;
    }

    // Make new filtered SpellTracker
    const filteredSpellTracker: SpellTracker[] = [];

    // Make sure the data is in the right order
    series.spellTracker.sort((a, b) => a.timestamp - b.timestamp);

    let prevEntry: SpellTracker = series.spellTracker[0];
    let endFound = false;

    for (const entry of series.spellTracker) {
      const timestamp = entry.timestamp;
      const count = entry.count;

      if (timestamp < startTime && series.type !== 'point') {
        filteredSpellTracker[0] = { timestamp: startTime, count: count };
        prevEntry = entry;
      }

      if (timestamp >= startTime && timestamp <= endTime) {
        if (filteredSpellTracker.length === 0 && series.type !== 'point') {
          // Give initial value so a line doesnt just abruptly appear
          filteredSpellTracker.push({
            timestamp: startTime,
            count: 0,
            tooltip: entry.tooltip,
          });
        }
        filteredSpellTracker.push({
          timestamp: timestamp,
          count: count,
          tooltip: entry.tooltip,
        });
        prevEntry = entry;
      } else if (timestamp > endTime) {
        if (series.type !== 'point') {
          filteredSpellTracker.push({
            timestamp: endTime,
            count: prevEntry.count,
            tooltip: entry.tooltip,
          });
        }
        endFound = true;
        break;
      }
    }

    if (!endFound && series.type !== 'point') {
      filteredSpellTracker.push({
        timestamp: endTime,
        count: prevEntry.count,
      });
    }

    filteredData.push({
      spellTracker: filteredSpellTracker,
      type: series.type,
      color: series.color,
      label: series.label,
      strokeWidth: series.strokeWidth,
      hideTooltip: series.hideTooltip,
    });
  });

  const graphData: GraphDataType = {
    graphData: filteredData,
    title: title,
    startTime: startTime,
    endTime: endTime,
    error: error,
  };
  return graphData;
};

export default ExplanationGraphData;
