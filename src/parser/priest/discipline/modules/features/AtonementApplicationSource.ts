import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, HealEvent } from 'parser/core/Events';

class AtonementApplicationSource extends Analyzer {
  // Spells that apply atonement
  atonementApplicators = new Map([
    [SPELLS.POWER_WORD_RADIANCE.id, SPELLS.POWER_WORD_RADIANCE.atonementDuration],
    [SPELLS.POWER_WORD_SHIELD.id, SPELLS.POWER_WORD_SHIELD.atonementDuration],
    [SPELLS.SHADOW_MEND.id, SPELLS.SHADOW_MEND.atonementDuration],
  ]);

  get duration() {
    return this.atonementApplicators;
  }

  _event: ApplyBuffEvent | HealEvent | null = null;

  get event() {
    return this._event;
  }
  constructor(options: Options){
    super(options);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER), this.onApplyBuff);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  onApplyBuff(event: ApplyBuffEvent) {
    if (this.atonementApplicators.has(event.ability.guid)) {
      this._event = event;
    }
  }

  onHeal(event: HealEvent) {
    if (this.atonementApplicators.has(event.ability.guid)) {
      this._event = event;
    }
  }
}

export default AtonementApplicationSource;
