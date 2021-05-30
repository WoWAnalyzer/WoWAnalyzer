import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import HotTrackerRestoDruid from '../hottracking/HotTrackerRestoDruid';
import ConvokeSpiritsResto from '../../shadowlands/covenants/ConvokeSpiritsResto';
import { LIFEBLOOM_BUFFS, REJUVENATION_BUFFS } from '../../../constants';
import HotTracker, { Attribution } from 'parser/shared/modules/HotTracker';
import { isFromHardcast, isFromOvergrowth } from '../../../normalizers/HotCastLinkNormalizer';

/** Maximum time buffer between a hardcast and applybuff to allow attribution */
const BUFFER_MS = 150;

const DEBUG = true;

/**
 * Many Resto HoTs can be applied from multiple different sources including talents, legendaries,
 * and of course hardcasts. In order to attribute where a HoT came from we have to keep all the
 * possibilities in mind. This analyzer centralizes that process.
 *
 * This modules functioning relies on normalizers that ensure:
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
  hasMemoryOfTheMotherTree: boolean;
  hasVisionOfUnendingGrowth: boolean;
  hasLycarasFleetingGlimpse: boolean;

  overgrowthAttrib = HotTracker.getNewAttribution('Overgrowth');
  memoryOfTheMotherTreeAttrib = HotTracker.getNewAttribution('Memory of the Mother Tree');
  visionOfUnendingGrowthAttrib = HotTracker.getNewAttribution('Vision of Unending Growth');
  // Convoke handled separately in Resto Convoke module
  lycarasFleetingGlimpseAttrib = HotTracker.getNewAttribution("Lycara's Fleeting Glimpse");

  constructor(options: Options) {
    super(options);

    this.hasOvergrowth = this.selectedCombatant.hasTalent(SPELLS.OVERGROWTH_TALENT.id);
    this.hasMemoryOfTheMotherTree = this.selectedCombatant.hasLegendaryByBonusID(
      SPELLS.MEMORY_OF_THE_MOTHER_TREE.bonusID,
    );
    this.hasVisionOfUnendingGrowth = this.selectedCombatant.hasLegendaryByBonusID(
      SPELLS.VISION_OF_UNENDING_GROWTH.bonusID,
    );
    this.hasLycarasFleetingGlimpse = this.selectedCombatant.hasLegendaryByBonusID(
      SPELLS.LYCARAS_FLEETING_GLIMPSE.bonusID,
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
      this._logAttrib(event, 'Hardcast');
    } else if (this.convokeSpirits.active && this.convokeSpirits.isConvoking()) {
      this._logAttrib(event, this.convokeSpirits.currentConvokeAttribution);
    } else if (isFromOvergrowth(event)) {
      this.hotTracker.addAttributionFromApply(this.overgrowthAttrib, event);
      this._logAttrib(event, this.overgrowthAttrib);
    } else if (
      this.hasMemoryOfTheMotherTree &&
      this.selectedCombatant.hasBuff(SPELLS.MEMORY_OF_THE_MOTHER_TREE.id, event.timestamp, BUFFER_MS)
    ) {
      this.hotTracker.addAttributionFromApply(this.memoryOfTheMotherTreeAttrib, event);
      this._logAttrib(event, this.memoryOfTheMotherTreeAttrib);
    } else if (this.hasVisionOfUnendingGrowth) {
      this.hotTracker.addAttributionFromApply(this.visionOfUnendingGrowthAttrib, event);
      this._logAttrib(event, this.visionOfUnendingGrowthAttrib);
    } else {
      this._logAttrib(event, undefined);
    }
  }

  onApplyRegrowth(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (event.prepull || isFromHardcast(event)) {
      this._logAttrib(event, 'Hardcast');
    } else if (this.convokeSpirits.active && this.convokeSpirits.isConvoking()) {
      this._logAttrib(event, this.convokeSpirits.currentConvokeAttribution);
    } else if (isFromOvergrowth(event)) {
      this.hotTracker.addAttributionFromApply(this.overgrowthAttrib, event);
      this._logAttrib(event, this.overgrowthAttrib);
    } else if (
      this.hasMemoryOfTheMotherTree &&
      this.selectedCombatant.hasBuff(SPELLS.MEMORY_OF_THE_MOTHER_TREE.id, event.timestamp, BUFFER_MS)
    ) {
      this.hotTracker.addAttributionFromApply(this.memoryOfTheMotherTreeAttrib, event);
      this._logAttrib(event, this.memoryOfTheMotherTreeAttrib);
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
      this.hasMemoryOfTheMotherTree &&
      this.selectedCombatant.hasBuff(SPELLS.MEMORY_OF_THE_MOTHER_TREE.id, event.timestamp, BUFFER_MS)
    ) {
      this.memoryOfTheMotherTreeAttrib.healing += event.amount + (event.absorbed || 0);
    }
  }

  onApplyWg(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (event.prepull || isFromHardcast(event)) {
      this._logAttrib(event, 'Hardcast');
      // don't clear pending because it hits many targets
    } else if (this.convokeSpirits.active && this.convokeSpirits.isConvoking()) {
      this._logAttrib(event, this.convokeSpirits.currentConvokeAttribution);
    } else if (isFromOvergrowth(event)) {
      this.hotTracker.addAttributionFromApply(this.overgrowthAttrib, event);
      this._logAttrib(event, this.overgrowthAttrib);
    } else if (this.hasLycarasFleetingGlimpse) {
      this.hotTracker.addAttributionFromApply(this.lycarasFleetingGlimpseAttrib, event);
      this._logAttrib(event, this.lycarasFleetingGlimpseAttrib);
    } else {
      this._logAttrib(event, undefined);
    }
  }

  onApplyLb(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (event.prepull || isFromHardcast(event)) {
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
