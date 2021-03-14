import SPELLS from 'common/SPELLS';
import SelfHealTimingGraph from 'parser/shared/modules/features/SelfHealTimingGraph';
import React from 'react';

class DeathStrikeTiming extends SelfHealTimingGraph {
  constructor(...args) {
    super(...args);
    this.selfHealSpell = SPELLS.DEATH_STRIKE_HEAL;
    this.tabTitle = 'Death Strike Timing';
    this.tabURL = 'death-strike-timings';
  }

  render() {
    return <SelfHealTimingGraph />;
  }
}

export default DeathStrikeTiming;
