import Analyzer from 'parser/core/Analyzer';

import ShadowCovenantOutput from './ShadowCovenantOutput';
import ShadowCovenantSynergies from './ShadowCovenantSynergies';

class ShadowCovenant extends Analyzer {
  static dependencies = {
    shadowCovenantOutput: ShadowCovenantOutput,
  };
  protected readonly shadowCovenantOutput!: ShadowCovenantOutput;
}

export default {
  ShadowCovenantOutput,
  ShadowCovenantSynergies,
  ShadowCovenant,
};
