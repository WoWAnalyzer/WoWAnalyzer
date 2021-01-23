import React from 'react';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox from 'parser/ui/TalentStatisticBox';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Events from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { SpellLink } from 'interface';

/**
 * Example Report: https://www.warcraftlogs.com/reports/9tAcN6PLwjMF4vm1/#fight=1&source=1
 */

class FelEruption extends Analyzer {

  get badCasts() {
    return this.casts - this.stuns;
  }

  get suggestionThresholds() {
    return {
      actual: this.badCasts,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 1,
      },
      style: 'number',
    };
  }

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

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>Try to cast <SpellLink id={SPELLS.FEL_ERUPTION_TALENT.id} /> only for its stun. It's not worth casting for its damage since it's a DPS loss.</>)
        .icon(SPELLS.FEL_ERUPTION_TALENT.icon)
        .actual(<>{actual} bad <SpellLink id={SPELLS.FEL_ERUPTION_TALENT.id} /> casts that didn't stun the target </>)
        .recommended('No bad casts are recommended.'));
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.FEL_ERUPTION_TALENT.id}
        position={STATISTIC_ORDER.OPTIONAL(6)}
        value={<>{this.badCasts} <small>bad casts that didn't stun the target</small> </>}
        tooltip={(
          <>
            This ability should only be used for its stun. Its a DPS loss. <br /> <br />
            You casted this ability a total of {this.casts} time(s). <br />
            It stunned a target {this.stuns} time(s).
          </>
        )}
      />
    );
  }
}

export default FelEruption;
