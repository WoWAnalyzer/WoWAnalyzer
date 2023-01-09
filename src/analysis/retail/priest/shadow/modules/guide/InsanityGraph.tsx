import ResourceGraph from 'parser/shared/modules/ResourceGraph';
import InsanityTracker from '../resources/InsanityTracker';

const LINE_COLOR = '#6600CC';
const SCALE_FACTOR = 0.01; // in events all values are x100

class InsanityGraph extends ResourceGraph {
  static dependencies = {
    ...ResourceGraph.dependencies,
    InsanityTracker: InsanityTracker,
  };

  insanityTracker!: InsanityTracker;

  tracker() {
    return this.insanityTracker;
  }

  lineColor() {
    return LINE_COLOR;
  }

  scaleFactor() {
    return SCALE_FACTOR;
  }
}

export default InsanityGraph;
