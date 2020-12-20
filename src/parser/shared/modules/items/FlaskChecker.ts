import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import SPELLS from 'common/SPELLS/index';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import Events, { ApplyBuffEvent } from 'parser/core/Events';

const MIN_FLASK_IDS: number[] = [
  SPELLS.GREATER_FLASK_OF_THE_CURRENTS.id,
  SPELLS.GREATER_FLASK_OF_ENDLESS_FATHOMS.id,
  SPELLS.GREATER_FLASK_OF_THE_UNDERTOW.id,
  SPELLS.GREATER_FLASK_OF_THE_VAST_HORIZON.id,
];

const MAX_FLASK_IDS: number[] = [
  SPELLS.SPECTRAL_FLASK_OF_POWER.id,
  SPELLS.SPECTRAL_FLASK_OF_STAMINA.id,
  SPELLS.ETERNAL_FLASK.id,
];

class FlaskChecker extends Analyzer {
  startFightWithFlaskUp = false;
  strongFlaskUsed = false;

  constructor(options: Options){
    super(options);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER), this.onApplybuff.bind(this));
  }

  onApplybuff(event: ApplyBuffEvent) {
    const spellId = event.ability.guid;
    if (MIN_FLASK_IDS.includes(spellId) && event.prepull) {
      this.startFightWithFlaskUp = true;
    }
    if (MAX_FLASK_IDS.includes(spellId) && event.prepull) {
      this.startFightWithFlaskUp = true;
      this.strongFlaskUsed = true;
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
    when(this.flaskSuggestionThresholds)
      .addSuggestion((suggest) => suggest('You did not have a flask up before combat. Having a flask during combat increases your primary stat significantly.')
          .icon(SPELLS.SPECTRAL_FLASK_OF_POWER.icon)
          .staticImportance(SUGGESTION_IMPORTANCE.MINOR));
    when(this.flaskStrengthSuggestion)
      .addSuggestion((suggest) => suggest('You did not have the best flask active when starting the fight. Using the best flask available is an easy way to improve performance.')
          .icon(SPELLS.SPECTRAL_FLASK_OF_POWER.icon)
          .staticImportance(SUGGESTION_IMPORTANCE.MINOR));
  }
}

export default FlaskChecker;
