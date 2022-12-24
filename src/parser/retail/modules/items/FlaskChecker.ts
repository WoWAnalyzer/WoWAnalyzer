import SPELLS from 'common/SPELLS/dragonflight/phials';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { When, ThresholdStyle } from 'parser/core/ParseResults';

// TODO: Determine how we can tell if a phial was R1 or R2
const MIN_FLASK_IDS: number[] = [
  SPELLS.AERATED_PHIAL_OF_QUICK_HANDS.id,
  SPELLS.AERATED_PHIAL_OF_DEFTNESS.id,
  SPELLS.CRYSTALLINE_PHIAL_OF_PERCEPTION.id,
  SPELLS.STEAMING_PHIAL_OF_FINESSE.id,
];

const MAX_FLASK_IDS: number[] = [
  SPELLS.CHARGED_PHIAL_OF_ALACRITY.id,
  SPELLS.PHIAL_OF_CHARGED_ISOLATION.id,
  SPELLS.PHIAL_OF_STATIC_EMPOWERMENT.id,
  SPELLS.PHIAL_OF_STILL_AIR.id,
  SPELLS.PHIAL_OF_THE_EYE_IN_THE_STORM.id,
  SPELLS.PHIAL_OF_TEPID_VERSATILITY.id,
  SPELLS.PHIAL_OF_GLACIAL_FURY.id,
  SPELLS.ICED_PHIAL_OF_CORRUPTING_RAGE.id,
  SPELLS.PHIAL_OF_ICY_PRESERVATION.id,
  SPELLS.PHIAL_OF_ELEMENTAL_CHAOS.id,
];

class FlaskChecker extends Analyzer {
  startFightWithFlaskUp = false;
  strongFlaskUsed = false;
  flaskBuffId?: number;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER), this.onApplybuff.bind(this));
  }

  onApplybuff(event: ApplyBuffEvent) {
    const spellId = event.ability.guid;
    if (MIN_FLASK_IDS.includes(spellId) && event.prepull) {
      this.startFightWithFlaskUp = true;
      this.flaskBuffId = spellId;
    }
    if (MAX_FLASK_IDS.includes(spellId) && event.prepull) {
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
