import { FinisherTracker } from 'analysis/retail/rogue/shared';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import type { ReactElement } from 'react';
import TALENTS from 'common/TALENTS/rogue';

//--TODO: Find a way to overridde? the suggest react part of the suggestion to have better phrasing ("Finish at max or max-1")

class Finishers extends FinisherTracker {
  get quickDrawSuggestionText(): ReactElement | string {
    if (this.selectedCombatant.hasTalent(TALENTS.QUICK_DRAW_TALENT)) {
      return (
        <>
          , or you have an <SpellLink spell={SPELLS.OPPORTUNITY} /> proc,
        </>
      );
    }
    return '';
  }

  recommendedFinisherPoints(): number {
    return super.recommendedFinisherPoints() - 1;
  }

  extraSuggestion(): ReactElement | string {
    return (
      <>You can, and should, finish at {this.recommendedFinisherPoints()} whenever possible.</>
    );
  }

  suggestionIcon() {
    return SPELLS.DISPATCH.icon;
  }
}

export default Finishers;
