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

export default class TouchOfTheMagi extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    chargeTracker: ArcaneChargeTracker,
    alwaysBeCasting: AlwaysBeCasting,
  };
  protected abilityTracker!: AbilityTracker;
  protected chargeTracker!: ArcaneChargeTracker;
  protected alwaysBeCasting!: AlwaysBeCasting;

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
    const damageEvents = this.getDamageEvents(event);

    this.touchData.push({
      applied: event.timestamp,
      removed: this.getRemoveTimestamp(event),
      charges: this.chargeTracker.current,
      refundBuff: this.hasRefundBuff(event),
      damage: damageEvents,
      totalDamage: this.calculateTotalDamage(damageEvents),
    });
  }

  private getRemoveTimestamp(event: ApplyDebuffEvent): number {
    const removeDebuff: RemoveDebuffEvent | undefined = GetRelatedEvent(
      event,
      EventType.RemoveDebuff,
    );
    return removeDebuff?.timestamp ?? this.owner.fight.end_time;
  }

  private getDamageEvents(event: ApplyDebuffEvent): DamageEvent[] {
    return GetRelatedEvents(event, EventType.Damage);
  }

  private hasRefundBuff(event: ApplyDebuffEvent): boolean {
    const refundBuff: RemoveBuffEvent | undefined = GetRelatedEvent(event, 'refundBuff');
    return refundBuff !== undefined;
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
  refundBuff: boolean;
  activeTime?: number;
  damage: DamageEvent[];
  totalDamage: number;
}
