import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import HotTracker, { Attribution } from 'parser/shared/modules/HotTracker';

import { LIFEBLOOM_BUFFS, lifebloomSpell, REJUVENATION_BUFFS } from '../../../constants';
import { isFromHardcast, isFromOvergrowth } from '../../../normalizers/CastLinkNormalizer';
import ConvokeSpiritsResto from 'analysis/retail/druid/restoration/modules/spells/ConvokeSpiritsResto';
import HotTrackerRestoDruid from '../hottracking/HotTrackerRestoDruid';
import { TALENTS_DRUID } from 'common/TALENTS';
import Combatants from 'parser/shared/modules/Combatants';
import { isConvoking } from 'analysis/retail/druid/shared/spells/ConvokeSpirits';

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
    combatants: Combatants,
    hotTracker: HotTrackerRestoDruid,
    convokeSpirits: ConvokeSpiritsResto,
  };

  combatants!: Combatants;
  hotTracker!: HotTrackerRestoDruid;
  convokeSpirits!: ConvokeSpiritsResto;

  hasOvergrowth: boolean;
  hasPowerOfTheArchdruid: boolean;
  hasRampantGrowth: boolean;
  hasConvoke: boolean;

  /** Special tracker to differentiate PotA procs during Convoke.
   *  We arbitrarily call the first Regrowth hit the 'direct' one, and follow-on ones
   *  are PotA or RG, depending on what applies.
   *  We expect both a buff application and a direct heal, we'll track both  */
  lastConvokeRejuvOrRegrowthBuffTimestamp: number | undefined;
  lastRegrowthDirectHealTimestamp: number | undefined;

  // track hardcast attributions for mana effic tracking
  rejuvHardcastAttrib = HotTracker.getNewAttribution('Rejuvenation Hardcast');
  regrowthHardcastAttrib = HotTracker.getNewAttribution('Regrowth Hardcast');
  wgHardcastAttrib = HotTracker.getNewAttribution('Wild Growth Hardcast');
  lbHardcastAttrib = HotTracker.getNewAttribution('Lifebloom Hardcast');
  // track various talent attributions
  overgrowthAttrib = HotTracker.getNewAttribution('Overgrowth');
  powerOfTheArchdruidRejuvAttrib = HotTracker.getNewAttribution('PowerOfTheArchdruid-Rejuv');
  powerOfTheArchdruidRegrowthAttrib = HotTracker.getNewAttribution('PowerOfTheArchdruid-Regrowth');
  rampantGrowthAttrib = HotTracker.getNewAttribution('RampantGrowth');
  // Convoke handled separately in Resto Convoke module

  constructor(options: Options) {
    super(options);

    this.hasOvergrowth = this.selectedCombatant.hasTalent(TALENTS_DRUID.OVERGROWTH_TALENT);
    this.hasPowerOfTheArchdruid = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.POWER_OF_THE_ARCHDRUID_TALENT,
    );
    this.hasRampantGrowth = this.selectedCombatant.hasTalent(TALENTS_DRUID.RAMPANT_GROWTH_TALENT);
    this.hasConvoke = this.selectedCombatant.hasTalent(TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT);

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
    const possiblePota =
      this.hasPowerOfTheArchdruid &&
      this.selectedCombatant.hasBuff(SPELLS.POWER_OF_THE_ARCHDRUID.id, event.timestamp, BUFFER_MS);
    if (event.prepull || isFromHardcast(event)) {
      this.hotTracker.addAttributionFromApply(this.rejuvHardcastAttrib, event);
      this._logAttrib(event, 'Hardcast');
    } else if (this.convokeSpirits.active && isConvoking(this.selectedCombatant)) {
      // if we have PotA buff and this isn't the first Rejuv in sequence within buffer - also attribute to PotA
      if (
        possiblePota &&
        this.lastConvokeRejuvOrRegrowthBuffTimestamp &&
        this.lastConvokeRejuvOrRegrowthBuffTimestamp + BUFFER_MS >= event.timestamp
      ) {
        this.hotTracker.addAttributionFromApply(this.powerOfTheArchdruidRejuvAttrib, event);
        this._logAttrib(event, this.powerOfTheArchdruidRejuvAttrib);
      }
      this.lastConvokeRejuvOrRegrowthBuffTimestamp = event.timestamp;
      // convoke module adds the attribution for Convoke
      this._logAttrib(event, this.convokeSpirits.currentConvokeAttribution);
    } else if (isFromOvergrowth(event)) {
      this.hotTracker.addAttributionFromApply(this.overgrowthAttrib, event);
      this._logAttrib(event, this.overgrowthAttrib);
    } else if (possiblePota) {
      this.hotTracker.addAttributionFromApply(this.powerOfTheArchdruidRejuvAttrib, event);
      this._logAttrib(event, this.powerOfTheArchdruidRejuvAttrib);
    } else {
      this._logAttrib(event, undefined);
    }
  }

  onApplyRegrowth(event: ApplyBuffEvent | RefreshBuffEvent) {
    const possiblePota =
      this.hasPowerOfTheArchdruid &&
      this.selectedCombatant.hasBuff(SPELLS.POWER_OF_THE_ARCHDRUID.id, event.timestamp, BUFFER_MS);
    const possibleRg =
      this.hasRampantGrowth &&
      this.combatants
        .getEntity(event)
        ?.hasBuff(
          lifebloomSpell(this.selectedCombatant).id,
          undefined,
          undefined,
          undefined,
          this.selectedCombatant.id,
        );
    if (event.prepull || isFromHardcast(event)) {
      this.hotTracker.addAttributionFromApply(this.regrowthHardcastAttrib, event);
      this._logAttrib(event, 'Hardcast');
    } else if (this.convokeSpirits.active && isConvoking(this.selectedCombatant)) {
      // could possible also be due to RG or PotA
      if (possibleRg) {
        this.hotTracker.addAttributionFromApply(this.rampantGrowthAttrib, event);
        this._logAttrib(event, this.rampantGrowthAttrib);
      } else if (
        possiblePota &&
        this.lastConvokeRejuvOrRegrowthBuffTimestamp &&
        this.lastConvokeRejuvOrRegrowthBuffTimestamp + BUFFER_MS >= event.timestamp
      ) {
        this.hotTracker.addAttributionFromApply(this.powerOfTheArchdruidRegrowthAttrib, event);
        this._logAttrib(event, this.powerOfTheArchdruidRegrowthAttrib);
      }
      if (!possibleRg) {
        this.lastConvokeRejuvOrRegrowthBuffTimestamp = event.timestamp;
      }
      // convoke module adds the attribution for Convoke
      this._logAttrib(event, this.convokeSpirits.currentConvokeAttribution);
    } else if (isFromOvergrowth(event)) {
      this.hotTracker.addAttributionFromApply(this.overgrowthAttrib, event);
      this._logAttrib(event, this.overgrowthAttrib);
    } else if (possibleRg) {
      this.hotTracker.addAttributionFromApply(this.rampantGrowthAttrib, event);
      this._logAttrib(event, this.rampantGrowthAttrib);
    } else if (possiblePota) {
      this.hotTracker.addAttributionFromApply(this.powerOfTheArchdruidRegrowthAttrib, event);
      this._logAttrib(event, this.powerOfTheArchdruidRegrowthAttrib);
    } else {
      this._logAttrib(event, undefined);
    }
  }

  // HotTracker attributes only ticks - must attribute the direct Regrowth heal seperately
  onHealRegrowth(event: HealEvent) {
    if (event.tick) {
      return;
    }
    const effectiveHeal = event.amount + (event.absorbed || 0);
    const possiblePota =
      this.hasPowerOfTheArchdruid &&
      this.selectedCombatant.hasBuff(SPELLS.POWER_OF_THE_ARCHDRUID.id, event.timestamp, BUFFER_MS);
    if (isFromHardcast(event)) {
      this.regrowthHardcastAttrib.healing += effectiveHeal;
      this._logAttrib(event, this.regrowthHardcastAttrib);
    } else if (this.convokeSpirits.active && isConvoking(this.selectedCombatant)) {
      if (
        possiblePota &&
        this.lastRegrowthDirectHealTimestamp &&
        this.lastRegrowthDirectHealTimestamp + BUFFER_MS >= event.timestamp
      ) {
        this.powerOfTheArchdruidRegrowthAttrib.healing += effectiveHeal;
        this._logAttrib(event, this.powerOfTheArchdruidRegrowthAttrib);
      }
      this.lastRegrowthDirectHealTimestamp = event.timestamp;
      // convoke module adds the attribution for Convoke
      this._logAttrib(event, this.convokeSpirits.currentConvokeAttribution);
    } else if (possiblePota) {
      this.powerOfTheArchdruidRegrowthAttrib.healing += effectiveHeal;
      this._logAttrib(event, this.powerOfTheArchdruidRegrowthAttrib);
    } else {
      this._logAttrib(event, undefined);
    }
  }

  onApplyWg(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (event.prepull || isFromHardcast(event)) {
      this.hotTracker.addAttributionFromApply(this.wgHardcastAttrib, event);
      this._logAttrib(event, 'Hardcast');
      // don't clear pending because it hits many targets
    } else if (this.convokeSpirits.active && isConvoking(this.selectedCombatant)) {
      // convoke module adds the attribution for Convoke
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

  _logAttrib(
    event: ApplyBuffEvent | RefreshBuffEvent | HealEvent,
    attrib: Attribution | string | undefined,
  ) {
    if (attrib === undefined) {
      console.warn(
        'Could not attribute ' +
          event.ability.name +
          ' ' +
          event.type +
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
            ' ' +
            event.type +
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
