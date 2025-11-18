import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import BaseFlaskChecker from 'parser/shared/modules/items/FlaskChecker';

const MAX_FLASK_IDS = [
  // stolen from wipefest. i haven't validated
  92679, // Flask of Battle
  105617, // Alchemist's Flask
  105689, // Flask of Spring Blossoms
  105691, // Flask of the Warm Sun
  105693, // Flask of Falling Leaves
  105694, // Flask of the Earth
  105696, // Flask of Winter's Bite
];

const MIN_FLASK_IDS: number[] = [
  // TODO
];

const GUARDIAN_ELIXIR_IDS: number[] = [];

const BATTLE_ELIXIR_IDS: number[] = [];

class FlaskChecker extends BaseFlaskChecker {
  //flaskBuffId: number | null = null;
  guardianElixirId: number | null = null;
  battleElixirId: number | null = null;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER), this.onApplybuff);
  }

  get MinFlaskIds(): number[] {
    return MIN_FLASK_IDS;
  }

  get MaxFlaskIds(): number[] {
    return MAX_FLASK_IDS;
  }

  onApplybuff(event: ApplyBuffEvent) {
    super.onApplybuff(event);

    const spellId = event.ability.guid;

    if (GUARDIAN_ELIXIR_IDS.includes(spellId) && event.prepull) {
      this.guardianElixirId = spellId;
    }
    if (BATTLE_ELIXIR_IDS.includes(spellId) && event.prepull) {
      this.battleElixirId = spellId;
    }
  }

  get FlaskSuggestionThresholds() {
    return {
      actual: Boolean(this.flaskBuffId) || Boolean(this.guardianElixirId && this.battleElixirId),
      isEqual: false,
      style: ThresholdStyle.BOOLEAN,
    };
  }

  get GuardianElixirSuggestionThresholds() {
    return {
      actual: !this.flaskBuffId && !this.guardianElixirId,
      isEqual: true,
      style: ThresholdStyle.BOOLEAN,
    };
  }

  get BattleElixirSuggestionThresholds() {
    return {
      actual: !this.flaskBuffId && !this.battleElixirId,
      isEqual: true,
      style: ThresholdStyle.BOOLEAN,
    };
  }
}

export default FlaskChecker;
