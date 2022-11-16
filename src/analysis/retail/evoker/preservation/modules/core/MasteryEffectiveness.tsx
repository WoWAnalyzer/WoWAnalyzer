import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbsorbedEvent,
  ApplyBuffEvent,
  CastEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import HealingValue from 'parser/shared/modules/HealingValue';
import StatTracker from 'parser/shared/modules/StatTracker';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const TEMPORAL_ANOMALY_DURATION_MS = 15000;
const TWIN_GUARDIAN_DURATION_MS = 5000;
const TEMPORAL_ANOMALY_SHIELD_COEFF = 1.75;
const TWIN_GUARDIAN_SHIELD_COEFF = 0.3;

const SHIELD_DURATIONS_MAP = new Map([
  [SPELLS.TEMPORAL_ANOMALY_SHIELD.id, TEMPORAL_ANOMALY_DURATION_MS],
  [SPELLS.TWIN_GUARDIAN_SHIELD.id, TWIN_GUARDIAN_DURATION_MS],
]);

const SHIELD_DURATIONS = Object.fromEntries(SHIELD_DURATIONS_MAP);

type MasteryEvent = {
  sourceEvent: HealEvent | AbsorbedEvent;
  effectiveHealing: number;
  rawMasteryGain: number;
};

type ShieldInfo = {
  event: ApplyBuffEvent | RefreshBuffEvent;
  baseShieldValue: number;
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

  totalHealingEffectedByMastery: number = 0;

  private prevokerHealthPercent: number = 0;
  private prevokerMaxHealth: number = 0;
  private anomalyShieldApplications: Map<number, ShieldInfo | null> = new Map();
  private twinGuardianShieldApplications: Map<number, ShieldInfo | null> = new Map();

  totalPossibleAbsorbs = 0;
  totalCalculatedBaseAbsorbs = 0;
  totalEventsAffectedByMastery: number = 0;
  totalEvents: number = 0;
  totalMasteryHealingDone: number = 0;
  wastedTAShield: number = 0;
  totalTAShield: number = 0;
  wastedTGShield: number = 0;
  totalTGShield: number = 0;

  masteryHealEvents: MasteryEvent[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER), this.onAbsorbedByPlayer);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.TEMPORAL_ANOMALY_SHIELD),
      this.onAnomalyShieldApplication,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.TWIN_GUARDIAN_SHIELD),
      this.onTwinGuardianShieldApplication,
    );
    this.addEventListener(
      Events.refreshbuff
        .by(SELECTED_PLAYER)
        .spell([SPELLS.TEMPORAL_ANOMALY_SHIELD, SPELLS.TWIN_GUARDIAN_SHIELD]),
      this.onShieldRefresh,
    );
    this.addEventListener(
      Events.removebuff
        .by(SELECTED_PLAYER)
        .spell([SPELLS.TEMPORAL_ANOMALY_SHIELD, SPELLS.TWIN_GUARDIAN_SHIELD]),
      this.handleRemoveShield,
    );
  }

  isEventAbilityAnomaly(spellId: number) {
    return spellId === SPELLS.TEMPORAL_ANOMALY_SHIELD.id;
  }

  isEventAbilityTwinGuardian(spellId: number) {
    return spellId === SPELLS.TWIN_GUARDIAN_SHIELD.id;
  }

  onShieldRefresh(event: RefreshBuffEvent) {
    this.handleRemoveShield(event);
    if (this.isEventAbilityTwinGuardian(event.ability.guid)) {
      this.onTwinGuardianShieldApplication(event);
    }
    if (this.isEventAbilityAnomaly(event.ability.guid)) {
      this.onAnomalyShieldApplication(event);
    }
  }

  onTwinGuardianShieldApplication(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (this.twinGuardianShieldApplications.get(event.targetID)) {
      this.twinGuardianShieldApplications.set(event.targetID, null);
    }

    this.totalPossibleAbsorbs += event.absorb || 0;
    this.totalCalculatedBaseAbsorbs += this.calculateShield(event);

    this.twinGuardianShieldApplications.set(event.targetID, {
      event: event,
      baseShieldValue: this.calculateShield(event),
      hasMasteryBoost: this.masteryBoostCheck(event),
      masteryValue: this.statTracker.currentMasteryPercentage,
      healing: 0,
    });
  }

  onAnomalyShieldApplication(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (this.anomalyShieldApplications.get(event.targetID)) {
      this.anomalyShieldApplications.set(event.targetID, null);
    }
    this.totalPossibleAbsorbs += event.absorb || 0;
    console.log('Temporal anomaly sheild applied: ' + event.absorb);
    this.totalCalculatedBaseAbsorbs += this.calculateShield(event);

    this.anomalyShieldApplications.set(event.targetID, {
      event: event,
      baseShieldValue: this.calculateShield(event),
      hasMasteryBoost: this.masteryBoostCheck(event),
      masteryValue: this.statTracker.currentMasteryPercentage,
      healing: 0,
    });
  }

  masteryBoostCheck(event: ApplyBuffEvent | RefreshBuffEvent) {
    const baseShieldValue = this.calculateShield(event);
    if (event.absorb) {
      if (baseShieldValue < event.absorb) {
        return true;
      }
    }
    return false;
  }
  //TODO -- THESE CALCULATIONS ARE WRONG UNTIL ALL THE NEW RAID BUFFS ARE ADDED AND INCORPORATED INTO STATTRACKER
  calculateShield(event: ApplyBuffEvent | RefreshBuffEvent) {
    let baseShielding = 0;
    const vers = this.statTracker.currentVersatilityPercentage;
    if (this.isEventAbilityAnomaly(event.ability.guid)) {
      const intellect = this.statTracker.currentIntellectRating;
      baseShielding = intellect * TEMPORAL_ANOMALY_SHIELD_COEFF * (1 + vers);
    }

    if (this.isEventAbilityTwinGuardian(event.ability.guid)) {
      const initialShieldAmount = this.prevokerMaxHealth * TWIN_GUARDIAN_SHIELD_COEFF;
      const versAddedShield = this.prevokerMaxHealth * TWIN_GUARDIAN_SHIELD_COEFF * vers;
      baseShielding = initialShieldAmount + versAddedShield;
    }
    return Math.round(baseShielding);
  }

  isTargetHealthierThanPlayer(playerHealth: number, targetHealth: number): boolean {
    return playerHealth >= targetHealth;
  }

  onHeal(event: HealEvent) {
    this.totalEvents += 1;
    this.processHealForMastery(event);
  }
  onCast(event: CastEvent) {
    this.prevokerMaxHealth = event.maxHitPoints || 0;
    this.prevokerHealthPercent = ((event.hitPoints || 0) / (event.maxHitPoints || 0)) * 100;
  }
  onAbsorbedByPlayer(event: AbsorbedEvent) {
    let info;
    if (this.isEventAbilityAnomaly(event.ability.guid)) {
      info = this.anomalyShieldApplications.get(event.targetID);
    }
    if (this.isEventAbilityTwinGuardian(event.ability.guid)) {
      info = this.twinGuardianShieldApplications.get(event.targetID);
    }
    const shieldDurationMS = SHIELD_DURATIONS[event.ability.guid];

    if (
      !info ||
      info.event.timestamp > event.timestamp ||
      info.event.timestamp + shieldDurationMS < event.timestamp
    ) {
      return;
    }
    info.healing += event.amount;
  }

  processHealForMastery(event: HealEvent) {
    const heal = new HealingValue(event.amount, event.absorbed, event.overheal);
    const targetPlayerHealthPercent = ((event.hitPoints - event.amount) / event.maxHitPoints) * 100;

    const baseHealing = heal.raw / (1 + this.statTracker.currentMasteryPercentage);
    const rawMasteryGain = heal.raw - baseHealing;
    const actualMasteryHealingDone = Math.max(0, heal.effective - baseHealing);
    this.totalMasteryHealingDone += actualMasteryHealingDone;

    if (this.isTargetHealthierThanPlayer(this.prevokerHealthPercent, targetPlayerHealthPercent)) {
      this.totalEventsAffectedByMastery += 1;
      this.masteryHealEvents.push({
        sourceEvent: event,
        effectiveHealing: heal.effective,
        rawMasteryGain,
      });
    }
  }

  handleRemoveShield(event: RefreshBuffEvent | RemoveBuffEvent) {
    let info;
    if (this.isEventAbilityAnomaly(event.ability.guid)) {
      info = this.anomalyShieldApplications.get(event.targetID);
    }
    if (this.isEventAbilityTwinGuardian(event.ability.guid)) {
      info = this.twinGuardianShieldApplications.get(event.targetID);
    }
    const shieldDurationMS = SHIELD_DURATIONS[event.ability.guid];
    const isTAShield = event.ability.guid === SPELLS.TEMPORAL_ANOMALY_SHIELD.id;

    if (!info) {
      return;
    }

    const shieldAmount = info.event.absorb || 0; // the initial absorb amount from the ApplyBuff/RefreshBuff Event
    const didShieldConsume = info.healing >= shieldAmount;
    const absorbFromMasteryBonusUsed = Math.max(0, info.healing - info.baseShieldValue);

    if (
      info.event.timestamp > event.timestamp ||
      info.event.timestamp + shieldDurationMS < event.timestamp ||
      !didShieldConsume
    ) {
      const shieldWasted = shieldAmount - info.healing;
      if (isTAShield) {
        this.wastedTAShield += shieldWasted;
      } else {
        this.wastedTGShield += shieldWasted;
      }
    }

    if (isTAShield) {
      this.totalTAShield += shieldAmount;
    } else {
      this.totalTGShield += shieldAmount;
    }

    this.totalMasteryHealingDone += absorbFromMasteryBonusUsed;
  }
  get percentOfHealingAffectedByMastery() {
    return this.totalEventsAffectedByMastery / this.totalEvents;
  }

  get wastedTemporalAnomalyShield() {
    return this.wastedTAShield;
  }

  get totalTemporalAnomalyShield() {
    return this.totalTAShield;
  }

  get wastedTwinGuardianShield() {
    return this.wastedTGShield;
  }

  get totalTwinGuardianShield() {
    return this.totalTGShield;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(10)}
        category={STATISTIC_CATEGORY.GENERAL}
        tooltip={
          <>
            This does not curently account for the mastery benefit gained from shields like{' '}
            <SpellLink id={TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT.id} /> and{' '}
            <SpellLink id={TALENTS_EVOKER.TWIN_GUARDIAN_TALENT.id} />
          </>
        }
      >
        <div className="pad">
          <label>
            <SpellLink id={SPELLS.MASTERY_LIFEBINDER.id} />
          </label>
          <div className="value">
            {formatPercentage(this.percentOfHealingAffectedByMastery)}%
            <small> of Healing Affected</small>
          </div>
        </div>
      </Statistic>
    );
  }
}

export default MasteryEffectiveness;
