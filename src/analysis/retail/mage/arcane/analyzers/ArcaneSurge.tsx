import TALENTS from 'common/TALENTS/mage';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Analyzer from 'parser/core/Analyzer';
import Events, { CastEvent, EventType, GetRelatedEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';

export default class ArcaneSurge extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

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
      touchActive: enemy && enemy.hasBuff(TALENTS.TOUCH_OF_THE_MAGI_TALENT) ? true : false,
    });
  }
}

export interface ArcaneSurgeData {
  cast: number;
  touchActive: boolean;
}
