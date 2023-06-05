import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';

const ELIGIBLE_SPELLS = [SPELLS.LIGHTNING_BOLT, TALENTS.CHAIN_LIGHTNING_TALENT];

class ThorimsInvocation extends Analyzer {
  protected lastSpellId: number | undefined;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(ELIGIBLE_SPELLS),
      (event: CastEvent) => (this.lastSpellId = event.ability.guid),
    );
  }

  get lastSpellCast() {
    return this.lastSpellId;
  }
}

export default ThorimsInvocation;
