import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { formatNumber } from 'common/format';

const JUDGEMENT_HEALS = 25;

class JudgmentOfLight extends Analyzer {
  counter = JUDGEMENT_HEALS;
  wasted = 0;
  casts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.JUDGMENT_OF_LIGHT_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.JUDGMENT_CAST_HOLY),
      this.resetCounter,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.JUDGMENT_OF_LIGHT_HEAL),
      this.handleHeals,
    );
  }

  resetCounter(event) {
    this.wasted += JUDGEMENT_HEALS - this.counter;
    this.casts += 1;
    this.counter = 0;
  }

  handleHeals(event) {
    if (this.counter < JUDGEMENT_HEALS) {
      this.counter += 1;
    }
  }

  statistic() {
    this.wasted += JUDGEMENT_HEALS - this.counter;
    return (
      <TalentStatisticBox
        talent={SPELLS.JUDGMENT_OF_LIGHT_TALENT.id}
        position={STATISTIC_ORDER.CORE(10)}
        value={`${formatNumber(this.wasted)} Wasted Stacks`}
        label="Judgment Of Light"
      />
    );
  }
}

export default JudgmentOfLight;
