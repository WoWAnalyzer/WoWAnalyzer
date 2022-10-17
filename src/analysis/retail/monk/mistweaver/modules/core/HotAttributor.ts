import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  GetRelatedEvents,
  HasRelatedEvent,
  RefreshBuffEvent,
} from 'parser/core/Events';
import HotTracker, { Attribution } from 'parser/shared/modules/HotTracker';
import {
  ENV_BREATH_APPLICATION,
  FROM_MISTS_OF_LIFE,
  isFromHardcast,
  isFromMistsOfLife,
  isFromDancingMists,
  isFromMistyPeaks,
  isFromRapidDiffusion,
} from '../../normalizers/CastLinkNormalizer';
import HotTrackerMW from '../core/HotTrackerMW';

const debug = true;

class HotAttributor extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerMW,
  };

  protected hotTracker!: HotTrackerMW;
  envMistHardcastAttrib = HotTracker.getNewAttribution('Enveloping Mist Hardcast');
  envMistMistyPeaksAttrib = HotTracker.getNewAttribution('Enveloping Mist Misty Peaks Proc');
  REMHardcastAttrib = HotTracker.getNewAttribution('Renewing Mist Hardcast');
  REMDancingMistsAttrib = HotTracker.getNewAttribution('Renewing Mist Dancing Mists Proc');
  REMRapidDiffusionAttrib = HotTracker.getNewAttribution('Renewing Mist Rapid Diffusion Proc');
  EFAttrib = HotTracker.getNewAttribution('Essence Font Hardcast');
  EnvbFromHardcastAttrib = HotTracker.getNewAttribution('Enveloping Breath Hardcast');
  MistsOfLifeEnvAttrib = HotTracker.getNewAttribution('Enveloping Mist Mists of Life Proc');
  MistsOfLifeEnvbAttrib = HotTracker.getNewAttribution('Enveloping Breath Mists of Life Proc');
  MistsOfLifeRemAttrib = HotTracker.getNewAttribution('Renewing Mist Mists of Life Proc');

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.onApplyRem,
    );
    this.addEventListener(
      Events.applybuff
        .by(SELECTED_PLAYER)
        .spell([TALENTS_MONK.ENVELOPING_MIST_TALENT, SPELLS.ENVELOPING_MIST_TFT]),
      this.onApplyEnvm,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell([SPELLS.ESSENCE_FONT_BUFF]),
      this.onApplyEF,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell([SPELLS.ENVELOPING_BREATH_HEAL]),
      this.onApplyEnvb,
    );
  }

  onApplyRem(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (event.prepull || isFromHardcast(event)) {
      debug &&
        console.log(
          'Attributed Renewing Mist hardcast at ' + this.owner.formatTimestamp(event.timestamp),
        );
      this.hotTracker.addAttributionFromApply(this.REMHardcastAttrib, event);
    } else if (isFromMistsOfLife(event)) {
      this.hotTracker.addAttributionFromApply(this.MistsOfLifeRemAttrib, event);
    } else if (isFromDancingMists(event)) {
      debug &&
        console.log(
          'Attributed Renewing Mist Dancing mists proc at ' +
            this.owner.formatTimestamp(event.timestamp),
        );
      this.hotTracker.addAttributionFromApply(this.REMDancingMistsAttrib, event);
    } else if (isFromRapidDiffusion(event)) {
      debug &&
        console.log(
          'Attributed Renewing Mist Rapid Diffusion proc at ' +
            this.owner.formatTimestamp(event.timestamp),
        );
      this.hotTracker.addAttributionFromApply(this.REMRapidDiffusionAttrib, event);
    }
  }

  onApplyEnvm(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (event.prepull || isFromHardcast(event)) {
      this.hotTracker.addAttributionFromApply(this.envMistHardcastAttrib, event);
      debug &&
        console.log(
          'Attributed Enveloping Mist hardcast at ' + this.owner.formatTimestamp(event.timestamp),
        );
    } else if (isFromMistyPeaks(event)) {
      debug &&
        console.log(
          'Attributed Misty Peaks Enveloping Mist at ' +
            this.owner.formatTimestamp(event.timestamp),
        );
      this.hotTracker.addAttributionFromApply(this.envMistMistyPeaksAttrib, event);
    } else if (isFromMistsOfLife(event)) {
      this.hotTracker.addAttributionFromApply(this.MistsOfLifeEnvAttrib, event);
    }
  }

  onApplyEF(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.hotTracker.addAttributionFromApply(this.EFAttrib, event);
  }

  onApplyEnvb(event: ApplyBuffEvent | RefreshBuffEvent) {
    const relatedEvents = GetRelatedEvents(event, ENV_BREATH_APPLICATION);
    if (relatedEvents.length === 1) {
      const relatedEvent = relatedEvents[0];
      if (HasRelatedEvent(relatedEvent, FROM_MISTS_OF_LIFE)) {
        this.hotTracker.addAttributionFromApply(this.MistsOfLifeEnvbAttrib, event);
      } else {
        this.hotTracker.addAttributionFromApply(this.EnvbFromHardcastAttrib, event);
      }
    } else {
      debug &&
        console.log(
          'Unattributed Enveloping Breath at ',
          this.owner.formatTimestamp(event.timestamp),
        );
    }
  }

  _logAttrib(event: ApplyBuffEvent | RefreshBuffEvent, attrib: Attribution | string | undefined) {
    if (attrib === undefined) {
      console.warn(
        'Could not attribute ' +
          event.ability.name +
          ' on ' +
          event.targetID +
          ' @ ' +
          this.owner.formatTimestamp(event.timestamp) +
          '!',
      );
    } else {
      debug &&
        console.log(
          'Attributed ' +
            event.ability.name +
            ' on ' +
            event.targetID +
            ' @ ' +
            this.owner.formatTimestamp(event.timestamp) +
            ' to ' +
            (typeof attrib === 'object' ? attrib.name : attrib),
        );
    }
  }
}

export default HotAttributor;
