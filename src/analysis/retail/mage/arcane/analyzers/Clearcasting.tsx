import SPELLS from 'common/SPELLS';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Analyzer from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
  GetRelatedEvent,
  EventType,
} from 'parser/core/Events';

export default class Clearcasting extends Analyzer {
  clearcastingProcs: ClearcastingData[] = [];

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
      EventType.RemoveBuff,
    );
    const spender: CastEvent | undefined = GetRelatedEvent(event, 'consume');

    this.clearcastingProcs.push({
      applied: event.timestamp,
      removed: removeBuff?.timestamp,
      spender,
      expired: !spender,
    });
  }
}

export interface ClearcastingData {
  applied: number;
  removed?: number;
  spender?: CastEvent;
  expired: boolean;
}
