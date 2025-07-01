import ResourceGraph from 'parser/shared/modules/ResourceGraph';
import { formatTime } from 'parser/ui/BaseChart';
import RuneTracker from './RuneTracker';

class RuneGraph extends ResourceGraph {
  static dependencies = {
    ...ResourceGraph.dependencies,
    runeTracker: RuneTracker,
  };

  // TODO ideally this shouldn't need a custom vega spec just to interpolate - more cleanup needed?
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
        color: 'rgb(196, 31, 59)' as const,
      },
      config: {
        view: {},
      },
    };
  }

  tracker() {
    return this.runeTracker;
  }

  runeTracker!: RuneTracker;
}

export default RuneGraph;
