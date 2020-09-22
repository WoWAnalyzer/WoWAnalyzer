import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';

import SPELLS from 'common/SPELLS';

import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

const BUFF_DURATION = 12000;
const BUFFER = 100;

class Nightfall extends Analyzer {
  wastedProcs = 0;
  buffApplyTimestamp: number = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.NIGHTFALL_TALENT.id);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.NIGHTFALL_BUFF), (event: ApplyBuffEvent) => this.onNightfallApplyRefresh(event));
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.NIGHTFALL_BUFF), (event: RefreshBuffEvent) => this.onNightfallApplyRefresh(event));
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.NIGHTFALL_BUFF), this.onNightfallRemove);
  }

  onNightfallApplyRefresh(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (this.buffApplyTimestamp !== null) {
      this.wastedProcs += 1;
    }
    this.buffApplyTimestamp = event.timestamp;
  }

  onNightfallRemove(event: RemoveBuffEvent) {
    const expectedEnd = this.buffApplyTimestamp + BUFF_DURATION;
    if ((expectedEnd - BUFFER) <= event.timestamp && event.timestamp <= (expectedEnd + BUFFER)) {
      // buff fell off naturally
      this.wastedProcs += 1;
    }
    this.buffApplyTimestamp = 0;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="small"
      >
        <BoringSpellValueText spell={SPELLS.NIGHTFALL_TALENT}>
          {this.wastedProcs} <small>wasted procs</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Nightfall;
