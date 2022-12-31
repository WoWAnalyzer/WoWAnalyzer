import ResourceGraph from 'parser/shared/modules/ResourceGraph';
import InsanityTracker from '../resources/InsanityTracker';

const LINE_COLOR = '#5dd7fc';
const SCALE_FACTOR = 0.1; // in events all values are x10

class InsanityGuide extends ResourceGraph {
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

export default InsanityGuide;
