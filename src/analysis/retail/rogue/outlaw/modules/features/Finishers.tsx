import { FinisherTracker } from 'analysis/retail/rogue/shared';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import type { ReactElement } from 'react';
import TALENTS from 'common/TALENTS/rogue';

//--TODO: Find a way to overridde? the suggest react part of the suggestion to have better phrasing ("Finish at max or max-1")

const BUFF_REACTION_TIME_LATENCY = 200;

class Finishers extends FinisherTracker {
  hasKeepItRolling = this.selectedCombatant.hasTalent(TALENTS.KEEP_IT_ROLLING_TALENT);
  hasHiddenOpportunity = this.selectedCombatant.hasTalent(TALENTS.HIDDEN_OPPORTUNITY_TALENT);

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

  isInStealth() {
    return (
      this.selectedCombatant.hasBuff(
        SPELLS.SUBTERFUGE_BUFF.id,
        null,
        undefined,
        BUFF_REACTION_TIME_LATENCY,
      ) ||
      this.selectedCombatant.hasBuff(
        SPELLS.STEALTH_BUFF.id,
        null,
        undefined,
        BUFF_REACTION_TIME_LATENCY,
      ) ||
      this.selectedCombatant.hasBuff(
        SPELLS.VANISH_BUFF.id,
        null,
        undefined,
        BUFF_REACTION_TIME_LATENCY,
      )
    );
  }

  hasHOLowCPFinisherCondition() {
    return (
      this.isInStealth() ||
      this.selectedCombatant.hasBuff(
        SPELLS.AUDACITY_TALENT_BUFF.id,
        null,
        undefined,
        BUFF_REACTION_TIME_LATENCY,
      ) ||
      this.selectedCombatant.hasBuff(
        SPELLS.OPPORTUNITY.id,
        null,
        undefined,
        BUFF_REACTION_TIME_LATENCY,
      )
    );
  }

  recommendedFinisherPoints(): number {
    if (this.hasKeepItRolling) {
      return super.recommendedFinisherPoints() - (this.isInStealth() ? 2 : 1);
    }

    if (this.hasHiddenOpportunity) {
      return super.recommendedFinisherPoints() - (this.hasHOLowCPFinisherCondition() ? 2 : 1);
    }

    return super.recommendedFinisherPoints() - 1;
  }

  extraSuggestion(): ReactElement | string {
    return <>You can, and should, finish at {this.maximumComboPoints - 1} whenever possible.</>;
  }

  suggestionIcon() {
    return SPELLS.DISPATCH.icon;
  }
}

export default Finishers;
