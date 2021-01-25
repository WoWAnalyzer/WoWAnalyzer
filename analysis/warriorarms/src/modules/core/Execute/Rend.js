import React from 'react';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { t } from '@lingui/macro';
import { ThresholdStyle } from 'parser/core/ParseResults';

import ExecuteRange from './ExecuteRange';

class RendAnalyzer extends Analyzer {
  get executeRendsThresholds() {
    return {
      actual: this.rendsInExecuteRange / this.rends,
      isGreaterThan: {
        minor: 0,
        average: 0.05,
        major: 0.1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  static dependencies = {
    executeRange: ExecuteRange,
  };
  rends = 0;
  rendsInExecuteRange = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.REND_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.REND_TALENT), this._onRendCast);
  }

  _onRendCast(event) {
    this.rends += 1;
    if (this.executeRange.isTargetInExecuteRange(event)) {
      this.rendsInExecuteRange += 1;

      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = 'This Rend was used on a target in Execute range.';
    }
  }

  suggestions(when) {
    when(this.executeRendsThresholds).addSuggestion((suggest, actual, recommended) => suggest(<>Try to avoid using <SpellLink id={SPELLS.REND_TALENT.id} icon /> on a target in <SpellLink id={SPELLS.EXECUTE.id} icon /> range.</>)
      .icon(SPELLS.REND_TALENT.icon)
      .actual(t({
      id: "warrior.arms.suggestions.execute.rend.casts",
      message: `Rend was used ${formatPercentage(actual)}% of the time on a target in execute range.`
    }))
      .recommended(`${formatPercentage(recommended)}% is recommended`));
  }
}

export default RendAnalyzer;
