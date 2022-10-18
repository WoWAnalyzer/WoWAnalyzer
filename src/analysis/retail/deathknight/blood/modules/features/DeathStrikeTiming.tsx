import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import SelfHealTimingGraph from 'parser/shared/modules/features/SelfHealTimingGraph';

class DeathStrikeTiming extends SelfHealTimingGraph {
  constructor(options: Options) {
    super(options);
    this.selfHealSpell = talents.DEATH_STRIKE_TALENT_HEAL;
    this.tabTitle = 'Death Strike Timing';
    this.tabURL = 'death-strike-timings';
  }
}

export default DeathStrikeTiming;
