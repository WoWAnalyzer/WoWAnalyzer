import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Haste from 'parser/shared/modules/Haste';

export default class VeteransEye extends Analyzer.withDependencies({
  haste: Haste,
}) {
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(talents.VETERANS_EYE_TALENT);

    this.deps.haste.addHasteBuff(SPELLS.VETERANS_EYE_BUFF.id, {
      hastePerStack: 0.01,
    });
  }
}
