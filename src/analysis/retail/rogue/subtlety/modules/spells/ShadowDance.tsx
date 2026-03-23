import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  DamageEvent,
  ApplyBuffEvent,
  GetRelatedEvent,
  GetRelatedEvents,
  EventType,
  RemoveBuffEvent,
} from 'parser/core/Events';
import SPELLS from 'common/SPELLS/rogue';
import TALENTS from 'common/TALENTS/rogue';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import AlwaysBeCasting from 'analysis/retail/rogue/subtlety/modules/features/AlwaysBeCasting';
import { ThresholdStyle } from 'parser/core/ParseResults';

export default class ShadowDance extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    alwaysBeCasting: AlwaysBeCasting,
  };

  protected abilityTracker!: AbilityTracker;
  protected alwaysBeCasting!: AlwaysBeCasting;

  // Conditional talent checks
  hasShadowBlades: boolean = this.selectedCombatant.hasTalent(TALENTS.SHADOW_BLADES_TALENT);

  danceData: ShadowDanceData[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_DANCE_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  private onApplyBuff(event: ApplyBuffEvent) {
    const damageEvents = this.getDamageEvents(event);

    const removed = this.getRemoveTimestamp(event);
    this.danceData.push({
      applied: event.timestamp,
      removed: removed,
      damage: damageEvents,
      totalDamage: this.calculateTotalDamage(damageEvents),
      duration: removed - event.timestamp,
    });
  }

  private getRemoveTimestamp(event: ApplyBuffEvent): number {
    const removeBuff: RemoveBuffEvent | undefined = GetRelatedEvent(event, EventType.RemoveBuff);
    return removeBuff?.timestamp ?? this.owner.fight.end_time;
  }

  private getDamageEvents(event: ApplyBuffEvent): DamageEvent[] {
    return GetRelatedEvents(event, EventType.Damage);
  }

  private calculateTotalDamage(damageEvents: DamageEvent[]): number {
    return damageEvents.reduce((total, dmg) => total + dmg.amount + (dmg.absorb || 0), 0);
  }

  onFightEnd() {
    this.analyzeDance();
  }

  analyzeDance = () => {
    this.danceData.forEach((d) => {
      const activeTime = this.alwaysBeCasting.getActiveTimeMillisecondsInWindow(
        d.applied,
        d.removed || this.owner.fight.end_time,
      );
      const activeTimePercent = activeTime / ((d.removed || this.owner.fight.end_time) - d.applied);
      d.activeTime = activeTimePercent;
    });
  };

  get averageDamage() {
    let total = 0;
    this.danceData.forEach((d) => (total += d.totalDamage));
    return total / this.abilityTracker.getAbility(SPELLS.SHADOW_DANCE.id).casts;
  }

  get averageActiveTime() {
    let active = 0;
    this.danceData.forEach((d) => (active += d.activeTime || 0));
    return active / this.abilityTracker.getAbility(SPELLS.SHADOW_DANCE.id).casts;
  }

  get danceTotalDamage() {
    return this.danceData.reduce((total, dance) => total + dance.totalDamage, 0);
  }

  get shadowDanceActiveTimeThresholds() {
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

export interface ShadowDanceData {
  applied: number;
  removed: number;
  activeTime?: number;
  damage: DamageEvent[];
  totalDamage: number;
  duration: number;
  numberAbilitiesUsed?: number;
}
