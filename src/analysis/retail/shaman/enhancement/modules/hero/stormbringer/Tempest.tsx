import BaseTempest from 'analysis/retail/shaman/shared/hero/stormbringer/Tempest';
import { Options } from 'parser/core/Analyzer';

class Tempest extends BaseTempest {
  constructor(options: Options) {
    super(40, options);
  }
}

export default Tempest;
