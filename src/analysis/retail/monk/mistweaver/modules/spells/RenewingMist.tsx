import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, HealEvent, RemoveBuffEvent } from 'parser/core/Events';

class RenewingMist extends Analyzer {
  currentRenewingMists: number = 0;
  totalHealing: number = 0;
  totalOverhealing: number = 0;
  totalAbsorbs: number = 0;
  gustsHealing: number = 0;
  lastCastTarget: number = 0;
  healingHits: number = 0;
  numberToCount: number = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.RENEWING_MIST_TALENT),
      this.castRenewingMist,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUSTS_OF_MISTS),
      this.handleGustsOfMists,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.handleRenewingMist,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.onApplyRem,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.onRemoveRem,
    );
  }

  onApplyRem(event: ApplyBuffEvent) {
    this.currentRenewingMists += 1;
  }

  onRemoveRem(event: RemoveBuffEvent) {
    this.currentRenewingMists -= 1;
  }

  castRenewingMist(event: CastEvent) {
    this.numberToCount += 1;
    this.lastCastTarget = event.targetID || 0;
  }

  handleGustsOfMists(event: HealEvent) {
    if (this.lastCastTarget === event.targetID && this.numberToCount > 0) {
      this.gustsHealing += (event.amount || 0) + (event.absorbed || 0);
      this.numberToCount -= 1;
    }
  }

  handleRenewingMist(event: HealEvent) {
    this.totalHealing += event.amount || 0;
    this.totalOverhealing += event.overheal || 0;
    this.totalAbsorbs += event.absorbed || 0;
    this.healingHits += 1;
  }
}

export default RenewingMist;
