import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent, CastEvent } from 'parser/core/Events';
import { isFromEssenceBurst } from '../normalizers/CastLinkNormalizer';

class EssenceBurst extends Analyzer {
  procs: number = 0;
  consumedProcs: number = 0;

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
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.DISINTEGRATE, SPELLS.PYRE]),
      this.onEssenceSpend,
    );
  }

  onEssenceSpend(event: CastEvent) {
    if (isFromEssenceBurst(event)) {
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

export default EssenceBurst;
