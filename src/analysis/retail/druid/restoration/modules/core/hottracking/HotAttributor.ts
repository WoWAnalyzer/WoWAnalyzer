import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import HotTracker, { Attribution } from 'parser/shared/modules/HotTracker';

import { LIFEBLOOM_BUFFS, REJUVENATION_BUFFS } from '../../../constants';
import { isFromHardcast, isFromOvergrowth } from '../../../normalizers/CastLinkNormalizer';
import ConvokeSpiritsResto from 'analysis/retail/druid/restoration/modules/spells/ConvokeSpiritsResto';
import HotTrackerRestoDruid from '../hottracking/HotTrackerRestoDruid';
import { TALENTS_DRUID } from 'common/TALENTS';

/** Maximum time buffer between a hardcast and applybuff to allow attribution */
const BUFFER_MS = 150;

const DEBUG = false;

/**
 * Many Resto HoTs can be applied from multiple different sources including talents and hardcasts.
 * In order to attribute where a HoT came from we have to keep all the
 * possibilities in mind. This analyzer centralizes that process.
 *
 * This module's functioning relies on normalizers that ensure:
 * * HoT's applybuff/refreshbuff will always link to the cast that caused it (if present)
 */
class HotAttributor extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerRestoDruid,
    convokeSpirits: ConvokeSpiritsResto,
  };

  hotTracker!: HotTrackerRestoDruid;
  convokeSpirits!: ConvokeSpiritsResto;

  hasOvergrowth: boolean;
  hasPowerOfTheArchdruid: boolean;
  hasLuxuriantSoil: boolean;

  // track hardcast attributions for mana effic tracking
  rejuvHardcastAttrib = HotTracker.getNewAttribution('Rejuvenation Hardcast');
  regrowthHardcastAttrib = HotTracker.getNewAttribution('Regrowth Hardcast');
  wgHardcastAttrib = HotTracker.getNewAttribution('Wild Growth Hardcast');
  lbHardcastAttrib = HotTracker.getNewAttribution('Lifebloom Hardcast');
  // track various talent attributions
  overgrowthAttrib = HotTracker.getNewAttribution('Overgrowth');
  powerOfTheArchdruid = HotTracker.getNewAttribution('PowerOfTheArchdruid');
  luxuriantSoilAttrib = HotTracker.getNewAttribution('LuxuriantSoil');
  // Convoke handled separately in Resto Convoke module

  constructor(options: Options) {
    super(options);

    this.hasOvergrowth = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.OVERGROWTH_RESTORATION_TALENT,
    );
    this.hasPowerOfTheArchdruid = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.POWER_OF_THE_ARCHDRUID_RESTORATION_TALENT,
    );
    this.hasLuxuriantSoil = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.LUXURIANT_SOIL_RESTORATION_TALENT,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(REJUVENATION_BUFFS),
      this.onApplyRejuv,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH),
      this.onApplyRegrowth,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.WILD_GROWTH),
      this.onApplyWg,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(LIFEBLOOM_BUFFS),
      this.onApplyLb,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(REJUVENATION_BUFFS),
      this.onApplyRejuv,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH),
      this.onApplyRegrowth,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.WILD_GROWTH),
      this.onApplyWg,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(LIFEBLOOM_BUFFS),
      this.onApplyLb,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH),
      this.onHealRegrowth,
    );
  }

  onApplyRejuv(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (event.prepull || isFromHardcast(event)) {
      this.hotTracker.addAttributionFromApply(this.rejuvHardcastAttrib, event);
      this._logAttrib(event, 'Hardcast');
    } else if (this.convokeSpirits.active && this.convokeSpirits.isConvoking()) {
      // convoke module adds the attribution
      this._logAttrib(event, this.convokeSpirits.currentConvokeAttribution);
    } else if (isFromOvergrowth(event)) {
      this.hotTracker.addAttributionFromApply(this.overgrowthAttrib, event);
      this._logAttrib(event, this.overgrowthAttrib);
    } else if (
      this.hasPowerOfTheArchdruid &&
      this.selectedCombatant.hasBuff(SPELLS.POWER_OF_THE_ARCHDRUID.id, event.timestamp, BUFFER_MS)
    ) {
      this.hotTracker.addAttributionFromApply(this.powerOfTheArchdruid, event);
      this._logAttrib(event, this.powerOfTheArchdruid);
    } else if (this.hasLuxuriantSoil) {
      this.hotTracker.addAttributionFromApply(this.luxuriantSoilAttrib, event);
      this._logAttrib(event, this.luxuriantSoilAttrib);
    } else {
      this._logAttrib(event, undefined);
    }
  }

  onApplyRegrowth(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (event.prepull || isFromHardcast(event)) {
      this.hotTracker.addAttributionFromApply(this.regrowthHardcastAttrib, event);
      this._logAttrib(event, 'Hardcast');
    } else if (this.convokeSpirits.active && this.convokeSpirits.isConvoking()) {
      // convoke module adds the attribution
      this._logAttrib(event, this.convokeSpirits.currentConvokeAttribution);
    } else if (isFromOvergrowth(event)) {
      this.hotTracker.addAttributionFromApply(this.overgrowthAttrib, event);
      this._logAttrib(event, this.overgrowthAttrib);
    } else if (
      this.hasPowerOfTheArchdruid &&
      this.selectedCombatant.hasBuff(SPELLS.POWER_OF_THE_ARCHDRUID.id, event.timestamp, BUFFER_MS)
    ) {
      this.hotTracker.addAttributionFromApply(this.powerOfTheArchdruid, event);
      this._logAttrib(event, this.powerOfTheArchdruid);
    } else {
      this._logAttrib(event, undefined);
    }
  }

  // the direct heal from regrowth hits before the buff application -
  // this ensures the direct heal is also attributed
  onHealRegrowth(event: HealEvent) {
    if (
      !event.tick &&
      !isFromHardcast(event) &&
      !(this.convokeSpirits.active && this.convokeSpirits.isConvoking()) &&
      this.hasPowerOfTheArchdruid &&
      this.selectedCombatant.hasBuff(SPELLS.POWER_OF_THE_ARCHDRUID.id, event.timestamp, BUFFER_MS)
    ) {
      this.powerOfTheArchdruid.healing += event.amount + (event.absorbed || 0);
    } else if (isFromHardcast(event)) {
      this.regrowthHardcastAttrib.healing += event.amount + (event.absorbed || 0);
    }
  }

  onApplyWg(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (event.prepull || isFromHardcast(event)) {
      this.hotTracker.addAttributionFromApply(this.wgHardcastAttrib, event);
      this._logAttrib(event, 'Hardcast');
      // don't clear pending because it hits many targets
    } else if (this.convokeSpirits.active && this.convokeSpirits.isConvoking()) {
      // convoke module adds the attribution
      this._logAttrib(event, this.convokeSpirits.currentConvokeAttribution);
    } else if (isFromOvergrowth(event)) {
      this.hotTracker.addAttributionFromApply(this.overgrowthAttrib, event);
      this._logAttrib(event, this.overgrowthAttrib);
    } else {
      this._logAttrib(event, undefined);
    }
  }

  onApplyLb(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (event.prepull || isFromHardcast(event)) {
      this.hotTracker.addAttributionFromApply(this.lbHardcastAttrib, event);
      this._logAttrib(event, 'Hardcast');
    } else if (isFromOvergrowth(event)) {
      this.hotTracker.addAttributionFromApply(this.overgrowthAttrib, event);
      this._logAttrib(event, this.overgrowthAttrib);
    } else {
      this._logAttrib(event, undefined);
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
      DEBUG &&
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
