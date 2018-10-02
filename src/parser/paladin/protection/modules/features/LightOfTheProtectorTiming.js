import React from 'react';

import SelfHealTimingGraph from 'parser/core/modules/features/SelfHealTimingGraph';
import SPELLS from 'common/SPELLS';

class LightOfTheProtectorTiming extends SelfHealTimingGraph {

  constructor(...args) {
    super(...args);
    this.selfHealSpell = this.selectedCombatant.hasTalent(SPELLS.HAND_OF_THE_PROTECTOR_TALENT.id) ?
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
