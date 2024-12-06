import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import SelfHealTimingGraph from 'parser/shared/modules/features/SelfHealTimingGraph';

class ExhilarationTiming extends SelfHealTimingGraph {
  constructor(options: Options) {
    super(options);
    this.selfHealSpell = SPELLS.EXHILARATION;
    this.tabTitle = 'Exhilaration Timing';
    this.tabURL = 'exhilaration-timings';
    this.tabEnabled = false;
  }
}

export default ExhilarationTiming;
