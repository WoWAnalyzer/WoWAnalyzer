import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';
import HotTracker from 'parser/shared/modules/HotTracker';
import Events, { ApplyBuffEvent, RefreshBuffEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import RenewTracker from './RenewTracker';
import { isRenewFromSalv } from '../../../../normalizers/CastLinkNormalizer';
import { TALENTS_PRIEST } from 'common/TALENTS';

// I don't know if I even had to write this but I did

class RenewAttributor extends Analyzer {
  static dependencies = {
    renewTracker: RenewTracker,
    combatants: Combatants,
  };

  protected combatants!: Combatants;
  protected renewTracker!: RenewTracker;

  notSalvAttrib = HotTracker.getNewAttribution('Not Salvation');
  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS_PRIEST.RENEW_TALENT),
      this.onApplyRenew,
    );
  }

  onApplyRenew(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (isRenewFromSalv(event)) {
      return;
    }

    this.renewTracker.addAttributionFromApply(this.notSalvAttrib, event);
  }
}

export default RenewAttributor;
