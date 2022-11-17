import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RefreshBuffEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import HotTracker from 'parser/shared/modules/HotTracker';
import { isFromHardcast, isFromTemporalAnomaly } from '../../normalizers/CastLinkNormalizer';
import HotTrackerPrevoker from '../core/HotTrackerPrevoker';

class HotAttributor extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerPrevoker,
    combatants: Combatants,
  };

  protected combatants!: Combatants;
  protected hotTracker!: HotTrackerPrevoker;

  echoHardcastAttrib = HotTracker.getNewAttribution('Echo Hardcast');
  echoTemporalAnomalyAttrib = HotTracker.getNewAttribution('Echo Temporal Anomaly');

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell([SPELLS.REVERSION_ECHO, SPELLS.DREAM_BREATH_ECHO]),
      this.onApplyEchoHot,
    );
  }

  onApplyEchoHot(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (isFromHardcast(event)) {
      this.hotTracker.addAttributionFromApply(this.echoHardcastAttrib, event);
    } else if (isFromTemporalAnomaly(event)) {
      this.hotTracker.addAttributionFromApply(this.echoTemporalAnomalyAttrib, event);
    }
  }
}

export default HotAttributor;
