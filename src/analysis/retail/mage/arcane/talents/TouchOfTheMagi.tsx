import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  DamageEvent,
  ApplyDebuffEvent,
  RemoveDebuffEvent,
  ResourceChangeEvent,
  GetRelatedEvent,
  GetRelatedEvents,
} from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import ArcaneChargeTracker from '../core/ArcaneChargeTracker';
import Enemies from 'parser/shared/modules/Enemies';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import AlwaysBeCasting from '../core/AlwaysBeCasting';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

class TouchOfTheMagi extends Analyzer {
  static dependencies = {
    chargeTracker: ArcaneChargeTracker,
    alwaysBeCasting: AlwaysBeCasting,
    abilityTracker: AbilityTracker,
    enemies: Enemies,
  };
  protected chargeTracker!: ArcaneChargeTracker;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected abilityTracker!: AbilityTracker;
  protected enemies!: Enemies;

  hasSiphonStorm: boolean = this.selectedCombatant.hasTalent(TALENTS.EVOCATION_TALENT);
  hasNetherPrecision: boolean = this.selectedCombatant.hasTalent(TALENTS.NETHER_PRECISION_TALENT);

  touchCasts: {
    applied: number;
    removed: number;
    charges: number;
    activeTime?: number;
    damage: DamageEvent[];
    totalDamage: number;
    usage?: BoxRowEntry;
  }[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.TOUCH_OF_THE_MAGI_TALENT);
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.TOUCH_OF_THE_MAGI_DEBUFF),
      this.onTouch,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onTouch(event: ApplyDebuffEvent) {
    const removeDebuff: RemoveDebuffEvent | undefined = GetRelatedEvent(event, 'DebuffRemove');
    const damageEvents: DamageEvent[] = GetRelatedEvents(event, 'SpellDamage');
    const resourceChange: ResourceChangeEvent | undefined = GetRelatedEvent(event, 'Energize');
    const wastedCharges = resourceChange && resourceChange.waste;
    let damage = 0;
    damageEvents.forEach((d) => (damage += d.amount + (d.absorb || 0)));

    this.touchCasts.push({
      applied: event.timestamp,
      removed: removeDebuff?.timestamp || this.owner.fight.end_time,
      charges: wastedCharges !== undefined ? 0 + wastedCharges : 4,
      damage: damageEvents || [],
      totalDamage: damage,
    });
  }

  onFightEnd() {
    this.analyzeTouch();
  }

  analyzeTouch = () => {
    this.touchCasts.forEach((t) => {
      const activeTime = this.alwaysBeCasting.getActiveTimeMillisecondsInWindow(
        t.applied,
        t.removed || this.owner.fight.end_time,
      );
      const activeTimePercent = activeTime / ((t.removed || this.owner.fight.end_time) - t.applied);
      t.activeTime = activeTimePercent;
    });

    this.touchCasts.forEach((t) => {
      if (t.charges !== 0) {
        t.usage = {
          value: QualitativePerformance.Fail,
          tooltip: `Did not spend Arcane Charge before Touch (Had ${t.charges} charges)`,
        };
      } else if (t.activeTime && t.activeTime < 0.85) {
        t.usage = {
          value: QualitativePerformance.Fail,
          tooltip: `Low Active Time (${formatPercentage(t.activeTime)}).`,
        };
      } else if (t.activeTime && t.activeTime < 0.9) {
        t.usage = {
          value: QualitativePerformance.Ok,
          tooltip: `Low Active Time (${formatPercentage(t.activeTime)}).`,
        };
      } else {
        t.usage = { value: QualitativePerformance.Good, tooltip: `Good Touch of the Magi cast.` };
      }
    });
  };

  get averageDamage() {
    let total = 0;
    this.touchCasts.forEach((t) => (total += t.totalDamage));
    return total / this.abilityTracker.getAbility(TALENTS.TOUCH_OF_THE_MAGI_TALENT.id).casts;
  }

  get averageActiveTime() {
    let active = 0;
    this.touchCasts.forEach((t) => (active += t.activeTime || 0));
    return active / this.abilityTracker.getAbility(TALENTS.TOUCH_OF_THE_MAGI_TALENT.id).casts;
  }

  get touchMagiActiveTimeThresholds() {
    return {
      actual: this.averageActiveTime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
}

export default TouchOfTheMagi;
