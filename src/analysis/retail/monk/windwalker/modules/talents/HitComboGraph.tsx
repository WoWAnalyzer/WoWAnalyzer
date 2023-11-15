import BuffStackGraph from 'parser/shared/modules/BuffStackGraph';
import HitComboTracker from './HitComboTracker';

export default class HitComboGraph extends BuffStackGraph {
  static dependencies = {
    ...BuffStackGraph.dependencies,
    hitComboTracker: HitComboTracker,
  };
  hitComboTracker!: HitComboTracker;

  tracker(): HitComboTracker {
    return this.hitComboTracker;
  }
}
