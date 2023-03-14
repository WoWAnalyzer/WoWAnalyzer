import { FinisherTracker } from 'analysis/retail/rogue/shared';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import * as React from 'react';
import TALENTS from 'common/TALENTS/rogue';

//--TODO: Find a way to overridde? the suggest react part of the suggestion to have better phrasing ("Finish at max or max-1")

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
    const points = super.recommendedFinisherPoints() - 1;

    return points;
  }

  extraSuggestion(): React.ReactElement | string {
    return <>You can, and should, finish at {this.maximumComboPoints - 1} whenever possible.</>;
  }

  suggestionIcon() {
    return SPELLS.DISPATCH.icon;
  }
}

export default Finishers;
