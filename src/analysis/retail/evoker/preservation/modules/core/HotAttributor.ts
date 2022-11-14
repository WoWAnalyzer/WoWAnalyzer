import { TALENTS_EVOKER } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
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
  temporalAnomalyOverwriteHardcast = HotTracker.getNewAttribution('TA Overwrite');
  echoHardCastOverwriteTemporalAnomaly = HotTracker.getNewAttribution('Echo Overwrite');

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS_EVOKER.ECHO_TALENT),
      this.onApplyEcho,
    );
  }

  onApplyEcho(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (this._hasAttribution(event)) {
      const attribution = this.hotTracker.hots[event.targetID][event.ability.guid].attributions[0]
        .name;
      if (attribution === this.echoHardcastAttrib.name) {
        this.hotTracker.addAttributionFromApply(this.temporalAnomalyOverwriteHardcast, event);
      } else if (attribution === this.echoTemporalAnomalyAttrib.name) {
        this.hotTracker.addAttributionFromApply(this.echoHardCastOverwriteTemporalAnomaly, event);
      }
    } else if (isFromHardcast(event)) {
      this.hotTracker.addAttributionFromApply(this.echoHardcastAttrib, event);
    } else if (isFromTemporalAnomaly(event)) {
      this.hotTracker.addAttributionFromApply(this.echoTemporalAnomalyAttrib, event);
    }
  }

  _hasAttribution(event: ApplyBuffEvent | HealEvent | RefreshBuffEvent | RemoveBuffEvent) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;
    if (!this.hotTracker.hots[targetId] || !this.hotTracker.hots[targetId][spellId]) {
      return;
    }
    return this.hotTracker.hots[targetId][spellId].attributions.length > 0;
  }
}

export default HotAttributor;
