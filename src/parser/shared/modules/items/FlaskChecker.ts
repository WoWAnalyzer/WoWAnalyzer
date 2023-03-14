import SPELLS from 'common/SPELLS/dragonflight/phials';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { When, ThresholdStyle } from 'parser/core/ParseResults';

class FlaskChecker extends Analyzer {
  startFightWithFlaskUp = false;
  strongFlaskUsed = false;
  flaskBuffId?: number;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER), this.onApplybuff.bind(this));
  }

  get MinFlaskIds(): number[] {
    return [];
  }

  get MaxFlaskIds(): number[] {
    return [];
  }

  onApplybuff(event: ApplyBuffEvent) {
    const spellId = event.ability.guid;
    if (this.MinFlaskIds.includes(spellId) && event.prepull) {
      this.startFightWithFlaskUp = true;
      this.flaskBuffId = spellId;
    }
    if (this.MaxFlaskIds.includes(spellId) && event.prepull) {
      this.startFightWithFlaskUp = true;
      this.strongFlaskUsed = true;
      this.flaskBuffId = spellId;
    }
  }
  get flaskStrengthSuggestion() {
    return {
      actual: this.strongFlaskUsed,
      isEqual: false,
      style: ThresholdStyle.BOOLEAN,
    };
  }
  get flaskSuggestionThresholds() {
    return {
      actual: this.startFightWithFlaskUp,
      isEqual: false,
      style: ThresholdStyle.BOOLEAN,
    };
  }
  suggestions(when: When) {
    when(this.flaskSuggestionThresholds).addSuggestion((suggest) =>
      suggest(
        'You did not have a flask up before combat. Having a flask during combat increases your primary stat significantly.',
      )
        .icon(SPELLS.PHIAL_OF_GLACIAL_FURY.icon)
        .staticImportance(SUGGESTION_IMPORTANCE.MINOR),
    );
    when(this.flaskStrengthSuggestion).addSuggestion((suggest) =>
      suggest(
        'You did not have the best flask active when starting the fight. Using the best flask available is an easy way to improve performance.',
      )
        .icon(SPELLS.PHIAL_OF_GLACIAL_FURY.icon)
        .staticImportance(SUGGESTION_IMPORTANCE.MINOR),
    );
  }
}

export default FlaskChecker;
