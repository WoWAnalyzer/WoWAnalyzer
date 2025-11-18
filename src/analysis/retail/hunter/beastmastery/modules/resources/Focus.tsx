import { FocusTracker } from 'analysis/retail/hunter/shared';
import Analyzer from 'parser/core/Analyzer';

class Focus extends Analyzer {
  static dependencies = {
    focusTracker: FocusTracker,
  };

  protected focusTracker!: FocusTracker;
}

export default Focus;
