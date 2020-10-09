import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import { ApplyBuffEvent, HealEvent } from 'parser/core/Events';
import { POWER_WORD_RADIANCE_ATONEMENT_DUR, POWER_WORD_SHIELD_ATONEMENT_DUR, SHADOW_MEND_ATONEMENT_DUR } from 'parser/priest/discipline/constants';

class AtonementApplicationSource extends Analyzer {
  // Spells that apply atonement
  atonementApplicators = new Map([
    [SPELLS.POWER_WORD_RADIANCE.id, POWER_WORD_RADIANCE_ATONEMENT_DUR],
    [SPELLS.POWER_WORD_SHIELD.id, POWER_WORD_SHIELD_ATONEMENT_DUR],
    [SPELLS.SHADOW_MEND.id, SHADOW_MEND_ATONEMENT_DUR],
  ]);

  get duration() {
    return this.atonementApplicators;
  }

  _event: ApplyBuffEvent | HealEvent | null = null;

  get event() {
    return this._event;
  }

  on_byPlayer_applybuff(event: ApplyBuffEvent) {
    if (this.atonementApplicators.has(event.ability.guid)) {
      this._event = event;
    }
  }

  on_byPlayer_heal(event: HealEvent) {
    if (this.atonementApplicators.has(event.ability.guid)) {
      this._event = event;
    }
  }
}

export default AtonementApplicationSource;
