import SPELLS from 'common/SPELLS/classic';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Haste from 'parser/shared/modules/Haste';

export default class JudgmentsOfThePure extends Analyzer.withDependencies({ haste: Haste }) {
  constructor(options: Options) {
    super(options);

    this.deps.haste.addHasteBuff(SPELLS.JUDGEMENTS_OF_THE_PURE_R1.id, 0.03);
    this.deps.haste.addHasteBuff(SPELLS.JUDGEMENTS_OF_THE_PURE_R2.id, 0.06);
    this.deps.haste.addHasteBuff(SPELLS.JUDGEMENTS_OF_THE_PURE_R3.id, 0.09);
  }
}
