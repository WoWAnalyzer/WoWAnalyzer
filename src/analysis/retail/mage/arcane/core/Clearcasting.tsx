import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
  GetRelatedEvent,
} from 'parser/core/Events';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';

class Clearcasting extends Analyzer {
  clearcastingProcs: {
    applied: number;
    removed: number | undefined;
    missileCast: CastEvent | undefined;
    expired: boolean;
    castUsage?: BoxRowEntry;
  }[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.CLEARCASTING_ARCANE),
      this.onClearcastingApply,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.CLEARCASTING_ARCANE),
      this.onClearcastingApply,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onClearcastingApply(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    const removeBuff: RemoveBuffEvent | RemoveBuffStackEvent | undefined = GetRelatedEvent(
      event,
      'BuffRemomve',
    );
    const missiles: CastEvent | undefined = GetRelatedEvent(event, 'SpellCast');

    this.clearcastingProcs.push({
      applied: event.timestamp,
      removed: removeBuff?.timestamp,
      missileCast: missiles,
      expired: !missiles,
    });
  }

  onFightEnd() {
    this.analyzeClearcasting();
  }

  analyzeClearcasting = () => {
    const used = this.clearcastingProcs.filter((c) => !c.expired);
    used.forEach(
      (u) =>
        (u.castUsage = { value: QualitativePerformance.Good, tooltip: `Clearcasting Proc Spent` }),
    );

    const expired = this.clearcastingProcs.filter((c) => c.expired);
    expired.forEach(
      (e) =>
        (e.castUsage = {
          value: QualitativePerformance.Fail,
          tooltip: `Clearcasting Proc Expired`,
        }),
    );
  };

  get expiredProcs() {
    return this.clearcastingProcs.filter((c) => !c.expired).length;
  }

  get buffUtilization() {
    return this.expiredProcs / this.clearcastingProcs.length;
  }

  //ADD STATISTIC
}

export default Clearcasting;
