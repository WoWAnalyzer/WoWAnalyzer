import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  DamageEvent,
  ApplyDebuffEvent,
  RemoveDebuffEvent,
  GetRelatedEvent,
  GetRelatedEvents,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import ArcaneChargeTracker from '../core/ArcaneChargeTracker';
import Enemies from 'parser/shared/modules/Enemies';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import AlwaysBeCasting from '../core/AlwaysBeCasting';

export default class TouchOfTheMagi extends Analyzer {
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

  touchCasts: TouchOfTheMagiCast[] = [];

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
    const ordinal = this.touchCasts.length + 1;
    const removeDebuff: RemoveDebuffEvent | undefined = GetRelatedEvent(event, 'DebuffRemove');
    const damageEvents: DamageEvent[] = GetRelatedEvents(event, 'SpellDamage');
    const refundBuff: RemoveBuffEvent | undefined = GetRelatedEvent(event, 'RefundBuff');
    let damage = 0;
    damageEvents.forEach((d) => (damage += d.amount + (d.absorb || 0)));

    this.touchCasts.push({
      ordinal,
      applied: event.timestamp,
      removed: removeDebuff?.timestamp || this.owner.fight.end_time,
      charges: this.chargeTracker.current,
      refundBuff: refundBuff ? true : false,
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

export interface TouchOfTheMagiCast {
  ordinal: number;
  applied: number;
  removed: number;
  charges: number;
  refundBuff: boolean;
  activeTime?: number;
  damage: DamageEvent[];
  totalDamage: number;
}
