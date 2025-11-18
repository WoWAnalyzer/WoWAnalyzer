import SPELLS from 'common/SPELLS/thewarwithin/others';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';

const AUGMENT_RUNE_ID = SPELLS.CRYSTALLIZED_AUGMENT_RUNE.id;
// The War Within doesn't have an eternal augment rune yet
// const ETERNAL_AUGMENT_RUNE_ID = SPELLS.ETERNAL_AUGMENT_RUNE.id;

class AugmentRuneChecker extends Analyzer {
  startFightWithAugmentRuneUp = false;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER), this.onApplybuff.bind(this));
  }

  onApplybuff(event: ApplyBuffEvent) {
    const spellId = event.ability.guid;
    if (AUGMENT_RUNE_ID === spellId /*|| ETERNAL_AUGMENT_RUNE_ID === spellId*/ && event.prepull) {
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
}

export default AugmentRuneChecker;
