import React from 'react';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Events from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';

/**
 * Example Report: https://www.warcraftlogs.com/reports/9tAcN6PLwjMF4vm1/#fight=1&source=1
 */

class FelEruptionn extends Analyzer{

  casts = 0;
  stuns = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FEL_ERUPTION_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FEL_ERUPTION_TALENT), this.countingCasts);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.FEL_ERUPTION_TALENT), this.countingStuns);
  }

  countingCasts(event) {
    this.casts += 1;
  }

  countingStuns(event) {
    this.stuns += 1;
  }

  get badCast() {
    return this.casts - this.stuns;
  }

  get suggestionThresholds() {
    return {
      actual: this.badCast,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 1,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<>Try to cast <SpellLink id={SPELLS.FEL_ERUPTION_TALENT.id} /> only for its stun. Its not worth casting for its damage since its a dps loss.</>)
          .icon(SPELLS.FEL_ERUPTION_TALENT.icon)
          .actual(`${actual} bad casts`)
          .recommended('No bad casts are recommended.');
      });
  }

  statistic(){
    return (
      <TalentStatisticBox
        talent={SPELLS.FEL_ERUPTION_TALENT.id}
        position={STATISTIC_ORDER.OPTIONAL(6)}
        value={`${this.badCasts} bad casts`}
        tooltip={`
          This ability should only be used for its stun. Its a dps loss.
        `}
      />
    );
  }
}
export default FelEruptionn;
