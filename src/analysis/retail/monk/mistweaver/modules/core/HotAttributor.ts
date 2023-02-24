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
import HotTracker, { Attribution } from 'parser/shared/modules/HotTracker';
import { ATTRIBUTION_STRINGS } from '../../constants';
import {
  isFromHardcast,
  isFromMistyPeaks,
  isFromRapidDiffusion,
  isFromMistsOfLife,
  isFromDancingMists,
} from '../../normalizers/CastLinkNormalizer';
import HotTrackerMW from '../core/HotTrackerMW';

const debug = false;
const remDebug = false;
const rdDebug = false;
const dmDebug = false;

class HotAttributor extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerMW,
    combatants: Combatants,
  };

  protected combatants!: Combatants;
  protected hotTracker!: HotTrackerMW;
  bouncedAttrib = HotTracker.getNewAttribution(ATTRIBUTION_STRINGS.BOUNCED);
  envMistHardcastAttrib = HotTracker.getNewAttribution(
    ATTRIBUTION_STRINGS.HARDCAST_ENVELOPING_MIST,
  );
  envMistMistyPeaksAttrib = HotTracker.getNewAttribution(
    ATTRIBUTION_STRINGS.MISTY_PEAKS_ENVELOPING_MIST,
  );
  rapidDiffusionAttrib = HotTracker.getNewAttribution(
    ATTRIBUTION_STRINGS.RAPID_DIFFUSION_RENEWING_MIST,
  );
  REMHardcastAttrib = HotTracker.getNewAttribution(ATTRIBUTION_STRINGS.HARDCAST_RENEWING_MIST);
  MistsOfLifeAttrib = HotTracker.getNewAttribution(ATTRIBUTION_STRINGS.MISTS_OF_LIFE_RENEWING_MIST);
  dancingMistAttrib = HotTracker.getNewAttribution(ATTRIBUTION_STRINGS.DANCING_MIST_RENEWING_MIST);
  EFAttrib = HotTracker.getNewAttribution(ATTRIBUTION_STRINGS.HARDCAST_ESSENCE_FONT);

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
  }

  onRemoveRem(event: RemoveBuffEvent) {
    remDebug &&
      console.log(
        'Removed rem from ' +
          this.combatants.getEntity(event)?.name +
          ' at ' +
          this.owner.formatTimestamp(event.timestamp, 3),
      );
  }

  onApplyRem(event: ApplyBuffEvent | RefreshBuffEvent) {
    const targetID = event.targetID;
    const spellID = event.ability.guid;
    if (!this.hotTracker.hots[targetID] || !this.hotTracker.hots[targetID][spellID]) {
      return;
    }

    if (this._hasBouncedAttribution(event)) {
      //bounced
      remDebug && this._existingReMAttributionLogging(event);
    } else if (isFromMistsOfLife(event)) {
      //mists of life rem
      remDebug && this._newReMAttributionLogging(event, this.MistsOfLifeAttrib);
      this.hotTracker.addAttributionFromApply(this.MistsOfLifeAttrib, event);
      this.hotTracker.hots[event.targetID][event.ability.guid].maxDuration =
        this.hotTracker._getDuration(this.hotTracker.hotInfo[event.ability.guid]);
    } else if (event.prepull || isFromHardcast(event)) {
      //hardcast rem
      remDebug && this._newReMAttributionLogging(event, this.REMHardcastAttrib);
      this.hotTracker.addAttributionFromApply(this.REMHardcastAttrib, event);
    } else if (isFromRapidDiffusion(event)) {
      //rapid diffusion rem
      rdDebug && this._newReMAttributionLogging(event, this.rapidDiffusionAttrib);
      this.hotTracker.addAttributionFromApply(this.rapidDiffusionAttrib, event);
      this.hotTracker.hots[targetID][spellID].maxDuration =
        this.hotTracker._getRapidDiffusionMaxDuration(this.selectedCombatant);
      this.hotTracker.hots[event.targetID][event.ability.guid].end = this.hotTracker.hots[
        event.targetID
      ][event.ability.guid].originalEnd =
        event.timestamp + Number(this.hotTracker.hotInfo[event.ability.guid].procDuration);
    } else if (isFromDancingMists(event)) {
      //dancing mists rem
      dmDebug && this._newReMAttributionLogging(event, this.dancingMistAttrib);
      this.hotTracker.addAttributionFromApply(this.dancingMistAttrib, event);
    }
  }

  onApplyEnvm(event: ApplyBuffEvent | RefreshBuffEvent) {
    const targetID = event.targetID;
    const spellID = event.ability.guid;
    if (!this.hotTracker.hots[targetID] || !this.hotTracker.hots[targetID][spellID]) {
      return;
    }

    if (this._hasAttribution(event)) {
      return;
    } else if (isFromMistsOfLife(event)) {
      debug &&
        console.log(
          'Attributed Enveloping Mist from Mists of Life at ' +
            this.owner.formatTimestamp(event.timestamp),
          'on ' + this.combatants.getEntity(event)?.name,
        );
      this.hotTracker.addAttributionFromApply(this.MistsOfLifeAttrib, event);
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
      this.hotTracker.hots[targetID][spellID].maxDuration =
        this.hotTracker._getMistyPeaksMaxDuration(this.selectedCombatant);
      this.hotTracker.hots[event.targetID][event.ability.guid].end = this.hotTracker.hots[
        event.targetID
      ][event.ability.guid].originalEnd =
        event.timestamp + Number(this.hotTracker.hotInfo[event.ability.guid].procDuration);
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

  _hasBouncedAttribution(event: ApplyBuffEvent | HealEvent | RefreshBuffEvent | RemoveBuffEvent) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;
    if (!this.hotTracker.hots[targetId] || !this.hotTracker.hots[targetId][spellId]) {
      return;
    }
    return (
      this.hotTracker.hots[targetId][spellId].attributions.length > 0 &&
      this.hotTracker.hots[targetId][spellId].attributions.indexOf(this.bouncedAttrib)
    );
  }

  _existingReMAttributionLogging(event: ApplyBuffEvent | RefreshBuffEvent) {
    const attribution =
      this.hotTracker.hots[event.targetID][event.ability.guid].attributions[0].name;
    if (attribution) {
      console.log(
        'Bounce! Existing ' +
          this.hotTracker.hots[event.targetID][event.ability.guid].attributions[0].name +
          ' at ' +
          this.owner.formatTimestamp(event.timestamp, 3),
        'on ' + this.combatants.getEntity(event)?.name,
      );
    }
  }

  _newReMAttributionLogging(event: ApplyBuffEvent | RefreshBuffEvent, attribution: Attribution) {
    switch (attribution) {
      case this.REMHardcastAttrib: {
        console.log(
          'Hardcast Renewing Mist at ' + this.owner.formatTimestamp(event.timestamp, 3),
          'on ' + this.combatants.getEntity(event)?.name,
        );
        break;
      }
      case this.rapidDiffusionAttrib: {
        console.log(
          ' Rapid Diffusion Renewing Mist at ' + this.owner.formatTimestamp(event.timestamp, 3),
          'on ' + this.combatants.getEntity(event)?.name,
          ' expected expiration: ' +
            this.owner.formatTimestamp(
              event.timestamp + Number(this.hotTracker.hotInfo[event.ability.guid].procDuration),
              3,
            ),
        );
        break;
      }
      case this.MistsOfLifeAttrib: {
        console.log(
          'Attributed Renewing Mist from Mists of Life at ' +
            this.owner.formatTimestamp(event.timestamp),
          'on ' + this.combatants.getEntity(event)?.name,
        );
        break;
      }
      case this.dancingMistAttrib: {
        console.log(
          'Dancing Mist Renewing Mist at ' + this.owner.formatTimestamp(event.timestamp, 3),
          'on ' + this.combatants.getEntity(event)?.name,
        );
        break;
      }
    }
  }
}

export default HotAttributor;
