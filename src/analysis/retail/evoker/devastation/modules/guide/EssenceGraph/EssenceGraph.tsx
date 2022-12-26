import EssenceTracker from 'analysis/retail/evoker/preservation/modules/features/EssenceTracker';
import ResourceGraph from 'parser/shared/modules/ResourceGraph';
import { formatTime } from 'parser/ui/BaseChart';

class EssenceGraph extends ResourceGraph {
  static dependencies = {
    ...ResourceGraph.dependencies,
    essenceTracker: EssenceTracker,
  };

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
        color: '#33937F' as const,
      },
      config: {
        view: {},
      },
    };
  }

  tracker() {
    return this.essenceTracker;
  }

  essenceTracker!: EssenceTracker;
}

export default EssenceGraph;
