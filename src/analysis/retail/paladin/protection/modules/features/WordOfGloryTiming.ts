import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import SelfHealTimingGraph from 'parser/shared/modules/features/SelfHealTimingGraph';

class WordOfGloryTiming extends SelfHealTimingGraph {
  constructor(options: Options) {
    super(options);
    this.selfHealSpell = SPELLS.WORD_OF_GLORY;
    this.tabTitle = 'Word of Glory Timing';
    this.tabURL = 'wog-timings';
  }
}

export default WordOfGloryTiming;
