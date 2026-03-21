import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Analyzer from 'parser/core/Analyzer';
import Events, {
  DamageEvent,
  ApplyDebuffEvent,
  RemoveDebuffEvent,
  GetRelatedEvent,
  GetRelatedEvents,
  RemoveBuffEvent,
  EventType,
} from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import ArcaneChargeTracker from '../core/ArcaneChargeTracker';
import AlwaysBeCasting from '../core/AlwaysBeCasting';
import { MageStatistic } from '../../shared/components';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { evaluateQualitativePerformanceByThreshold } from 'parser/ui/QualitativePerformance';

export default class TouchOfTheMagi extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    chargeTracker: ArcaneChargeTracker,
    alwaysBeCasting: AlwaysBeCasting,
    spellUsable: SpellUsable,
  };
  protected abilityTracker!: AbilityTracker;
  protected chargeTracker!: ArcaneChargeTracker;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected spellUsable!: SpellUsable;

  hasSiphonStorm: boolean = this.selectedCombatant.hasTalent(TALENTS.EVOCATION_TALENT);

  touchData: TouchOfTheMagiData[] = [];

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
    const damageEvents: DamageEvent[] = GetRelatedEvents(event, EventType.Damage);
    const removeDebuff: RemoveDebuffEvent | undefined = GetRelatedEvent(
      event,
      EventType.RemoveDebuff,
    );

    this.touchData.push({
      applied: event.timestamp,
      removed: removeDebuff?.timestamp || this.owner.fight.end_time,
      charges: this.chargeTracker.current,
      damage: damageEvents,
      totalDamage: this.calculateTotalDamage(damageEvents),
      surgeCD: this.spellUsable.cooldownRemaining(TALENTS.ARCANE_SURGE_TALENT.id, event.timestamp),
    });
  }

  private calculateTotalDamage(damageEvents: DamageEvent[]): number {
    let damage = 0;
    damageEvents.forEach((d) => (damage += d.amount + (d.absorb || 0)));
    return damage;
  }

  onFightEnd() {
    this.analyzeTouch();
  }

  analyzeTouch = () => {
    this.touchData.forEach((t) => {
      const activeTime = this.alwaysBeCasting.getActiveTimeMillisecondsInWindow(
        t.applied,
        t.removed || this.owner.fight.end_time,
      );
      const activeTimePercent = activeTime / ((t.removed || this.owner.fight.end_time) - t.applied);
      t.activeTime = activeTimePercent;
    });
  };

  get averageDamage() {
    let total = 0;
    this.touchData.forEach((t) => (total += t.totalDamage));
    return total / this.abilityTracker.getAbility(TALENTS.TOUCH_OF_THE_MAGI_TALENT.id).casts;
  }

  get averageActiveTime() {
    let active = 0;
    this.touchData.forEach((t) => (active += t.activeTime || 0));
    return active / this.abilityTracker.getAbility(TALENTS.TOUCH_OF_THE_MAGI_TALENT.id).casts;
  }

  activeTimeUtil(activePercent: number) {
    return evaluateQualitativePerformanceByThreshold({
      actual: activePercent,
      isGreaterThan: {
        perfect: 0.95,
        good: 0.9,
        ok: 0.8,
      },
    });
  }

  statistic() {
    return (
      <MageStatistic spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT}>
        <MageStatistic.Damage value={this.averageDamage} label="Average Damage" />
      </MageStatistic>
    );
  }
}

export interface TouchOfTheMagiData {
  applied: number;
  removed: number;
  charges: number;
  activeTime?: number;
  damage: DamageEvent[];
  totalDamage: number;
  surgeCD: number;
}
