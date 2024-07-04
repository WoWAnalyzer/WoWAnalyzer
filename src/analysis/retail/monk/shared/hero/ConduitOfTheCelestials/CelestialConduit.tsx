import Analyzer from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import Haste from 'parser/shared/modules/Haste';

class CelestialConduit extends Analyzer {
  static dependencies = {
    haste: Haste,
  };
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(options: Options) {
    super(options);
  }

  //gonna use this module to add to the cooldown section of the guid
}

export default CelestialConduit;
