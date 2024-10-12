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

export default class Clearcasting extends Analyzer {
  clearcastingProcs: ClearcastingProc[] = [];

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

  //ADD STATISTIC
}

export interface ClearcastingProc {
  applied: number;
  removed: number | undefined;
  missileCast: CastEvent | undefined;
  expired: boolean;
}
