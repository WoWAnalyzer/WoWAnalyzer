import Analyzer from 'parser/core/Analyzer';
import EnemyInstances from 'parser/shared/modules/EnemyInstances';

/**
 * Adds HP Percent information to the Enemy Entity 
 * @extends Analyzer
 */
class EnemyHpTracker extends Analyzer {
  static dependencies = {
    enemies: EnemyInstances,
  };

  on_damage(event) {
    if(event.targetIsFriendly) {
      return;
    }

    const enemy = this.enemies.getEntity(event);
    if(enemy && event.hitPoints && event.maxHitPoints && event.maxHitPoints !== 0) {
      enemy.hpPercent = event.hitPoints / event.maxHitPoints;
    }
  }
}

export default EnemyHpTracker;
