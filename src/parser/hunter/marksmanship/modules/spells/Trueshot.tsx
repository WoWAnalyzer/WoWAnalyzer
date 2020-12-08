import React from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { CastEvent, EnergizeEvent } from 'parser/core/Events';
import RapidFire from 'parser/hunter/marksmanship/modules/spells/RapidFire';
import SteadyShot from 'parser/hunter/marksmanship/modules/spells/SteadyShot';
import MarksmanshipFocusCapTracker from 'parser/hunter/marksmanship/modules/resources/MarksmanshipFocusCapTracker';
import { HUNTER_BASE_FOCUS_MAX, MS_BUFFER } from 'parser/hunter/shared/constants';
import { TRUESHOT_FOCUS_INCREASE } from 'parser/hunter/marksmanship/constants';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { formatNumber } from 'common/format';
import ResourceIcon from 'common/ResourceIcon';
import SpellIcon from 'common/SpellIcon';

/**
 * Reduces the cooldown of your Aimed Shot and Rapid Fire by 60%, and causes Aimed Shot to cast 50% faster for 15 sec.
 * While Trueshot is active, you generate 50% additional Focus.
 * Lasts 15 sec.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/9Ljy6fh1TtCDHXVB#fight=2&type=auras&source=25&ability=288613
 */
class Trueshot extends Analyzer {

  static dependencies = {
    rapidFire: RapidFire,
    steadyShot: SteadyShot,
    marksmanshipFocusCapTracker: MarksmanshipFocusCapTracker,
  };

  trueshotCasts = 0;
  aimedShotsPrTS = 0;
  focusGained = 0;
  passiveFocusAttributedToTrueshot = 0;
  possiblePassiveFocusAttributedToTrueshot = 0;
  lastKnownFocusAmount = 0;
  lastCheckedPassiveRegenTimestamp = 0;
  focusAtLastCheck = 0;

  protected rapidFire!: RapidFire;
  protected steadyShot!: SteadyShot;
  protected marksmanshipFocusCapTracker!: MarksmanshipFocusCapTracker;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.AIMED_SHOT), this.onAimedShotCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.TRUESHOT), this.onTrueshotCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.focusCheck);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER), this.focusCheck);
  }

  get averageAimedShots() {
    const averageAimedShots = (this.aimedShotsPrTS / this.trueshotCasts);
    return (isNaN(averageAimedShots) || !isFinite(averageAimedShots)) ? 0 : averageAimedShots;
  }

  get effectiveFocus() {
    return formatNumber(this.steadyShot.additionalFocusFromTrueshot + this.rapidFire.additionalFocusFromTrueshot + this.passiveFocusAttributedToTrueshot);
  }

  get possibleFocus() {
    return formatNumber(this.steadyShot.possibleAdditionalFocusFromTrueshot + this.rapidFire.possibleAdditionalFocusFromTrueshot + this.possiblePassiveFocusAttributedToTrueshot);
  }

  onTrueshotCast(event: CastEvent) {
    this.trueshotCasts += 1;
    this.lastCheckedPassiveRegenTimestamp = event.timestamp;
    const resource = event.classResources?.find(resource => resource.type === RESOURCE_TYPES.FOCUS.id);
    if (!resource) {
      return;
    }
    this.focusAtLastCheck = resource.amount;
  }

  onAimedShotCast() {
    if (this.selectedCombatant.hasBuff(SPELLS.TRUESHOT.id)) {
      this.aimedShotsPrTS += 1;
    }
  }

  focusCheck(event: EnergizeEvent | CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.TRUESHOT.id)) {
      return;
    }
    const resource = event.classResources?.find(resource => resource.type === RESOURCE_TYPES.FOCUS.id);
    if (!resource) {
      return;
    }
    if (event.timestamp >= this.lastCheckedPassiveRegenTimestamp + MS_BUFFER) {
      const timeSinceLastCheck = event.timestamp - this.lastCheckedPassiveRegenTimestamp;
      const possibleTSGainSinceLastCheck = timeSinceLastCheck * this.marksmanshipFocusCapTracker.naturalRegenRate() * (1 - 1 / (1 + TRUESHOT_FOCUS_INCREASE));
      const naturalRegenSinceLastCheck = timeSinceLastCheck * this.marksmanshipFocusCapTracker.naturalRegenRate() - possibleTSGainSinceLastCheck;
      this.possiblePassiveFocusAttributedToTrueshot += possibleTSGainSinceLastCheck;
      if (HUNTER_BASE_FOCUS_MAX - this.focusAtLastCheck > (naturalRegenSinceLastCheck + possibleTSGainSinceLastCheck)) {
        this.passiveFocusAttributedToTrueshot += possibleTSGainSinceLastCheck;
      } else if (HUNTER_BASE_FOCUS_MAX - this.focusAtLastCheck > naturalRegenSinceLastCheck) {
        this.passiveFocusAttributedToTrueshot += HUNTER_BASE_FOCUS_MAX - this.focusAtLastCheck - naturalRegenSinceLastCheck;
      }
      this.lastCheckedPassiveRegenTimestamp = event.timestamp;
      this.focusAtLastCheck = resource.amount;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(1)}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.TRUESHOT}>
          <SpellIcon id={SPELLS.AIMED_SHOT.id} noLink /> {this.averageAimedShots.toFixed(1)} <small>per Trueshot</small>
          <br />
          <ResourceIcon id={RESOURCE_TYPES.FOCUS.id} noLink /> {this.effectiveFocus}/{this.possibleFocus} <small>Focus gained</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Trueshot;
