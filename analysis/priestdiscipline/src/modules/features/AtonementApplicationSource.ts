import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, HealEvent } from 'parser/core/Events';

import {
  POWER_WORD_RADIANCE_ATONEMENT_DUR,
  POWER_WORD_SHIELD_ATONEMENT_DUR,
  SHADOW_MEND_ATONEMENT_DUR,
} from '@wowanalyzer/priest-discipline/src/constants';

class AtonementApplicationSource extends Analyzer {
  // Spells that apply atonement
  atonementApplicators = new Map<number, number>([
    [SPELLS.POWER_WORD_RADIANCE.id, POWER_WORD_RADIANCE_ATONEMENT_DUR],
    [SPELLS.POWER_WORD_SHIELD.id, POWER_WORD_SHIELD_ATONEMENT_DUR],
    [SPELLS.SHADOW_MEND.id, SHADOW_MEND_ATONEMENT_DUR],
  ]);

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER), this.onApplyBuff);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  get duration() {
    return this.atonementApplicators;
  }

  _event: ApplyBuffEvent | HealEvent | null = null;

  get event() {
    return this._event;
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
