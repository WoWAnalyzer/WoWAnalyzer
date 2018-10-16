import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';
import SpellLink from 'common/SpellLink';

const BUFF_DURATION = 12000;
const BUFFER = 100;

class Nightfall extends Analyzer {
  wastedProcs = 0;
  buffApplyTimestamp = null;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.NIGHTFALL_TALENT.id);
  }

  on_byPlayer_applybuff(event) {
    if (event.ability.guid !== SPELLS.NIGHTFALL_BUFF.id) {
      return;
    }
    this._applyNightfall(event);
  }

  on_byPlayer_refreshbuff(event) {
    // haven't found log where it would happen but just in case
    if (event.ability.guid !== SPELLS.NIGHTFALL_BUFF.id) {
      return;
    }
    this._applyNightfall(event);
  }

  _applyNightfall(event) {
    if (this.buffApplyTimestamp !== null) {
      this.wastedProcs += 1;
    }
    this.buffApplyTimestamp = event.timestamp;
  }

  on_byPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.NIGHTFALL_BUFF.id) {
      return;
    }
    const expectedEnd = this.buffApplyTimestamp + BUFF_DURATION;
    if ((expectedEnd - BUFFER) <= event.timestamp && event.timestamp <= (expectedEnd + BUFFER)) {
      // buff fell off naturally
      this.wastedProcs += 1;
    }
    this.buffApplyTimestamp = null;
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<>Wasted <SpellLink id={SPELLS.NIGHTFALL_TALENT.id} /> procs</>}
        value={this.wastedProcs}
      />
    );
  }
}

export default Nightfall;
