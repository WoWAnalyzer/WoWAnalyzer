import React from 'react';

import SelfHealTimingGraph from 'parser/shared/modules/features/SelfHealTimingGraph';
import SPELLS from 'common/SPELLS';

class WordOfGloryTiming extends SelfHealTimingGraph {

  constructor(...args) {
    super(...args);
    this.selfHealSpell = SPELLS.WORD_OF_GLORY;
    this.tabTitle = "Selfheal Timing";
    this.tabURL = "selfheal-timings";
  }

  render() {
    return (
      <SelfHealTimingGraph />
    );
  }
}

export default WordOfGloryTiming;
