import CoreHaste from 'parser/shared/modules/Haste';
import { Options } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/classic/paladin';

class Haste extends CoreHaste {
  constructor(options: Options) {
    super(options);
    Haste.HASTE_BUFFS[SPELLS.JUDGEMENTS_OF_THE_PURE.id] = 0.15;
  }
}

export default Haste;
