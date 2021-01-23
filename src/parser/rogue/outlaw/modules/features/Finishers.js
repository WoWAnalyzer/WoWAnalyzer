import React from 'react';

import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';

import FinisherTracker from '../../../shared/resources/FinisherTracker';

class Finishers extends FinisherTracker {

  get quickDrawSuggestionText() {
    if (this.selectedCombatant.hasTalent(SPELLS.QUICK_DRAW_TALENT.id)) {
      return <>, or you have an <SpellLink id={SPELLS.OPPORTUNITY.id} /> proc,</>;
    }
    return '';
  }

  recommendedFinisherPoints() {
    let points = super.recommendedFinisherPoints();

    if (this.selectedCombatant.hasBuff(SPELLS.BROADSIDE.id)) {
      points -= 1;
    } else if (this.selectedCombatant.hasTalent(SPELLS.QUICK_DRAW_TALENT.id) && this.selectedCombatant.hasBuff(SPELLS.OPPORTUNITY.id)) {
      points -= 1;
    }

    return points;
  }

  extraSuggestion() {
    return <>If you have <SpellLink id={SPELLS.BROADSIDE.id} /> active{this.quickDrawSuggestionText} use your finisher at {this.maximumComboPoints - 1} combo points instead.</>;
  }

  suggestionIcon() {
    return SPELLS.DISPATCH.icon;
  }
}

export default Finishers;
