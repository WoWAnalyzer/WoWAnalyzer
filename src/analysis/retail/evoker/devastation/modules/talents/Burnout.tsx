import { Options } from 'parser/core/Analyzer';
import {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import { isFromBurnout } from '../normalizers/CastLinkNormalizer';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { AnalysisData } from '../../../shared/modules/components/ProcAnalysis';
import TALENTS from 'common/TALENTS/evoker';
import ProcBuffAnalyzer, {
  ProcBuffAnalyzerOptions,
} from 'analysis/retail/evoker/shared/modules/core/ProcBuffAnalyzer';

const ProcBuffOptions: ProcBuffAnalyzerOptions = {
  trackedBuffs: SPELLS.BURNOUT_BUFF,
  inactiveListeners: {},
};

class Burnout extends ProcBuffAnalyzer {
  constructor(options: Options) {
    super(options, ProcBuffOptions);
    this.maxStacks = 2;
  }

  onApplyBuff(event: ApplyBuffEvent) {
    return;
  }
  onApplyBuffStack(event: ApplyBuffStackEvent) {
    return;
  }
  onRefreshBuff(event: RefreshBuffEvent) {
    return;
  }
  onRemoveBuff(event: RemoveBuffEvent) {
    this.onBurnoutRemove(event);
  }
  onRemoveBuffStack(event: RemoveBuffStackEvent) {
    this.onBurnoutRemove(event);
  }
  onBurnoutRemove(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    if (isFromBurnout(event)) {
      this.pushCastData(event, `Used Buff.`, QualitativePerformance.Good);
    } else {
      if (this.selectedCombatant.hasBuff(TALENTS.DRAGONRAGE_TALENT.id)) {
        this.pushCastData(event, `Buff decayed during Dragonrage.`, QualitativePerformance.Ok);
      } else {
        this.pushCastData(event, `Buff decayed.`, QualitativePerformance.Fail);
      }
    }
  }

  get procUsageData(): AnalysisData {
    return {
      casts: this.casts,
      spell: SPELLS.BURNOUT_BUFF,
    };
  }
}

export default Burnout;
