import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';

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
}

export default FlaskChecker;
