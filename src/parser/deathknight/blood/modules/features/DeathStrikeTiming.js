import React from 'react';

import SelfHealTimingGraph from 'parser/shared/modules/features/SelfHealTimingGraph';
import SPELLS from 'common/SPELLS';

class DeathStrikeTiming extends SelfHealTimingGraph {

  constructor(...args) {
    super(...args);
    this.selfHealSpell = SPELLS.DEATH_STRIKE_HEAL;
    this.tabTitle = "Death Strike Timing";
    this.tabURL = "death-strike-timings";
  }

  render() {
    return (
      <SelfHealTimingGraph />
    );
  } 
}

export default DeathStrikeTiming;
