import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import HotTracker from 'parser/shared/modules/HotTracker';
import { isFromHardcast, isFromMistyPeaks } from '../../normalizers/CastLinkNormalizer';
import HotTrackerMW from '../core/HotTrackerMW';

const debug = false;

class HotAttributor extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerMW,
    combatants: Combatants,
  };

  protected combatants!: Combatants;
  protected hotTracker!: HotTrackerMW;
  envMistHardcastAttrib = HotTracker.getNewAttribution('Enveloping Mist Hardcast');
  envMistMistyPeaksAttrib = HotTracker.getNewAttribution('Enveloping Mist Misty Peaks Proc');
  REMHardcastAttrib = HotTracker.getNewAttribution('Renewing Mist Hardcast');
  EFAttrib = HotTracker.getNewAttribution('Essence Font Hardcast');

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.onApplyRem,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS_MONK.ENVELOPING_MIST_TALENT),
      this.onApplyEnvm,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell([SPELLS.ESSENCE_FONT_BUFF]),
      this.onApplyEF,
    );
  }

  onApplyRem(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (this._hasAttribution(event)) {
      return;
    } else if (event.prepull || isFromHardcast(event)) {
      debug &&
        console.log(
          'Attributed Renewing Mist hardcast at ' + this.owner.formatTimestamp(event.timestamp),
          'on ' + this.combatants.getEntity(event)?.name,
        );
      this.hotTracker.addAttributionFromApply(this.REMHardcastAttrib, event);
    }
  }

  onApplyEnvm(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (this._hasAttribution(event)) {
      return;
    } else if (event.prepull || isFromHardcast(event)) {
      this.hotTracker.addAttributionFromApply(this.envMistHardcastAttrib, event);
      debug &&
        console.log(
          'Attributed Enveloping Mist hardcast at ' + this.owner.formatTimestamp(event.timestamp),
          'on ' + this.combatants.getEntity(event)?.name,
        );
    } else if (isFromMistyPeaks(event)) {
      debug &&
        console.log(
          'Attributed Misty Peaks Enveloping Mist at ' +
            this.owner.formatTimestamp(event.timestamp),
          'on ' + this.combatants.getEntity(event)?.name,
        );
      this.hotTracker.addAttributionFromApply(this.envMistMistyPeaksAttrib, event);
    }
  }

  onApplyEF(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.hotTracker.addAttributionFromApply(this.EFAttrib, event);
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
