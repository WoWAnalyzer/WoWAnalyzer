import { TALENTS_EVOKER } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';

const ESSENCE_BURST_DURATION = 15000;
class EssenceBurst extends Analyzer {
  procs: number = 0;
  expiredProcs: number = 0;

  lastProcTime: number = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff
        .by(SELECTED_PLAYER)
        .spell([TALENTS_EVOKER.ESSENCE_BURST_TALENT, TALENTS_EVOKER.ESSENCE_BURST_ATTUNED_TALENT]),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.applybuffstack
        .by(SELECTED_PLAYER)
        .spell([TALENTS_EVOKER.ESSENCE_BURST_TALENT, TALENTS_EVOKER.ESSENCE_BURST_ATTUNED_TALENT]),
      this.onApplyBuff,
    );

    this.addEventListener(
      Events.removebuff
        .by(SELECTED_PLAYER)
        .spell([TALENTS_EVOKER.ESSENCE_BURST_TALENT, TALENTS_EVOKER.ESSENCE_BURST_ATTUNED_TALENT]),
      this.onRemoveBuff,
    );

    this.addEventListener(
      Events.removebuffstack
        .by(SELECTED_PLAYER)
        .spell([TALENTS_EVOKER.ESSENCE_BURST_TALENT, TALENTS_EVOKER.ESSENCE_BURST_ATTUNED_TALENT]),
      this.onRemoveBuff,
    );
  }

  onApplyBuff(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    this.procs += 1;
    this.lastProcTime = event.timestamp;
  }

  onRemoveBuff(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    const durationHeld = event.timestamp - this.lastProcTime;
    if (durationHeld > ESSENCE_BURST_DURATION) {
      this.expiredProcs += 1;
    }
  }
}

export default EssenceBurst;
