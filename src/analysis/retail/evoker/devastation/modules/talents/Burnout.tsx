import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  FightEndEvent,
  GetRelatedEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import { BURNOUT_CONSUME, isFromBurnout } from '../normalizers/CastLinkNormalizer';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { CastEvaluation } from 'interface/guide/components';
import { AnalysisData } from '../components/ProcAnalysis';
import TALENTS from 'common/TALENTS/evoker';

class Burnout extends Analyzer {
  casts: CastEvaluation[] = [];
  activeStacks = 0;
  inDragonRageWindow = false;

  constructor(options: Options) {
    super(options);

    [Events.applybuffstack, Events.applybuff].forEach((event) => {
      this.addEventListener(event.by(SELECTED_PLAYER).spell(SPELLS.BURNOUT_BUFF), this.onApplyBuff);
    });

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.LIVING_FLAME_CAST, SPELLS.LIVING_FLAME_DAMAGE]),
      this.onLivingFlameCast,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BURNOUT_BUFF),
      this.onBuffRemove,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  private onApplyBuff(event: ApplyBuffStackEvent | ApplyBuffEvent) {
    this.activeStacks += 1;
  }

  private onBuffRemove(event: RemoveBuffEvent) {
    if (GetRelatedEvent<CastEvent>(event, BURNOUT_CONSUME) === undefined) {
      if (this.selectedCombatant.hasBuff(TALENTS.DRAGONRAGE_TALENT.id))
        this.castAnalysis(event.timestamp, QualitativePerformance.Ok);
      else this.castAnalysis(event.timestamp, QualitativePerformance.Fail);
      this.activeStacks = 0;
    }
  }

  private onLivingFlameCast(event: CastEvent) {
    if (isFromBurnout(event)) {
      this.activeStacks -= 1;
      this.castAnalysis(event.timestamp, QualitativePerformance.Good);
    }
  }

  private onFightEnd(event: FightEndEvent) {
    if (this.activeStacks > 0) {
      this.castAnalysis(event.timestamp, QualitativePerformance.Ok);
    }
  }

  private castAnalysis(timestamp: number, performance: QualitativePerformance) {
    let info: string;

    switch (performance) {
      case QualitativePerformance.Ok:
        if (this.selectedCombatant.hasBuff(TALENTS.DRAGONRAGE_TALENT.id))
          info = `Buff expired during Dragonrage, wasting ${this.activeStacks} stack(s)`;
        else info = `Fight ended, leaving ${this.activeStacks} stack(s) unused`;
        break;
      case QualitativePerformance.Fail:
        info = `Buff expired, wasting ${this.activeStacks} stack(s)`;
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
      spell: SPELLS.BURNOUT_BUFF,
    };
  }
}

export default Burnout;
