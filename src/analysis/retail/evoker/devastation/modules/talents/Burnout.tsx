import { Options } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { getBurnoutConsumeEvent } from '../normalizers/CastLinkNormalizer';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import TALENTS from 'common/TALENTS/evoker';
import ProcBuffAnalyzer, {
  BuffRemoveEvent,
  ProcEvaluation,
} from 'analysis/retail/evoker/shared/modules/core/ProcBuffAnalyzer';

class Burnout extends ProcBuffAnalyzer {
  constructor(options: Options) {
    super(options, { buff: SPELLS.BURNOUT_BUFF, maxStacks: 2 });
  }

  protected getConsumeEvent(event: BuffRemoveEvent) {
    return getBurnoutConsumeEvent(event);
  }

  protected evaluateExpire(): ProcEvaluation {
    if (this.selectedCombatant.hasBuff(TALENTS.DRAGONRAGE_TALENT.id)) {
      return { performance: QualitativePerformance.Ok, reason: 'Buff decayed during Dragonrage.' };
    }
    return { performance: QualitativePerformance.Fail, reason: 'Buff decayed.' };
  }

  // Burnout is played around in a way where overcapping isn't a mistake
  protected evaluateOvercap() {
    return undefined;
  }
  protected evaluateRefresh() {
    return undefined;
  }
}

export default Burnout;
