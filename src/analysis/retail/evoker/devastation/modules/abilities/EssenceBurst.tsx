import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent, CastEvent } from 'parser/core/Events';
import { isCastFromEB } from 'analysis/retail/evoker/shared/modules/normalizers/EssenceBurstCastLinkNormalizer';

class EssenceBurst extends Analyzer {
  procs: number = 0;
  consumedProcs: number = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff
        .by(SELECTED_PLAYER)
        .spell([TALENTS_EVOKER.RUBY_ESSENCE_BURST_TALENT, SPELLS.ESSENCE_BURST_DEV_BUFF]),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.applybuffstack
        .by(SELECTED_PLAYER)
        .spell([TALENTS_EVOKER.RUBY_ESSENCE_BURST_TALENT, SPELLS.ESSENCE_BURST_DEV_BUFF]),
      this.onApplyBuff,
    );

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([SPELLS.DISINTEGRATE, SPELLS.PYRE, SPELLS.PYRE_DENSE_TALENT]),
      this.onEssenceSpend,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onFightEnd() {
    this.procs -=
      this.selectedCombatant.getBuffStacks(TALENTS_EVOKER.RUBY_ESSENCE_BURST_TALENT.id) +
      this.selectedCombatant.getBuffStacks(SPELLS.ESSENCE_BURST_DEV_BUFF.id);
  }

  onEssenceSpend(event: CastEvent) {
    if (isCastFromEB(event)) {
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
