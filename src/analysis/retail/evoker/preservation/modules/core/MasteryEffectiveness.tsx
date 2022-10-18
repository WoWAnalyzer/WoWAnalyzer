import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbsorbedEvent,
  AnyEvent,
  ApplyBuffEvent,
  CastEvent,
  HasHitpoints,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  ResourceActor,
} from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import HealingValue from 'parser/shared/modules/HealingValue';
import StatTracker from 'parser/shared/modules/StatTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const TEMPORAL_ANOMALY_DURATION_MS = 15000;

type MasteryEvent = {
  sourceEvent: HealEvent | AbsorbedEvent;
  effectiveHealing: number;
  rawMasteryGain: number;
};

type ShieldInfo = {
  event: ApplyBuffEvent | RefreshBuffEvent;
  baseShieldValue: number;
  shieldOfTemporalAnomaly: number;
  hasMasteryBoost: boolean;
  masteryValue: number;
  healing: number;
};

class MasteryEffectiveness extends Analyzer {
  static dependencies = {
    combatant: Combatants,
    statTracker: StatTracker,
  };

  protected combatants!: Combatants;
  protected statTracker!: StatTracker;

  masteryEffectiveHealSpellsCount: number = 0;
  totalHealSpellsCount: number = 0;
  totalHealingEffectedByMastery: number = 0;

  private lastKnownTargetHP = {};
  private prevokerHealth: number = 0;
  private shieldApplications: Map<number, ShieldInfo | null> = new Map();
  shieldOfTemporalAnomaly = 0;

  private spellPowerAtTACastTime = 0;

  totalPossibleAbsorbs = 0;
  totalCalculatedBaseAbsorbs = 0;

  /**
   * @type {number} The total amount of healing done by just the mastery gain. Precisely calculated for every spell.
   */
  totalMasteryHealingDone: number = 0;
  totalMasteryAbsorbDone: number = 0;
  wastedShield = 0;

  masteryHealEvents: MasteryEvent[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT),
      this.onTACast,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER), this.onAbsorbedByPlayer);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.TEMPORAL_ANOMALY_SHIELD),
      this.onShieldApplication,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.TEMPORAL_ANOMALY_SHIELD),
      this.onShieldRefresh,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.TEMPORAL_ANOMALY_SHIELD),
      this.handleRemoveShield,
    );
    this.addEventListener(Events.any, this.onEvent);
  }

  onTACast(event: CastEvent) {
    this.spellPowerAtTACastTime = event.spellPower || 0;
  }

  onEvent(event: AnyEvent) {
    if (HasHitpoints(event)) {
      const unitId = event.resourceActor === ResourceActor.Target ? event.targetID : event.sourceID;
      (this.lastKnownTargetHP as any)[unitId] = event.hitPoints;
    }
  }

  onShieldRefresh(event: RefreshBuffEvent) {
    this.handleRemoveShield(event);
    this.onShieldApplication(event);
  }

  onShieldApplication(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (this.shieldApplications.get(event.targetID)) {
      this.shieldApplications.set(event.targetID, null);
    }

    this.totalPossibleAbsorbs += event.absorb || 0;
    this.totalCalculatedBaseAbsorbs += this.calculateTAShield();

    this.shieldApplications.set(event.targetID, {
      event: event,
      baseShieldValue: this.calculateTAShield(),
      shieldOfTemporalAnomaly: this.shieldOfTemporalAnomaly,
      hasMasteryBoost: this.masteryBoostCheck(event),
      masteryValue: this.statTracker.currentMasteryPercentage,
      healing: 0,
    });
    this.shieldOfTemporalAnomaly = 0;
  }

  masteryBoostCheck(event: ApplyBuffEvent | RefreshBuffEvent) {
    const baseShieldValue = this.calculateTAShield();
    if (event.absorb) {
      if (baseShieldValue < event.absorb) {
        return true;
      }
    }
    return false;
  }

  calculateTAShield() {
    const intellect = this.spellPowerAtTACastTime; //this.statTracker.currentIntellectRating;
    const vers = this.statTracker.currentVersatilityPercentage;

    const baseShielding = intellect * 1.75 * (1 + vers);
    return baseShielding;
  }

  isTargetHealthierThanPlayer(playerHealth: number, targetHealth: number): boolean {
    return playerHealth > targetHealth;
  }

  onHeal(event: HealEvent) {
    this.processHealForMastery(event);
  }
  onCast(event: CastEvent) {
    this.prevokerHealth = event.hitPoints || 0;
  }
  onAbsorbedByPlayer(event: AbsorbedEvent) {
    const info = this.shieldApplications.get(event.targetID);
    if (
      !info ||
      info.event.timestamp > event.timestamp ||
      info.event.timestamp + TEMPORAL_ANOMALY_DURATION_MS < event.timestamp
    ) {
      return;
    }
    info.healing += event.amount;
  }

  processHealForMastery(event: HealEvent) {
    const heal = new HealingValue(event.amount, event.absorbed, event.overheal);
    const targetPlayerHealth = event.hitPoints - event.amount;

    const baseHealing = heal.raw / (1 + this.statTracker.currentMasteryPercentage);
    const rawMasteryGain = heal.raw - baseHealing;
    const actualMasteryHealingDone = Math.max(0, heal.effective - baseHealing);
    this.totalMasteryHealingDone += actualMasteryHealingDone;

    if (this.isTargetHealthierThanPlayer(this.prevokerHealth, targetPlayerHealth)) {
      this.masteryHealEvents.push({
        sourceEvent: event,
        effectiveHealing: heal.effective,
        rawMasteryGain,
      });
    }
  }

  handleRemoveShield(event: RefreshBuffEvent | RemoveBuffEvent) {
    const info = this.shieldApplications.get(event.targetID);

    if (
      !info ||
      info.event.timestamp > event.timestamp ||
      info.event.timestamp + TEMPORAL_ANOMALY_DURATION_MS < event.timestamp
    ) {
      return;
    }
    const shieldAmount = info.event.absorb || 0; // the initial absorb amount from the ApplyBuff/RefreshBuff Event
    // const wasMasteryUsed = (info.healing - info.baseShieldValue > 0) && info.hasMasteryBoost;
    const didShieldConsume = info.healing >= shieldAmount;

    const absorbFromMasteryBonusUsed = Math.max(0, info.healing - info.baseShieldValue);

    if (!didShieldConsume) {
      this.wastedShield += shieldAmount - info.healing;
    }

    this.totalMasteryAbsorbDone += absorbFromMasteryBonusUsed;
  }

  statistic() {
    console.log(`TOTAL CALCULATED BASE ABSORB IS: ${this.totalCalculatedBaseAbsorbs}`);
    console.log(`TOTAL ABSORBS LOGGED IS ${this.totalPossibleAbsorbs}`);
    console.log(`TOTAL MASTERY ABSORB IS ${this.totalMasteryAbsorbDone}`);
    console.log(`TOTAL WASTED ABSORB IS ${this.wastedShield}`);
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(10)}
        category={STATISTIC_CATEGORY.GENERAL}
      >
        <BoringSpellValueText spellId={SPELLS.LIFEBLOOM_HOT_HEAL.id}>
          <ItemHealingDone amount={this.totalMasteryHealingDone} />
        </BoringSpellValueText>
        <BoringSpellValueText spellId={SPELLS.TEMPORAL_ANOMALY_SHIELD.id}>
          <ItemHealingDone amount={this.totalMasteryAbsorbDone} />
        </BoringSpellValueText>
        <BoringSpellValueText spellId={SPELLS.DREAM_BREATH.id}>
          <ItemHealingDone amount={this.wastedShield} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default MasteryEffectiveness;
