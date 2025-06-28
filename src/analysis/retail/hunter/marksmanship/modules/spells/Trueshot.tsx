import { TRUESHOT_FOCUS_INCREASE } from 'analysis/retail/hunter/marksmanship/constants';
import MarksmanshipFocusCapTracker from 'analysis/retail/hunter/marksmanship/modules/resources/MarksmanshipFocusCapTracker';
import RapidFire from 'analysis/retail/hunter/marksmanship/modules/spells/RapidFire';
import SteadyShot from 'analysis/retail/hunter/marksmanship/modules/spells/SteadyShot';
import { HUNTER_BASE_FOCUS_MAX, MS_BUFFER_100 } from 'analysis/retail/hunter/shared/constants';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_HUNTER } from 'common/TALENTS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ResourceIcon } from 'interface';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, ResourceChangeEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Reduces the cooldown of your Aimed Shot and Rapid Fire by 70%, and causes Aimed Shot to cast 50% faster and cost 50% less focus for 15 sec.
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
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_HUNTER.AIMED_SHOT_TALENT),
      this.onAimedShotCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.TRUESHOT),
      this.onTrueshotCast,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.focusCheck);
    this.addEventListener(Events.resourcechange.by(SELECTED_PLAYER), this.focusCheck);
  }

  get averageAimedShots() {
    const averageAimedShots = this.aimedShotsPrTS / this.trueshotCasts;
    return isNaN(averageAimedShots) || !isFinite(averageAimedShots) ? 0 : averageAimedShots;
  }

  get effectiveFocus() {
    return formatNumber(
      this.steadyShot.additionalFocusFromTrueshot +
        this.rapidFire.additionalFocusFromTrueshot +
        this.passiveFocusAttributedToTrueshot,
    );
  }

  get possibleFocus() {
    return formatNumber(
      this.steadyShot.possibleAdditionalFocusFromTrueshot +
        this.rapidFire.possibleAdditionalFocusFromTrueshot +
        this.possiblePassiveFocusAttributedToTrueshot,
    );
  }

  onTrueshotCast(event: CastEvent) {
    this.trueshotCasts += 1;
    this.lastCheckedPassiveRegenTimestamp = event.timestamp;
    const resource = event.classResources?.find(
      (resource) => resource.type === RESOURCE_TYPES.FOCUS.id,
    );
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

  focusCheck(event: ResourceChangeEvent | CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.TRUESHOT.id)) {
      return;
    }
    const resource = event.classResources?.find(
      (resource) => resource.type === RESOURCE_TYPES.FOCUS.id,
    );
    if (!resource) {
      return;
    }
    if (event.timestamp >= this.lastCheckedPassiveRegenTimestamp + MS_BUFFER_100) {
      const timeSinceLastCheck = event.timestamp - this.lastCheckedPassiveRegenTimestamp;
      const possibleTSGainSinceLastCheck =
        timeSinceLastCheck *
        this.marksmanshipFocusCapTracker.naturalRegenRate() *
        (1 - 1 / (1 + TRUESHOT_FOCUS_INCREASE));
      const naturalRegenSinceLastCheck =
        timeSinceLastCheck * this.marksmanshipFocusCapTracker.naturalRegenRate() -
        possibleTSGainSinceLastCheck;
      this.possiblePassiveFocusAttributedToTrueshot += possibleTSGainSinceLastCheck;
      if (
        HUNTER_BASE_FOCUS_MAX - this.focusAtLastCheck >
        naturalRegenSinceLastCheck + possibleTSGainSinceLastCheck
      ) {
        this.passiveFocusAttributedToTrueshot += possibleTSGainSinceLastCheck;
      } else if (HUNTER_BASE_FOCUS_MAX - this.focusAtLastCheck > naturalRegenSinceLastCheck) {
        this.passiveFocusAttributedToTrueshot +=
          HUNTER_BASE_FOCUS_MAX - this.focusAtLastCheck - naturalRegenSinceLastCheck;
      }
      this.lastCheckedPassiveRegenTimestamp = event.timestamp;
      this.focusAtLastCheck = resource.amount;
    }
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.OPTIONAL(1)} size="flexible">
        <BoringSpellValueText spell={SPELLS.TRUESHOT}>
          <SpellIcon spell={TALENTS_HUNTER.AIMED_SHOT_TALENT} noLink />{' '}
          {this.averageAimedShots.toFixed(1)} <small>per Trueshot</small>
          <br />
          <ResourceIcon id={RESOURCE_TYPES.FOCUS.id} noLink /> {this.effectiveFocus}/
          {this.possibleFocus} <small>Focus gained</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Trueshot;
