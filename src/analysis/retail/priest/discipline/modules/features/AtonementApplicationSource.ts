import {
  POWER_WORD_RADIANCE_ATONEMENT_DUR,
  POWER_WORD_SHIELD_ATONEMENT_DUR,
  RENEW_ATONEMENT_DUR,
  FLASH_HEAL_ATONEMENT_DUR,
} from 'analysis/retail/priest/discipline/constants';
import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, HealEvent } from 'parser/core/Events';

class AtonementApplicationSource extends Analyzer {
  // Spells that apply atonement
  atonementApplicators = new Map<number, number>([
    [TALENTS_PRIEST.POWER_WORD_RADIANCE_TALENT.id, POWER_WORD_RADIANCE_ATONEMENT_DUR],
    [SPELLS.POWER_WORD_SHIELD.id, POWER_WORD_SHIELD_ATONEMENT_DUR],
    [TALENTS_PRIEST.RENEW_TALENT.id, RENEW_ATONEMENT_DUR],
    [SPELLS.FLASH_HEAL.id, FLASH_HEAL_ATONEMENT_DUR],
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
