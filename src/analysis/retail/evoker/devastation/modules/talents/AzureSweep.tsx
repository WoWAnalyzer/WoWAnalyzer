import { Options } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';
import {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import { getAzureSweepConsumeEvent } from '../normalizers/CastLinkNormalizer';
import { AZURE_SWEEP_BASE_STACKS, MID1_4P_AZURE_SWEEP_EXTRA_STACKS } from '../../constants';
import { TIERS } from 'game/TIERS';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { AnalysisData } from '../../../shared/modules/components/ProcAnalysis';
import ProcBuffAnalyzer, {
  ProcBuffAnalyzerOptions,
} from 'analysis/retail/evoker/shared/modules/core/ProcBuffAnalyzer';

const ProcBuffOptions: ProcBuffAnalyzerOptions = {
  trackedBuffs: SPELLS.AZURE_SWEEP_BUFF,
  inactiveListeners: {},
  stackOptions: {
    amountOfStacksGenerated: 1,
    maxStacks: 2,
    settings: {
      overcapBuffIsFail: true,
      refreshingBuffIsFail: true,
    },
  },
};

/** Eternity Surge upgrades your next Azure Strike to Azure Sweep,
 * damaging all nearby enemies and dealing 75% additional damage. */
class AzureSweep extends ProcBuffAnalyzer {
  constructor(options: Options) {
    super(options, ProcBuffOptions);
    this.active = this.selectedCombatant.hasTalent(TALENTS.AZURE_SWEEP_TALENT);
    this.amountOfStacksGenerated =
      AZURE_SWEEP_BASE_STACKS +
      (this.selectedCombatant.has4PieceByTier(TIERS.MID1) ? MID1_4P_AZURE_SWEEP_EXTRA_STACKS : 0);
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
    this.onSweepUse(event);
  }
  onRemoveBuffStack(event: RemoveBuffStackEvent) {
    this.onSweepUse(event);
  }
  onSweepUse(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    const consumeEvent = getAzureSweepConsumeEvent(event);

    if (!consumeEvent) {
      this.pushCastData(
        event,
        `Buff expired, wasting ${-this.stackDifference} stack(s)`,
        QualitativePerformance.Fail,
      );
    } else {
      this.pushCastData(event, 'Buff used', QualitativePerformance.Good);
    }
  }

  get procUsageData(): AnalysisData {
    return {
      casts: this.casts,
      spell: SPELLS.AZURE_SWEEP_BUFF,
    };
  }
}

export default AzureSweep;
