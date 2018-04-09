import React from 'react';

import SelfHealTimingGraph from 'Parser/Core/Modules/Features/SelfHealTimingGraph';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';

class DeathStrikeTiming extends SelfHealTimingGraph {

  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
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