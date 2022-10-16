import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import Analyzer from 'parser/core/Analyzer';
import { VisualizationSpec } from 'react-vega';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import { AutoSizer } from 'react-virtualized';

abstract class ResourceGraph extends Analyzer {
  /** Implementer must override this to return the ResourceTracker for the resource to graph */
  abstract tracker(): ResourceTracker;

  get plot() {
    const graphData: GraphData[] = [];
    const tracker = this.tracker();
    tracker.resourceUpdates.forEach((u) => {
      if (u.change !== 0) {
        graphData.push({
          timestamp: u.timestamp,
          amount: u.current - u.change,
        });
      }
      graphData.push({
        timestamp: u.timestamp,
        amount: u.current,
      });
    });

    const spec: VisualizationSpec = {
      data: {
        name: 'graphData',
      },
      transform: [
        {
          filter: 'isValid(datum.timestamp)',
        },
        {
          calculate: `datum.timestamp - ${this.owner.fight.start_time}`,
          as: 'timestamp_shifted',
        },
      ],
      encoding: {
        x: {
          field: 'timestamp_shifted',
          type: 'quantitative' as const,
          axis: {
            labelExpr: formatTime('datum.value'),
            tickCount: 25,
            grid: false,
          },
          scale: {
            nice: false,
          },
          title: null,
        },
        y: {
          field: 'amount',
          type: 'quantitative' as const,
        },
      },
      resolve: {
        scale: { y: 'independent' as const },
      },
      mark: {
        type: 'line' as const,
      },
      config: {
        view: {},
      },
    };

    // TODO make fixed 100% = 2 minutes, allow horizontal scroll
    return (
      <div
        className="graph-container"
        style={{
          width: '100%',
          minHeight: 200,
        }}
      >
        <AutoSizer>
          {({ width, height }) => (
            <BaseChart
              spec={spec}
              data={{
                graphData,
              }}
              width={width}
              height={height}
            />
          )}
        </AutoSizer>
      </div>
    );
  }
}

/** The type used to compile the data for graphing. */
type GraphData = {
  /** Timestamp of the data point */
  timestamp: number;
  /** Amount of resource at the given time */
  amount: number;
  // TODO also include max, rate, etc??
};

export default ResourceGraph;
