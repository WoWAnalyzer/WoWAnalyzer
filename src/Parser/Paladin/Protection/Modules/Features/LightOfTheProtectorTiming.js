import React from 'react';

import SelfHealTimingGraph from 'Parser/Core/Modules/Features/SelfHealTimingGraph';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';

class LightOfTheProtectorTiming extends SelfHealTimingGraph {

  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.selfHealSpell = this.combatants.selected.hasTalent(SPELLS.HAND_OF_THE_PROTECTOR_TALENT.id) ?
      SPELLS.HAND_OF_THE_PROTECTOR_TALENT:
      SPELLS.LIGHT_OF_THE_PROTECTOR;
    this.tabTitle = "Selfheal Timing";
    this.tabURL = "selfheal-timings";
  }

  render() {
    return (
      <SelfHealTimingGraph />
    );
  }
}

export default LightOfTheProtectorTiming;