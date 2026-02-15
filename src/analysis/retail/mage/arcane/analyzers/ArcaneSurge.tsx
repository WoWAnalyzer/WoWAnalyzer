import TALENTS from 'common/TALENTS/mage';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Events, { CastEvent, EventType, GetRelatedEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import { getManaPercentage } from '../../shared/helpers';
import Enemies from 'parser/shared/modules/Enemies';

export default class ArcaneSurge extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    enemies: Enemies,
  };
  protected abilityTracker!: AbilityTracker;
  protected enemies!: Enemies;

  hasSiphonStorm: boolean = this.selectedCombatant.hasTalent(TALENTS.EVOCATION_TALENT);

  surgeData: ArcaneSurgeData[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ARCANE_SURGE_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ARCANE_SURGE_TALENT),
      this.onSurgeCast,
    );
  }

  onSurgeCast(event: CastEvent) {
    const damage = GetRelatedEvent(event, EventType.Damage);
    const enemy = damage && this.enemies.getEntity(damage);
    this.surgeData.push({
      cast: event.timestamp,
      mana: getManaPercentage(event),
      touchActive: enemy && enemy.hasBuff(TALENTS.TOUCH_OF_THE_MAGI_TALENT) ? true : false,
    });
  }

  get averageManaPercent() {
    let manaPercentTotal = 0;
    this.surgeData.forEach((s) => (manaPercentTotal += s.mana || 0));
    return manaPercentTotal / this.abilityTracker.getAbility(TALENTS.ARCANE_SURGE_TALENT.id).casts;
  }

  get arcaneSurgeManaThresholds() {
    return {
      actual: this.averageManaPercent,
      isLessThan: {
        minor: 0.98,
        average: 0.95,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
}

export interface ArcaneSurgeData {
  cast: number;
  mana?: number;
  touchActive: boolean;
}
