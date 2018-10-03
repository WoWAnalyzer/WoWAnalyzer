import Analyzer from 'parser/core/Analyzer';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import SPELLS from 'common/SPELLS';

const MAX_FLASK_IDS = [
  SPELLS.FLASK_OF_THE_CURRENTS.id,
  SPELLS.FLASK_OF_ENDLESS_FATHOMS.id,
  SPELLS.FLASK_OF_THE_UNDERTOW.id,
  SPELLS.FLASK_OF_THE_VAST_HORIZON.id,
];

class FlaskChecker extends Analyzer {
  startFightWithFlaskUp = false;
  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (MAX_FLASK_IDS.includes(spellId) && event.prepull) {
      this.startFightWithFlaskUp = true;
    }
  }
  get flaskSuggestionThresholds() {
    return {
      actual: this.startFightWithFlaskUp,
      isEqual: false,
      style: 'boolean',
    };
  }
  suggestions(when) {
    when(this.flaskSuggestionThresholds)
      .addSuggestion((suggest) => {
        return suggest('You did not have a flask up before combat. Having a flask during combat increases your primary stat significantly.')
          .icon(SPELLS.FLASK_OF_THE_CURRENTS.icon)
          .staticImportance(SUGGESTION_IMPORTANCE.MINOR);
      });
  }
}

export default FlaskChecker;
