import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AbsorbedEvent } from 'parser/core/Events';

export default class BloodShield extends Analyzer {
  private _totalHealing = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.BLOOD_SHIELD),
      this.recordShield,
    );
  }

  get totalHealing(): number {
    return this._totalHealing;
  }

  private recordShield(event: AbsorbedEvent) {
    this._totalHealing += event.amount;
  }
}
