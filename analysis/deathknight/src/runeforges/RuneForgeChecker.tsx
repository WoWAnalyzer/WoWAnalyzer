import SPELLS from 'common/SPELLS';
import { Enchant } from 'common/SPELLS/Spell';
import Analyzer from 'parser/core/Analyzer';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { BoolThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import * as React from 'react';

export interface RuneForgeCheckItem {
  forge: Enchant;
  importance: SUGGESTION_IMPORTANCE;
  suggestion: React.ReactNode;
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

  suggestions(when: When) {
    when(this.showSuggestion).addSuggestion((suggest) =>
      suggest(<span>{this.activeSuggestion?.suggestion}</span>)
        .icon(SPELLS.RUNEFORGING.icon)
        .staticImportance(this.activeSuggestion?.importance || SUGGESTION_IMPORTANCE.MINOR),
    );
  }
}

export default RuneForgeChecker;
