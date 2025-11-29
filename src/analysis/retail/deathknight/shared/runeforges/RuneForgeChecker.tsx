import { Enchant } from 'common/SPELLS/Spell';
import Analyzer from 'parser/core/Analyzer';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { BoolThreshold, ThresholdStyle } from 'parser/core/ParseResults';
import type { ReactNode } from 'react';

interface RuneForgeCheckItem {
  forge: Enchant;
  importance: SUGGESTION_IMPORTANCE;
  suggestion: ReactNode;
}

class RuneForgeChecker extends Analyzer {
  public runeForges: RuneForgeCheckItem[] = [];

  get activeSuggestion() {
    return this.runeForges.find(
      (runeForge) =>
        this.selectedCombatant.hasWeaponEnchant(runeForge.forge) && runeForge.suggestion,
    );
  }

  get showSuggestion(): BoolThreshold {
    return {
      actual: Boolean(this.activeSuggestion),
      isEqual: true,
      style: ThresholdStyle.BOOLEAN,
    };
  }
}

export default RuneForgeChecker;
