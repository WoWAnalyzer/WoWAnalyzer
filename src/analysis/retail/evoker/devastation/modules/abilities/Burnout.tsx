import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent, CastEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import { isFromBurnout } from '../normalizers/CastLinkNormalizer';

class Burnout extends Analyzer {
  procs: number = 0;
  consumedProcs: number = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BURNOUT_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.BURNOUT_BUFF),
      this.onApplyBuff,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.LIVING_FLAME_CAST, SPELLS.LIVING_FLAME_DAMAGE]),
      this.onLivingFlameCast,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onFightEnd() {
    this.procs -= this.selectedCombatant.getBuffStacks(SPELLS.BURNOUT_BUFF.id);
  }

  onApplyBuff(event: ApplyBuffStackEvent | ApplyBuffEvent) {
    this.procs += 1;
  }

  onLivingFlameCast(event: CastEvent) {
    if (isFromBurnout(event)) {
      this.consumedProcs += 1;
    }
  }

  get wastedProcs() {
    return this.procs - this.consumedProcs;
  }
}

export default Burnout;
