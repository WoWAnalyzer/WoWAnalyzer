import ResourceGraph, { GraphData } from 'parser/shared/modules/ResourceGraph';
import { formatTime } from 'parser/ui/BaseChart';
import RunicPowerTracker from './RunicPowerTracker';

class RunicPowerGraph extends ResourceGraph {
  static dependencies = {
    ...ResourceGraph.dependencies,
    runicPowerTracker: RunicPowerTracker,
  };

  runicPowerTracker!: RunicPowerTracker;

  get vegaSpec() {
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
        interpolate: 'step' as const,
        color: 'rgb(93, 215, 252)' as const,
      },
      config: {
        view: {},
      },
    };
  }

  get graphData() {
    const graphData: GraphData[] = [];

    const tracker = this.tracker();

    tracker.resourceUpdates.forEach((u) => {
      if (u.change !== 0) {
        graphData.push({
          timestamp: u.timestamp,
          amount: (u.current - u.change) / 10,
        });
      }
      graphData.push({
        timestamp: u.timestamp,
        amount: u.current / 10,
      });
    });

    return { graphData };
  }

  tracker() {
    return this.runicPowerTracker;
  }
}

export default RunicPowerGraph;
