import SpellTracker from './SpellTracker';

/**
 * Represents a series of data points for the graph, including information
 * about individual SpellTrackers, their visualization type (point, line, area),
 * and color.
 * This is the data we hand to Vega for graphing.
 */
type DataSeries = {
  spellTracker: SpellTracker[];
  /** The type of data this is */
  type: 'area' | 'line' | 'point';
  color: string;
  /** Legend */
  label: string;
  strokeWidth?: number;
  size?: number;
  hideTooltip?: boolean;
};

export default DataSeries;
