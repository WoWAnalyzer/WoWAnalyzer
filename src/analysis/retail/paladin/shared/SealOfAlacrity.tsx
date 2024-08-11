import Analyzer, { Options } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/paladin';
import Events, { AnyEvent } from 'parser/core/Events';
import Haste from 'parser/shared/modules/Haste';

class SealOfAlacrity extends Analyzer {
  static dependencies = {
    haste: Haste,
  };

  protected haste!: Haste;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SEAL_OF_ALACRITY_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.any, this.addHaste);
  }

  addHaste(event: AnyEvent) {
    const newHaste =
      this.haste.current +
      0.02 * this.selectedCombatant.getTalentRank(TALENTS.SEAL_OF_ALACRITY_TALENT);
    this.haste._setHaste(event, newHaste);
    this.active = false;
  }
}

export default SealOfAlacrity;
