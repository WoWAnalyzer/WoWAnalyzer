import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  DeathEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import HotTracker from 'parser/shared/modules/HotTracker';
import {
  isFromDeath,
  isFromHardcast,
  isFromMistyPeaks,
  isFromRapidDiffusion,
} from '../../normalizers/CastLinkNormalizer';
import HotTrackerMW from '../core/HotTrackerMW';

const debug = true;
const rdDebug = true;

class HotAttributor extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerMW,
    combatants: Combatants,
  };

  protected combatants!: Combatants;
  protected hotTracker!: HotTrackerMW;
  envMistHardcastAttrib = HotTracker.getNewAttribution('Enveloping Mist Hardcast');
  envMistMistyPeaksAttrib = HotTracker.getNewAttribution('Enveloping Mist Misty Peaks Proc');
  rapidDiffusionAttrib = HotTracker.getNewAttribution('Renewing Mist Rapid Diffusion');
  REMHardcastAttrib = HotTracker.getNewAttribution('Renewing Mist Hardcast');
  EFAttrib = HotTracker.getNewAttribution('Essence Font Hardcast');

  lastDeathTimestamp = 0;

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
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.onRemoveRem,
    );
    this.addEventListener(Events.death.to(SELECTED_PLAYER), this.handleDeath);
  }

  handleDeath(event: DeathEvent) {
    console.log(
      'death of' +
        this.combatants.getEntity(event)?.name +
        ' at: ' +
        this.owner.formatTimestamp(event.timestamp),
    );
    this.lastDeathTimestamp = event.timestamp;
  }
  onRemoveRem(event: RemoveBuffEvent) {
    const targetId = event.targetID;
    const spellId = event.ability.guid;
    // console.log('Removed ' + this.hotTracker.hots[targetId][spellId] + 'attributions at ' + this.owner.formatTimestamp(event.timestamp, 3),
    //     'on ' + this.combatants.getEntity(event)?.name,);
    if (isFromDeath(event)) {
      console.log('removed because of player death, deleting from hot tracker');
      this.hotTracker.hotRemoved(event);
      delete this.hotTracker.hots[targetId][spellId];
    }
  }

  onApplyRem(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (this._hasAttribution(event)) {
      if (debug) {
        console.log(
          this.owner.formatTimestamp(event.timestamp, 3) +
            ': rem has ' +
            this.hotTracker.hots[event.targetID][event.ability.guid].attributions.length +
            ' attributions.',
        );
        if (
          this.hotTracker.hots[event.targetID][event.ability.guid].attributions[0].name ===
          'Renewing Mist Hardcast'
        ) {
          console.log(
            'Bounce! Existing ' +
              this.hotTracker.hots[event.targetID][event.ability.guid].attributions[0].name +
              ' at ' +
              this.owner.formatTimestamp(event.timestamp, 3),
            'on ' + this.combatants.getEntity(event)?.name,
          );
          return;
        } else if (
          this.hotTracker.hots[event.targetID][event.ability.guid].attributions[0].name ===
          'Renewing Mist Rapid Diffusion'
        ) {
          console.log(
            'Bounce! Existing ' +
              this.hotTracker.hots[event.targetID][event.ability.guid].attributions[0].name +
              ' at ' +
              this.owner.formatTimestamp(event.timestamp, 3),
            'on ' + this.combatants.getEntity(event)?.name,
          );
          return;
        } else {
          return;
        }
      }
    } else if (event.prepull || isFromHardcast(event)) {
      debug &&
        console.log(
          'Hardcast Renewing Mist at ' + this.owner.formatTimestamp(event.timestamp, 3),
          'on ' + this.combatants.getEntity(event)?.name,
        );
      this.hotTracker.addAttributionFromApply(this.REMHardcastAttrib, event);
    } else if (isFromRapidDiffusion(event)) {
      rdDebug &&
        console.log(
          ' Rapid Diffusion Renewing Mist at ' + this.owner.formatTimestamp(event.timestamp, 3),
          'on ' + this.combatants.getEntity(event)?.name,
        );
      this.hotTracker.addAttributionFromApply(this.rapidDiffusionAttrib, event);
    }
  }

  onApplyEnvm(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (this._hasAttribution(event)) {
      return;
    } else if (event.prepull || isFromHardcast(event)) {
      this.hotTracker.addAttributionFromApply(this.envMistHardcastAttrib, event);
      debug &&
        console.log(
          'Attributed Enveloping Mist hardcast at ' +
            this.owner.formatTimestamp(event.timestamp, 3),
          'on ' + this.combatants.getEntity(event)?.name,
        );
    } else if (isFromMistyPeaks(event)) {
      debug &&
        console.log(
          'Attributed Misty Peaks Enveloping Mist at ' +
            this.owner.formatTimestamp(event.timestamp, 3),
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
