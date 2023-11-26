import DataSeries from './DataSeries';

/**
 * Represents the configuration options for the individual graphs that
 * should be rendered.
 */
type GraphDataType = {
  graphData: DataSeries[];
  /** timestamp to start rendering the graph at */
  startTime: number;
  /** timestamp to end rendering the graph at */
  endTime: number;
  /** Optional title, used for multigraph rendering.
   * Will not render on single graphs*/
  title?: string;
  error?: JSX.Element;
};

export default GraphDataType;
