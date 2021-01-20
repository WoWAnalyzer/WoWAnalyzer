import SPELLS from 'common/SPELLS/shadowlands/others';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import Events, { ApplyBuffEvent } from 'parser/core/Events';

const AUGMENT_RUNE_ID = SPELLS.VEILED_AUGMENT_RUNE.id;

class AugmentRuneChecker extends Analyzer {
  startFightWithAugmentRuneUp = false;

  constructor(options: Options){
    super(options);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER), this.onApplybuff.bind(this));
  }

  onApplybuff(event: ApplyBuffEvent) {
    const spellId = event.ability.guid;
    if (AUGMENT_RUNE_ID === spellId && event.prepull) {
      this.startFightWithAugmentRuneUp = true;
    }
  }
  get augmentRuneSuggestionThresholds() {
    return {
      actual: this.startFightWithAugmentRuneUp,
      isEqual: false,
      style: ThresholdStyle.BOOLEAN,
    };
  }
  suggestions(when: When) {
    when(this.augmentRuneSuggestionThresholds)
      .addSuggestion((suggest) => suggest('You did not have an augment rune up before combat. Having an augment rune increases your primary stat.')
          .icon(SPELLS.VEILED_AUGMENT_RUNE.icon)
          .staticImportance(SUGGESTION_IMPORTANCE.MINOR));
  }
}

export default AugmentRuneChecker;
