import MultiBuffStacksGraph from './MultiBuffStacksGraph';
import BellTollsStackTracker from './BellTollsStackTracker';
import BlightedQuiverStackTracker from './BlightedQuiverStackTracker';

export default class DarkRangerStacksGraph extends MultiBuffStacksGraph {
  static dependencies = {
    ...MultiBuffStacksGraph.dependencies,
    bellTolls: BellTollsStackTracker,
    blightedQuiver: BlightedQuiverStackTracker,
  };

  bellTolls!: BellTollsStackTracker;
  blightedQuiver!: BlightedQuiverStackTracker;

  series() {
    return [
      { name: 'Bell Tolls', color: '#1E90FF', tracker: this.bellTolls },
      { name: 'Blighted Quiver', color: '#E11E1E', tracker: this.blightedQuiver },
    ];
  }
}
