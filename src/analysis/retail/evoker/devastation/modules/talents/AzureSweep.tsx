import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';
import Events, {
  EmpowerEndEvent,
  EventType,
  FightEndEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import {
  getAzureSweepBuffEvent,
  getAzureSweepConsumeEvent,
} from '../normalizers/CastLinkNormalizer';
import { AZURE_SWEEP_BASE_STACKS, MID1_4P_AZURE_SWEEP_EXTRA_STACKS } from '../../constants';
import { TIERS } from 'game/TIERS';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { CastEvaluation } from 'interface/guide/components';
import { AnalysisData } from '../components/ProcAnalysis';

/** Eternity Surge upgrades your next Azure Strike to Azure Sweep,
 * damaging all nearby enemies and dealing 75% additional damage. */
class AzureSweep extends Analyzer {
  casts: CastEvaluation[] = [];

  activeStacks = 0;

  amountOfStacksGenerated =
    AZURE_SWEEP_BASE_STACKS +
    (this.selectedCombatant.has4PieceByTier(TIERS.MID1) ? MID1_4P_AZURE_SWEEP_EXTRA_STACKS : 0);

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.AZURE_SWEEP_TALENT);

    this.addEventListener(
      Events.empowerEnd
        .by(SELECTED_PLAYER)
        .spell([SPELLS.ETERNITY_SURGE, SPELLS.ETERNITY_SURGE_FONT]),
      this.onEmpowerEnd,
    );

    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.AZURE_SWEEP_BUFF),
      this.onRemoveBuffStack,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.AZURE_SWEEP_BUFF),
      this.onRemoveBuff,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  private onEmpowerEnd(event: EmpowerEndEvent) {
    const buffEvent = getAzureSweepBuffEvent(event);

    if (!buffEvent) {
      this.castAnalysis(event.timestamp, QualitativePerformance.Ok, this.amountOfStacksGenerated);
    } else if (buffEvent.type === EventType.ApplyBuff) {
      this.activeStacks = this.amountOfStacksGenerated;
    } else {
      const effStacksGained = buffEvent.stack - this.activeStacks;

      const overcapped = this.amountOfStacksGenerated - effStacksGained;

      this.activeStacks = buffEvent.stack;
      if (overcapped > 0) this.castAnalysis(event.timestamp, QualitativePerformance.Ok, overcapped);
    }
  }

  private onRemoveBuff(event: RemoveBuffEvent) {
    const consumeEvent = getAzureSweepConsumeEvent(event);

    if (!consumeEvent) {
      this.castAnalysis(event.timestamp, QualitativePerformance.Fail);
    } else {
      this.castAnalysis(event.timestamp, QualitativePerformance.Good);
    }

    this.activeStacks = 0;
  }

  private onRemoveBuffStack(event: RemoveBuffStackEvent) {
    this.activeStacks = event.stack;
    this.castAnalysis(event.timestamp, QualitativePerformance.Good);
  }

  private onFightEnd(event: FightEndEvent) {
    if (this.activeStacks > 0) {
      this.castAnalysis(event.timestamp, QualitativePerformance.Ok);
    }
  }

  private castAnalysis(timestamp: number, performance: QualitativePerformance, overcap = 0) {
    let info: string;

    switch (performance) {
      case QualitativePerformance.Fail:
        if (overcap > 0) info = `Buff overcapped, wasting ${overcap} stack(s)`;
        else info = `Buff expired, wasting ${this.activeStacks} stack(s)`;
        break;
      case QualitativePerformance.Ok:
        info = `Fight ended, leaving ${this.activeStacks} stack(s) unused`;
        break;
      default:
        info = 'Buff used';
        break;
    }

    const castEntry: CastEvaluation = {
      performance: performance,
      timestamp: timestamp,
      reason: info,
    };

    this.casts.push(castEntry);
  }

  get procUsageData(): AnalysisData {
    return {
      casts: this.casts,
      spell: SPELLS.AZURE_SWEEP_BUFF,
    };
  }
}

export default AzureSweep;
