import React from 'react';

import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/warrior/arms/modules/features/SpellUsable';

class Slam extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  badCast = 0;
  totalCast = 0;

  constructor(...args) {
    super(...args);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SLAM), this._badCast);
  }

  _badCast() {
    this.totalCast += 1;
    if (this.spellUsable.isAvailable(SPELLS.MORTAL_STRIKE.id)) {
      this.badCast += 1;
    }
  }

  get badCastSuggestionThresholds() {
    return {
      actual: this.badCast / this.totalCast ,
      isGreaterThan: {
        minor: 0,
        average: 0.5,
        major: 0.1,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.badCastSuggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<>Try to avoid using <SpellLink id={SPELLS.SLAM.id} /> when <SpellLink id={SPELLS.MORTAL_STRIKE.id} /> is available as it is more rage efficient.</>)
        .icon(SPELLS.SLAM.icon)
        .actual(`${formatPercentage(actual)}% of your Slam were used while Mortal Strike or Overpower were available.`)
        .recommended(`${recommended}% is recommended`);
    });
  }

}

export default Slam;
