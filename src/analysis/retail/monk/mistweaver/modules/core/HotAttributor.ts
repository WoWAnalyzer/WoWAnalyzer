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
import HotTracker, { Attribution, Tracker } from 'parser/shared/modules/HotTracker';
import { ATTRIBUTION_STRINGS } from '../../constants';
import {
  isFromHardcast,
  isFromMistyPeaks,
  isFromRapidDiffusion,
  isFromMistsOfLife,
  isFromDancingMists,
  getSourceRem,
  isFromRapidDiffusionEnvelopingMist,
  isFromRapidDiffusionRisingSunKick,
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
  dmSourceRDAttrib = HotTracker.getNewAttribution(
    ATTRIBUTION_STRINGS.DANCING_MIST_SOURCES.DM_SOURCE_RD,
  );
  dmSourceHCAttrib = HotTracker.getNewAttribution(
    ATTRIBUTION_STRINGS.DANCING_MIST_SOURCES.DM_SOURCE_HC,
  );
  dmSourceMoLAttrib = HotTracker.getNewAttribution(
    ATTRIBUTION_STRINGS.DANCING_MIST_SOURCES.DM_SOURCE_MOL,
  );
  rdSourceRSKAttrib = HotTracker.getNewAttribution(
    ATTRIBUTION_STRINGS.RAPID_DIFFUSION_SOURCES.RD_SOURCE_RSK,
  );
  rdSourceENVAttrib = HotTracker.getNewAttribution(
    ATTRIBUTION_STRINGS.RAPID_DIFFUSION_SOURCES.RD_SOURCE_ENV,
  );

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
      Events.refreshbuff.by(SELECTED_PLAYER).spell(TALENTS_MONK.ENVELOPING_MIST_TALENT),
      this.onApplyEnvm,
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
        event.timestamp,
      );
  }

  onApplyRem(event: ApplyBuffEvent | RefreshBuffEvent) {
    const targetID = event.targetID;
    const spellID = event.ability.guid;
    if (!this.hotTracker.hots[targetID] || !this.hotTracker.hots[targetID][spellID]) {
      return;
    }
    const hot = this.hotTracker.hots[targetID][spellID];
    if (this._hasBouncedAttribution(event)) {
      //bounced
      remDebug && this._existingReMAttributionLogging(event);
    } else if (isFromMistsOfLife(event)) {
      //mists of life rem
      this.hotTracker.addAttributionFromApply(this.MistsOfLifeAttrib, event);
      hot.maxDuration = this.hotTracker._getDuration(this.hotTracker.hotInfo[spellID]);
      remDebug && this._newReMAttributionLogging(event, this.MistsOfLifeAttrib);
    } else if (event.prepull || isFromHardcast(event)) {
      //hardcast rem
      remDebug && this._newReMAttributionLogging(event, this.REMHardcastAttrib);
      this.hotTracker.addAttributionFromApply(this.REMHardcastAttrib, event);
    } else if (isFromRapidDiffusion(event)) {
      //rapid diffusion rem
      this._attributeRapidDiffusionRem(event, hot);
    } else if (isFromDancingMists(event)) {
      //dancing mists rem
      this._attributeDancingMistRem(event);
    }
  }

  onApplyEnvm(event: ApplyBuffEvent | RefreshBuffEvent) {
    const targetID = event.targetID;
    const spellID = event.ability.guid;
    if (!this.hotTracker.hots[targetID] || !this.hotTracker.hots[targetID][spellID]) {
      return;
    }
    const hot = this.hotTracker.hots[targetID][spellID];
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
      this.hotTracker.addAttributionFromApply(this.envMistMistyPeaksAttrib, event);
      hot.maxDuration = this.hotTracker._getMistyPeaksMaxDuration(this.selectedCombatant);
      hot.end = hot.originalEnd =
        event.timestamp + Number(this.hotTracker._getMistyPeaksDuration(this.selectedCombatant));
      debug &&
        console.log(
          'Attributed Misty Peaks Enveloping Mist at ' +
            this.owner.formatTimestamp(event.timestamp, 3),
          'on ' + this.combatants.getEntity(event)?.name,
          hot,
        );
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

  private _existingReMAttributionLogging(event: ApplyBuffEvent | RefreshBuffEvent) {
    const attribution =
      this.hotTracker.hots[event.targetID][event.ability.guid].attributions[0].name;
    if (attribution) {
      console.log(
        'Bounce! Existing ' +
          this.hotTracker.hots[event.targetID][event.ability.guid].attributions[0].name +
          ' at ' +
          this.owner.formatTimestamp(event.timestamp, 3),
        'on ' + this.combatants.getEntity(event)?.name,
        this.hotTracker.hots[event.targetID][event.ability.guid],
      );
    }
  }

  private _newReMAttributionLogging(
    event: ApplyBuffEvent | RefreshBuffEvent,
    attribution: Attribution,
  ) {
    switch (attribution) {
      case this.REMHardcastAttrib: {
        console.log(
          'Hardcast Renewing Mist at ' + this.owner.formatTimestamp(event.timestamp, 3),
          'on ' + this.combatants.getEntity(event)?.name,
          this.hotTracker.hots[event.targetID][event.ability.guid],
        );
        break;
      }
      case this.rapidDiffusionAttrib: {
        console.log(
          ' Rapid Diffusion Renewing Mist at ' + this.owner.formatTimestamp(event.timestamp, 3),
          'on ' + this.combatants.getEntity(event)?.name,
          ' expected expiration: ' +
            this.owner.formatTimestamp(
              event.timestamp +
                Number(this.hotTracker._getRapidDiffusionDuration(this.selectedCombatant)),
              3,
            ),
          this.hotTracker.hots[event.targetID][event.ability.guid],
          event,
        );
        break;
      }
      case this.MistsOfLifeAttrib: {
        console.log(
          'Attributed Renewing Mist from Mists of Life at ' +
            this.owner.formatTimestamp(event.timestamp),
          'on ' + this.combatants.getEntity(event)?.name,
          this.hotTracker.hots[event.targetID][event.ability.guid],
        );
        break;
      }
      case this.dancingMistAttrib: {
        console.log(
          'Dancing Mist Renewing Mist at ' + this.owner.formatTimestamp(event.timestamp, 3),
          'on ' + this.combatants.getEntity(event)?.name,
          this.hotTracker.hots[event.targetID][event.ability.guid],
        );
        break;
      }
    }
  }

  private _attributeDancingMistRem(event: ApplyBuffEvent | RefreshBuffEvent) {
    const sourceRem = getSourceRem(event);
    if (sourceRem) {
      //set the data from the sourceRem if we can find it
      const spellID = event.ability.guid;
      const dmHot = this.hotTracker.hots[event.targetID][spellID];
      if (!this.hotTracker.hots[sourceRem.targetID]) {
        return;
      }
      const sourceHot = this.hotTracker.hots[sourceRem.targetID][spellID];
      if (sourceHot) {
        dmHot.attributions = [];
        if (this.hotTracker.fromRapidDiffusion(sourceHot)) {
          this.hotTracker.addAttributionFromApply(this.dmSourceRDAttrib, event);
        } else if (this.hotTracker.fromHardcast(sourceHot)) {
          this.hotTracker.addAttributionFromApply(this.dmSourceHCAttrib, event);
        } else if (this.hotTracker.fromMistsOfLife(sourceHot)) {
          this.hotTracker.addAttributionFromApply(this.dmSourceMoLAttrib, event);
        }

        dmHot.healingAfterOriginalEnd = 0;
        dmHot.maxDuration = sourceHot.maxDuration;
        dmHot.end = sourceHot.end;
        dmHot.originalEnd = sourceHot.originalEnd;
        dmHot.extensions = sourceHot.extensions;
      }
    }
    this.hotTracker.addAttributionFromApply(this.dancingMistAttrib, event);
    dmDebug && this._newReMAttributionLogging(event, this.dancingMistAttrib);
  }

  private _attributeRapidDiffusionRem(event: ApplyBuffEvent | RefreshBuffEvent, hot: Tracker) {
    this.hotTracker.addAttributionFromApply(this.rapidDiffusionAttrib, event);
    if (isFromRapidDiffusionRisingSunKick(event)) {
      this.hotTracker.addAttributionFromApply(this.rdSourceRSKAttrib, event);
    } else if (isFromRapidDiffusionEnvelopingMist(event)) {
      this.hotTracker.addAttributionFromApply(this.rdSourceENVAttrib, event);
    }
    hot.maxDuration = this.hotTracker._getRapidDiffusionMaxDuration(this.selectedCombatant);
    hot.end = hot.originalEnd =
      event.timestamp + Number(this.hotTracker._getRapidDiffusionDuration(this.selectedCombatant));
    rdDebug && this._newReMAttributionLogging(event, this.rapidDiffusionAttrib);
  }
}

export default HotAttributor;
