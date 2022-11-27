import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import Analyzer from 'parser/core/Analyzer';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import { AutoSizer } from 'react-virtualized';
import { VisualizationSpec } from 'react-vega';

abstract class ResourceGraph extends Analyzer {
  /** Implementer must override this to return the ResourceTracker for the resource to graph */
  abstract tracker(): ResourceTracker;

  /** Implementer may override this to give the graph line a custom color.
   *  Color must be in format '#rrggbb', where rr gg and bb are hex values. */
  lineColor(): string | undefined {
    return undefined;
  }

  /** Some are scaled differently in events vs the user facing value. Implementer may override
   *  this to apply a scale factor so the graph shows with the user facing value.
   *  The returned value should be the multiplier to get from the events value to the user value. */
  scaleFactor(): number {
    return 1;
  }

  get vegaSpec(): VisualizationSpec {
    return {
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
        color: this.lineColor(),
      },
      config: {
        view: {},
      },
    };
  }

  get graphData() {
    const graphData: GraphData[] = [];
    const tracker = this.tracker();
    const scaleFactor = this.scaleFactor();
    tracker.resourceUpdates.forEach((u) => {
      if (u.change !== 0) {
        graphData.push({
          timestamp: u.timestamp,
          amount: (u.current - (u.change || 0)) * scaleFactor,
        });
      }
      graphData.push({
        timestamp: u.timestamp,
        amount: u.current * scaleFactor,
      });
    });

    return { graphData };
  }

  get plot() {
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
            <BaseChart spec={this.vegaSpec} data={this.graphData} width={width} height={height} />
          )}
        </AutoSizer>
      </div>
    );
  }
}

/** The type used to compile the data for graphing. */
export type GraphData = {
  /** Timestamp of the data point */
  timestamp: number;
  /** Amount of resource at the given time */
  amount: number;
  // TODO also include max, rate, etc??
};

export default ResourceGraph;
