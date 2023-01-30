import { FinisherTracker } from 'analysis/retail/rogue/shared';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import * as React from 'react';
import TALENTS from 'common/TALENTS/rogue';

class Finishers extends FinisherTracker {
  get quickDrawSuggestionText(): React.ReactElement | string {
    if (this.selectedCombatant.hasTalent(TALENTS.QUICK_DRAW_TALENT)) {
      return (
        <>
          , or you have an <SpellLink id={SPELLS.OPPORTUNITY.id} /> proc,
        </>
      );
    }
    return '';
  }

  recommendedFinisherPoints(): number {
    let points = super.recommendedFinisherPoints();

    if (this.selectedCombatant.hasBuff(SPELLS.BROADSIDE.id)) {
      points -= 1;
    } else if (
      this.selectedCombatant.hasTalent(TALENTS.QUICK_DRAW_TALENT) &&
      this.selectedCombatant.hasBuff(SPELLS.OPPORTUNITY.id)
    ) {
      points -= 1;
    }

    return points;
  }

  extraSuggestion(): React.ReactElement | string {
    return (
      <>
        If you have <SpellLink id={SPELLS.BROADSIDE.id} /> active{this.quickDrawSuggestionText} use
        your finisher at {this.maximumComboPoints - 1} combo points instead.
      </>
    );
  }

  suggestionIcon() {
    return SPELLS.DISPATCH.icon;
  }
}

export default Finishers;
