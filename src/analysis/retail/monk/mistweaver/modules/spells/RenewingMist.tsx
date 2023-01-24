import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import { isFromEssenceFont, isFromRenewingMist } from '../../normalizers/CastLinkNormalizer';

class RenewingMist extends Analyzer {
  currentRenewingMists: number = 0;
  totalHealing: number = 0;
  totalOverhealing: number = 0;
  totalAbsorbs: number = 0;
  gustsHealing: number = 0;
  healingHits: number = 0;

  constructor(options: Options) {
    super(options);
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

  handleGustsOfMists(event: HealEvent) {
    if (isFromRenewingMist(event) && !isFromEssenceFont(event)) {
      this.gustsHealing += (event.amount || 0) + (event.absorbed || 0);
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
