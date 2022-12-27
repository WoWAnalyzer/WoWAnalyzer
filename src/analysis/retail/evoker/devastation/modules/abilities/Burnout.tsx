import { TALENTS_EVOKER } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import SPELLS from 'common/SPELLS';

const BURNOUT_DURATION = 15000;
class Burnout extends Analyzer {
  procs: number = 0;
  expiredProcs: number = 0;
  lastProcTime: number = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS_EVOKER.BURNOUT_TALENT),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(TALENTS_EVOKER.BURNOUT_TALENT),
      this.onApplyBuff,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS_EVOKER.BURNOUT_TALENT),
      this.onRemoveBuff,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(TALENTS_EVOKER.BURNOUT_TALENT),
      this.onRemoveBuff,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.LIVING_FLAME_CAST),
      this.onLivingFlameCast,
    );
  }

  onApplyBuff(event: ApplyBuffStackEvent | ApplyBuffEvent) {
    this.procs += 1;
    this.lastProcTime = event.timestamp;
  }

  onRemoveBuff(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    const durationHeld = event.timestamp - this.lastProcTime;
    if (durationHeld > BURNOUT_DURATION) {
      this.expiredProcs += 1;
    }
  }

  onLivingFlameCast(event: CastEvent) {
    // console.log('Events', event._linkedEvents);
  }
}

export default Burnout;
