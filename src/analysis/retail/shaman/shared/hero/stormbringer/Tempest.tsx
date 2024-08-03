import Analyzer, { Options } from 'parser/core/Analyzer';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';

abstract class Tempest extends Analyzer {
  static dependencies = {
    resourceTracker: ResourceTracker,
  };

  protected resourceTracker!: ResourceTracker;

  protected constructor(options: Options) {
    super(options);
  }
}

export default Tempest;
