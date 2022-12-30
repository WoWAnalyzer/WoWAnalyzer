import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent, CastEvent } from 'parser/core/Events';
import { isFromSnapfire } from '../normalizers/CastLinkNormalizer';

class Snapfire extends Analyzer {
  procs: number = 0;
  consumedProcs: number = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SNAPFIRE_BUFF),
      this.onApplyBuff,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([TALENTS_EVOKER.FIRESTORM_TALENT]),
      this.onConsume,
    );

    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onFightEnd() {
    if (this.selectedCombatant.hasBuff(SPELLS.SNAPFIRE_BUFF.id)) {
      this.procs -= 1;
    }
  }

  onConsume(event: CastEvent) {
    if (isFromSnapfire(event)) {
      this.consumedProcs += 1;
    }
  }

  onApplyBuff(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    this.procs += 1;
  }

  get wastedProcs() {
    return this.procs - this.consumedProcs;
  }
}

export default Snapfire;
